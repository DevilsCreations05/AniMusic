import {NativeModules, Platform} from 'react-native';
import RNFS from 'react-native-fs';

const {MediaStoreDelete} = NativeModules;

export class ProperDeleteService {
  static async deleteFile(filePath: string): Promise<boolean> {
    console.log('ProperDeleteService: Attempting to delete:', filePath);
    
    if (Platform.OS !== 'android') {
      // iOS - use RNFS
      try {
        await RNFS.unlink(filePath.replace('file://', ''));
        return true;
      } catch (error) {
        console.error('iOS delete error:', error);
        return false;
      }
    }
    
    // Android - use MediaStore API which shows system permission dialog
    if (MediaStoreDelete) {
      try {
        console.log('Using MediaStoreDelete module');
        // This will show the Android system delete permission dialog
        const result = await MediaStoreDelete.deleteAudioFile(filePath);
        console.log('Delete result:', result);
        return true;
      } catch (error: any) {
        if (error.code === 'USER_DENIED') {
          console.log('User denied deletion');
          // User cancelled the delete dialog
          return false;
        }
        console.error('MediaStore delete error:', error);
        
        // Fallback to RNFS for older Android versions
        if (Platform.Version < 30) {
          try {
            const cleanPath = filePath.replace('file://', '');
            await RNFS.unlink(cleanPath);
            return true;
          } catch (rnfsError) {
            console.error('RNFS delete error:', rnfsError);
            return false;
          }
        }
        
        return false;
      }
    } else {
      console.error('MediaStoreDelete module not available');
      return false;
    }
  }
}