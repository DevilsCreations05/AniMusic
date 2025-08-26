import {NativeModules, Platform} from 'react-native';
import RNFS from 'react-native-fs';

const {FileDeleteModule} = NativeModules;

export class FileDeleteService {
  static async deleteFile(filePath: string): Promise<boolean> {
    console.log('FileDeleteService: Attempting to delete:', filePath);
    
    // Clean the file path
    let cleanPath = filePath;
    if (filePath.startsWith('file://')) {
      cleanPath = filePath.replace('file://', '');
    }
    
    if (Platform.OS === 'android') {
      try {
        // First try the native module (most reliable for Android)
        if (FileDeleteModule) {
          console.log('Using native FileDeleteModule');
          const result = await FileDeleteModule.deleteFile(cleanPath);
          console.log('Native module delete result:', result);
          return true;
        }
      } catch (nativeError) {
        console.log('Native module failed, trying RNFS:', nativeError);
      }
      
      // Fallback to RNFS
      try {
        // Try multiple approaches with RNFS
        const exists = await RNFS.exists(cleanPath);
        console.log('File exists check:', exists);
        
        if (exists) {
          // Try with clean path first
          await RNFS.unlink(cleanPath);
          console.log('RNFS delete successful with clean path');
          return true;
        } else {
          // Try with original path
          const existsOriginal = await RNFS.exists(filePath);
          if (existsOriginal) {
            await RNFS.unlink(filePath);
            console.log('RNFS delete successful with original path');
            return true;
          }
        }
      } catch (rnfsError) {
        console.error('RNFS delete failed:', rnfsError);
      }
      
      // Last resort: try with file:// prefix
      try {
        const fileUri = filePath.startsWith('file://') ? filePath : `file://${cleanPath}`;
        await RNFS.unlink(fileUri);
        console.log('RNFS delete successful with file URI');
        return true;
      } catch (uriError) {
        console.error('URI delete failed:', uriError);
        throw new Error('Failed to delete file using all methods');
      }
      
    } else {
      // iOS - use RNFS directly
      try {
        await RNFS.unlink(cleanPath);
        return true;
      } catch (error) {
        console.error('iOS delete failed:', error);
        throw error;
      }
    }
  }
}