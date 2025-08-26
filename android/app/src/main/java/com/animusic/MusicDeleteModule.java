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

public class MusicDeleteModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MusicDelete";
    private static final int DELETE_REQUEST_CODE = 9999;
    private Promise mPromise;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == DELETE_REQUEST_CODE) {
                if (mPromise != null) {
                    if (resultCode == Activity.RESULT_OK) {
                        mPromise.resolve(true);
                    } else {
                        mPromise.resolve(false);
                    }
                    mPromise = null;
                }
            }
        }
    };

    public MusicDeleteModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(mActivityEventListener);
    }

    @Override
    public String getName() {
        return "MusicDelete";
    }

    @ReactMethod
    public void deleteFile(String filePath, Promise promise) {
        mPromise = promise;
        String cleanPath = filePath.replace("file://", "");
        
        Log.d(TAG, "Attempting to delete: " + cleanPath);
        
        // For Android 11+ (API 30+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                ContentResolver resolver = getReactApplicationContext().getContentResolver();
                
                // Find the file in MediaStore
                Uri collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                String[] projection = new String[]{MediaStore.Audio.Media._ID};
                String selection = MediaStore.Audio.Media.DATA + "=?";
                String[] selectionArgs = new String[]{cleanPath};
                
                Cursor cursor = resolver.query(
                    collection,
                    projection,
                    selection,
                    selectionArgs,
                    null
                );
                
                if (cursor != null && cursor.moveToFirst()) {
                    long id = cursor.getLong(0);
                    Uri deleteUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id);
                    cursor.close();
                    
                    Log.d(TAG, "Found in MediaStore with ID: " + id);
                    
                    // Create delete request
                    ArrayList<Uri> uris = new ArrayList<>();
                    uris.add(deleteUri);
                    
                    PendingIntent pi = MediaStore.createDeleteRequest(resolver, uris);
                    
                    Activity activity = getCurrentActivity();
                    if (activity != null) {
                        activity.startIntentSenderForResult(
                            pi.getIntentSender(),
                            DELETE_REQUEST_CODE,
                            null, 0, 0, 0
                        );
                    } else {
                        promise.resolve(false);
                        mPromise = null;
                    }
                } else {
                    // Not in MediaStore, try direct delete
                    File file = new File(cleanPath);
                    if (file.exists() && file.delete()) {
                        promise.resolve(true);
                    } else {
                        promise.resolve(false);
                    }
                    mPromise = null;
                }
                
                if (cursor != null) cursor.close();
                
            } catch (Exception e) {
                Log.e(TAG, "Error", e);
                promise.resolve(false);
                mPromise = null;
            }
        } else {
            // For older Android versions
            try {
                File file = new File(cleanPath);
                if (file.exists() && file.delete()) {
                    promise.resolve(true);
                } else {
                    promise.resolve(false);
                }
                mPromise = null;
            } catch (Exception e) {
                promise.resolve(false);
                mPromise = null;
            }
        }
    }
}