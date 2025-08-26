package com.animusic;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

public class FileDeleteModule extends ReactContextBaseJavaModule {
    private static final String TAG = "FileDeleteModule";

    public FileDeleteModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "FileDeleteModule";
    }

    @ReactMethod
    public void deleteFile(String filePath, Promise promise) {
        try {
            Log.d(TAG, "Attempting to delete file: " + filePath);
            
            // Clean the file path
            String cleanPath = filePath;
            if (filePath.startsWith("file://")) {
                cleanPath = filePath.replace("file://", "");
            }
            
            // First, try to delete from MediaStore (this is crucial for Android 10+)
            boolean mediaStoreDeleted = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                mediaStoreDeleted = deleteViaMediaStore(cleanPath);
                Log.d(TAG, "MediaStore deletion result: " + mediaStoreDeleted);
            }
            
            // Always try direct file deletion regardless of MediaStore result
            File file = new File(cleanPath);
            boolean fileExists = file.exists();
            boolean fileDeleted = false;
            
            Log.d(TAG, "File exists: " + fileExists + " at path: " + cleanPath);
            
            if (fileExists) {
                // Make file writable first
                file.setWritable(true);
                file.setReadable(true);
                
                // Try to delete
                fileDeleted = file.delete();
                Log.d(TAG, "Direct file deletion result: " + fileDeleted);
                
                // If still exists, try with canonical path
                if (!fileDeleted && file.exists()) {
                    File canonicalFile = new File(file.getCanonicalPath());
                    fileDeleted = canonicalFile.delete();
                    Log.d(TAG, "Canonical path deletion result: " + fileDeleted);
                }
            }
            
            // Check if file still exists
            boolean stillExists = new File(cleanPath).exists();
            Log.d(TAG, "File still exists after deletion attempts: " + stillExists);
            
            if (!stillExists || fileDeleted || mediaStoreDeleted) {
                Log.d(TAG, "File deletion successful");
                promise.resolve(true);
            } else {
                Log.e(TAG, "Failed to delete file: " + cleanPath);
                promise.reject("DELETE_FAILED", "Could not delete file. File may be in use or protected.");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error deleting file", e);
            promise.reject("DELETE_ERROR", e.getMessage());
        }
    }
    
    private boolean deleteViaMediaStore(String filePath) {
        try {
            ContentResolver resolver = getReactApplicationContext().getContentResolver();
            
            // Query MediaStore for the file
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
                
                int rowsDeleted = resolver.delete(deleteUri, null, null);
                cursor.close();
                
                if (rowsDeleted > 0) {
                    // Also try to delete the actual file
                    File file = new File(filePath);
                    if (file.exists()) {
                        file.delete();
                    }
                    return true;
                }
            }
            
            if (cursor != null) {
                cursor.close();
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error deleting via MediaStore", e);
        }
        
        return false;
    }
}