package com.animusic;

import android.os.Build;
import android.os.Environment;
import android.util.Log;
import android.content.ContentResolver;
import android.provider.MediaStore;
import android.net.Uri;
import android.database.Cursor;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.IOException;

public class SimpleDeleteModule extends ReactContextBaseJavaModule {
    private static final String TAG = "SimpleDeleteModule";

    public SimpleDeleteModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SimpleDeleteModule";
    }

    @ReactMethod
    public void deleteMusic(String filePath, Promise promise) {
        Log.d(TAG, "deleteMusic called with: " + filePath);
        
        try {
            // Clean path
            String cleanPath = filePath.replace("file://", "");
            Log.d(TAG, "Clean path: " + cleanPath);
            
            // Method 1: Direct file deletion (works if app has permission)
            File file = new File(cleanPath);
            boolean fileExists = file.exists();
            Log.d(TAG, "File exists: " + fileExists);
            
            if (fileExists) {
                // Try to make it writable
                boolean canWrite = file.canWrite();
                Log.d(TAG, "Can write: " + canWrite);
                
                if (!canWrite) {
                    file.setWritable(true, false);
                    file.setReadable(true, false);
                    Log.d(TAG, "Made file writable");
                }
                
                // Try different delete methods
                boolean deleted = false;
                
                // Method 1: Direct delete
                deleted = file.delete();
                Log.d(TAG, "Direct delete result: " + deleted);
                
                // Method 2: Use canonical path
                if (!deleted) {
                    try {
                        File canonicalFile = file.getCanonicalFile();
                        deleted = canonicalFile.delete();
                        Log.d(TAG, "Canonical delete result: " + deleted);
                    } catch (IOException e) {
                        Log.e(TAG, "Canonical path error", e);
                    }
                }
                
                // Method 3: Runtime exec (last resort)
                if (!deleted && file.exists()) {
                    try {
                        Runtime.getRuntime().exec(new String[]{"rm", "-f", cleanPath});
                        Thread.sleep(100); // Give it time to execute
                        deleted = !file.exists();
                        Log.d(TAG, "Runtime exec delete result: " + deleted);
                    } catch (Exception e) {
                        Log.e(TAG, "Runtime exec error", e);
                    }
                }
                
                // Also try to remove from MediaStore
                removeFromMediaStore(cleanPath);
                
                // Check final result
                boolean stillExists = new File(cleanPath).exists();
                Log.d(TAG, "File still exists: " + stillExists);
                
                if (!stillExists) {
                    Log.d(TAG, "File successfully deleted");
                    promise.resolve(true);
                } else {
                    Log.e(TAG, "File still exists after all attempts");
                    promise.reject("DELETE_FAILED", "Unable to delete file. You may need to manually delete it from your file manager.");
                }
            } else {
                Log.e(TAG, "File not found");
                // File doesn't exist, consider it deleted
                promise.resolve(true);
            }
        } catch (Exception e) {
            Log.e(TAG, "Delete error", e);
            promise.reject("ERROR", e.getMessage());
        }
    }
    
    private void removeFromMediaStore(String filePath) {
        try {
            ContentResolver resolver = getReactApplicationContext().getContentResolver();
            
            // Try to delete from MediaStore
            int rowsDeleted = resolver.delete(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                MediaStore.Audio.Media.DATA + "=?",
                new String[]{filePath}
            );
            
            Log.d(TAG, "Removed from MediaStore: " + rowsDeleted + " rows");
            
            // Also try with FILES table
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                Uri filesUri = MediaStore.Files.getContentUri("external");
                int filesDeleted = resolver.delete(
                    filesUri,
                    MediaStore.Files.FileColumns.DATA + "=?",
                    new String[]{filePath}
                );
                Log.d(TAG, "Removed from Files: " + filesDeleted + " rows");
            }
        } catch (Exception e) {
            Log.e(TAG, "MediaStore removal error", e);
        }
    }
}