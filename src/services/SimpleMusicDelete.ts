import {NativeModules, PermissionsAndroid, Platform, Alert} from 'react-native';
import RNFS from 'react-native-fs';

const {SimpleDeleteModule, StorageAccessModule} = NativeModules;

export class SimpleMusicDelete {
  static async requestDeletePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    try {
      // For Android 13+ (API 33+)
      if (Platform.Version >= 33) {
        // Android 13 doesn't need WRITE_EXTERNAL_STORAGE
        return true;
      }
      
      // For Android 11-12 (API 30-32)
      if (Platform.Version >= 30) {
        // Check if we have manage storage permission
        if (StorageAccessModule) {
          const hasPermission = await StorageAccessModule.checkManageStoragePermission();
          if (!hasPermission) {
            Alert.alert(
              'Permission Required',
              'Android 11+ requires special permission to delete files. Please grant "All files access" in the next screen.',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Open Settings', onPress: () => {
                  StorageAccessModule.requestManageStoragePermission();
                }}
              ]
            );
            return false;
          }
          return true;
        }
      }
      
      // For Android 10 and below - request WRITE_EXTERNAL_STORAGE
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'AniMusic needs permission to delete music files from your device.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
      
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }
  
  static async deleteFile(filePath: string): Promise<boolean> {
    console.log('SimpleMusicDelete: Attempting to delete:', filePath);
    
    try {
      // First request permission
      const hasPermission = await this.requestDeletePermission();
      console.log('Permission granted:', hasPermission);
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Cannot delete file without storage permission. Please grant permission and try again.',
          [{text: 'OK'}]
        );
        return false;
      }
      
      // Clean path
      const cleanPath = filePath.replace('file://', '');
      
      // Try native module first (most reliable)
      if (SimpleDeleteModule) {
        try {
          console.log('Using SimpleDeleteModule');
          const result = await SimpleDeleteModule.deleteMusic(cleanPath);
          console.log('Native delete result:', result);
          return true;
        } catch (nativeError) {
          console.log('Native module failed:', nativeError);
          // Continue to fallback methods
        }
      }
      
      // Fallback to RNFS
      try {
        const exists = await RNFS.exists(cleanPath);
        console.log('File exists:', exists);
        
        if (exists) {
          await RNFS.unlink(cleanPath);
          console.log('RNFS delete successful');
          
          // Verify deletion
          const stillExists = await RNFS.exists(cleanPath);
          if (!stillExists) {
            return true;
          }
        } else {
          // File doesn't exist, consider it deleted
          return true;
        }
      } catch (rnfsError) {
        console.error('RNFS delete failed:', rnfsError);
      }
      
      // If we get here, deletion failed
      Alert.alert(
        'Delete Failed',
        'Unable to delete the file. You may need to delete it manually using a file manager app.',
        [{text: 'OK'}]
      );
      return false;
      
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'An error occurred while deleting the file.');
      return false;
    }
  }
}