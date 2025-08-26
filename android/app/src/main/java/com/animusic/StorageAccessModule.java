package com.animusic;

import android.app.Activity;
import android.content.Intent;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Log;
import android.content.Context;
import android.app.RecoverableSecurityException;
import android.app.PendingIntent;
import android.content.IntentSender;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;

public class StorageAccessModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final String TAG = "StorageAccessModule";
    private static final int DELETE_REQUEST_CODE = 1001;
    private static final int MANAGE_STORAGE_REQUEST_CODE = 1002;
    private Promise deletePromise;
    private String fileToDelete;

    public StorageAccessModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "StorageAccessModule";
    }

    @ReactMethod
    public void checkManageStoragePermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            boolean hasPermission = Environment.isExternalStorageManager();
            promise.resolve(hasPermission);
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void requestManageStoragePermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                try {
                    Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                    Uri uri = Uri.fromParts("package", getReactApplicationContext().getPackageName(), null);
                    intent.setData(uri);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getReactApplicationContext().startActivity(intent);
                    promise.resolve(true);
                } catch (Exception e) {
                    Intent intent = new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getReactApplicationContext().startActivity(intent);
                    promise.resolve(true);
                }
            } else {
                promise.resolve(true);
            }
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void deleteFileWithPermission(String filePath, Promise promise) {
        this.deletePromise = promise;
        this.fileToDelete = filePath;
        
        Log.d(TAG, "Attempting to delete file: " + filePath);
        
        // Clean the file path
        String cleanPath = filePath;
        if (filePath.startsWith("file://")) {
            cleanPath = filePath.replace("file://", "");
        }
        
        // For Android 11+, check if we have manage storage permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                Log.d(TAG, "Need MANAGE_EXTERNAL_STORAGE permission");
                promise.reject("PERMISSION_NEEDED", "Please grant 'All files access' permission in app settings");
                return;
            }
        }
        
        // Try direct deletion first
        File file = new File(cleanPath);
        if (file.exists()) {
            if (file.canWrite()) {
                boolean deleted = file.delete();
                if (deleted) {
                    Log.d(TAG, "File deleted successfully");
                    // Also remove from MediaStore
                    removeFromMediaStore(cleanPath);
                    promise.resolve(true);
                    return;
                }
            }
            
            // If direct deletion failed, try with MediaStore
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                deleteViaMediaStore(cleanPath, promise);
            } else {
                // For older Android versions
                file.setWritable(true);
                file.setReadable(true);
                boolean deleted = file.delete();
                if (deleted) {
                    removeFromMediaStore(cleanPath);
                    promise.resolve(true);
                } else {
                    promise.reject("DELETE_FAILED", "Could not delete file");
                }
            }
        } else {
            Log.e(TAG, "File does not exist: " + cleanPath);
            promise.reject("FILE_NOT_FOUND", "File does not exist");
        }
    }

    private void deleteViaMediaStore(String filePath, Promise promise) {
        try {
            ContentResolver resolver = getReactApplicationContext().getContentResolver();
            
            // Find the file in MediaStore
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
                Uri deleteUri = Uri.withAppendedPath(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, String.valueOf(id));
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    // For Android 11+, might need to handle RecoverableSecurityException
                    try {
                        int deleted = resolver.delete(deleteUri, null, null);
                        if (deleted > 0) {
                            // Also try to delete the actual file
                            File file = new File(filePath);
                            file.delete();
                            promise.resolve(true);
                        } else {
                            promise.reject("DELETE_FAILED", "Could not delete from MediaStore");
                        }
                    } catch (SecurityException e) {
                        Log.e(TAG, "Security exception, need user permission", e);
                        promise.reject("PERMISSION_DENIED", "Cannot delete file - permission denied");
                    }
                } else {
                    // For Android 10 and below
                    int deleted = resolver.delete(deleteUri, null, null);
                    if (deleted > 0) {
                        File file = new File(filePath);
                        file.delete();
                        promise.resolve(true);
                    } else {
                        promise.reject("DELETE_FAILED", "Could not delete from MediaStore");
                    }
                }
                cursor.close();
            } else {
                // File not in MediaStore, try direct deletion
                File file = new File(filePath);
                if (file.exists()) {
                    file.setWritable(true);
                    boolean deleted = file.delete();
                    if (deleted) {
                        promise.resolve(true);
                    } else {
                        promise.reject("DELETE_FAILED", "Could not delete file");
                    }
                } else {
                    promise.reject("FILE_NOT_FOUND", "File not found");
                }
            }
            
            if (cursor != null) {
                cursor.close();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error deleting via MediaStore", e);
            promise.reject("DELETE_ERROR", e.getMessage());
        }
    }

    private void removeFromMediaStore(String filePath) {
        try {
            ContentResolver resolver = getReactApplicationContext().getContentResolver();
            resolver.delete(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                MediaStore.Audio.Media.DATA + "=?",
                new String[]{filePath}
            );
        } catch (Exception e) {
            Log.e(TAG, "Error removing from MediaStore", e);
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        // Handle activity results if needed
    }

    @Override
    public void onNewIntent(Intent intent) {
        // Handle new intent if needed
    }
}