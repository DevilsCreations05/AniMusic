package com.animusic;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Intent;
import android.content.IntentSender;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;

public class MediaStoreDeleteModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MediaStoreDelete";
    private static final int DELETE_REQUEST_CODE = 42;
    private Promise deletePromise;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == DELETE_REQUEST_CODE) {
                if (deletePromise != null) {
                    if (resultCode == Activity.RESULT_OK) {
                        Log.d(TAG, "User approved deletion");
                        deletePromise.resolve(true);
                    } else {
                        Log.d(TAG, "User denied deletion");
                        deletePromise.reject("USER_DENIED", "User denied deletion");
                    }
                    deletePromise = null;
                }
            }
        }
    };

    public MediaStoreDeleteModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(activityEventListener);
    }

    @Override
    public String getName() {
        return "MediaStoreDelete";
    }

    @ReactMethod
    public void deleteAudioFile(String filePath, Promise promise) {
        Log.d(TAG, "deleteAudioFile called with: " + filePath);
        this.deletePromise = promise;

        try {
            // Clean the file path
            String cleanPath = filePath.replace("file://", "");
            
            // For Android 11+ (API 30+), use MediaStore.createDeleteRequest
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                deleteWithUserPermission(cleanPath);
            } 
            // For Android 10 (API 29), try RecoverableSecurityException
            else if (Build.VERSION.SDK_INT == Build.VERSION_CODES.Q) {
                deleteWithRecoverableException(cleanPath);
            }
            // For older versions, try direct deletion
            else {
                deleteDirectly(cleanPath);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in deleteAudioFile", e);
            if (deletePromise != null) {
                deletePromise.reject("ERROR", e.getMessage());
                deletePromise = null;
            }
        }
    }

    private void deleteWithUserPermission(String filePath) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                ContentResolver resolver = getReactApplicationContext().getContentResolver();
                
                // Find the audio file in MediaStore
                Uri collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                String selection = MediaStore.Audio.Media.DATA + "=?";
                String[] selectionArgs = new String[]{filePath};
                
                Cursor cursor = resolver.query(
                    collection,
                    new String[]{MediaStore.Audio.Media._ID},
                    selection,
                    selectionArgs,
                    null
                );
                
                if (cursor != null && cursor.moveToFirst()) {
                    long id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID));
                    Uri deleteUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id);
                    cursor.close();
                    
                    Log.d(TAG, "Found file in MediaStore with ID: " + id);
                    
                    // Create delete request - THIS WILL SHOW THE SYSTEM PERMISSION DIALOG
                    ArrayList<Uri> urisToDelete = new ArrayList<>();
                    urisToDelete.add(deleteUri);
                    
                    PendingIntent pendingIntent = MediaStore.createDeleteRequest(
                        resolver, 
                        urisToDelete
                    );
                    
                    // Launch the system delete permission dialog
                    Activity activity = getCurrentActivity();
                    if (activity != null) {
                        IntentSender intentSender = pendingIntent.getIntentSender();
                        activity.startIntentSenderForResult(
                            intentSender,
                            DELETE_REQUEST_CODE,
                            null, 0, 0, 0
                        );
                        Log.d(TAG, "Delete permission dialog launched");
                    } else {
                        Log.e(TAG, "No current activity");
                        if (deletePromise != null) {
                            deletePromise.reject("NO_ACTIVITY", "No current activity");
                            deletePromise = null;
                        }
                    }
                } else {
                    Log.e(TAG, "File not found in MediaStore");
                    // File not in MediaStore, try direct deletion
                    deleteDirectly(filePath);
                }
                
                if (cursor != null) {
                    cursor.close();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error in deleteWithUserPermission", e);
                if (deletePromise != null) {
                    deletePromise.reject("ERROR", e.getMessage());
                    deletePromise = null;
                }
            }
        }
    }

    private void deleteWithRecoverableException(String filePath) {
        try {
            ContentResolver resolver = getReactApplicationContext().getContentResolver();
            
            // Find and try to delete
            Uri collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
            String selection = MediaStore.Audio.Media.DATA + "=?";
            String[] selectionArgs = new String[]{filePath};
            
            Cursor cursor = resolver.query(
                collection,
                new String[]{MediaStore.Audio.Media._ID},
                selection,
                selectionArgs,
                null
            );
            
            if (cursor != null && cursor.moveToFirst()) {
                long id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID));
                Uri deleteUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id);
                cursor.close();
                
                // Try to delete - may throw RecoverableSecurityException
                int deleted = resolver.delete(deleteUri, null, null);
                
                if (deleted > 0) {
                    Log.d(TAG, "File deleted successfully");
                    if (deletePromise != null) {
                        deletePromise.resolve(true);
                        deletePromise = null;
                    }
                } else {
                    deleteDirectly(filePath);
                }
            } else {
                deleteDirectly(filePath);
            }
            
            if (cursor != null) {
                cursor.close();
            }
        } catch (SecurityException e) {
            Log.e(TAG, "Security exception in deleteWithRecoverableException", e);
            deleteDirectly(filePath);
        } catch (Exception e) {
            Log.e(TAG, "Error in deleteWithRecoverableException", e);
            if (deletePromise != null) {
                deletePromise.reject("ERROR", e.getMessage());
                deletePromise = null;
            }
        }
    }

    private void deleteDirectly(String filePath) {
        try {
            File file = new File(filePath);
            if (file.exists()) {
                boolean deleted = file.delete();
                Log.d(TAG, "Direct file deletion result: " + deleted);
                
                if (deletePromise != null) {
                    if (deleted) {
                        deletePromise.resolve(true);
                    } else {
                        deletePromise.reject("DELETE_FAILED", "Could not delete file");
                    }
                    deletePromise = null;
                }
            } else {
                Log.d(TAG, "File doesn't exist, considering it deleted");
                if (deletePromise != null) {
                    deletePromise.resolve(true);
                    deletePromise = null;
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in deleteDirectly", e);
            if (deletePromise != null) {
                deletePromise.reject("ERROR", e.getMessage());
                deletePromise = null;
            }
        }
    }
}