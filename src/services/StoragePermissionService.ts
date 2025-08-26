import {NativeModules, Platform, Alert} from 'react-native';

const {StorageAccessModule} = NativeModules;

export class StoragePermissionService {
  static async checkAndRequestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // Check if we have manage storage permission (Android 11+)
      if (StorageAccessModule) {
        const hasPermission = await StorageAccessModule.checkManageStoragePermission();
        
        if (!hasPermission) {
          // Show alert to user
          return new Promise((resolve) => {
            Alert.alert(
              'Permission Required',
              'To delete music files, AniMusic needs "All files access" permission. This will open the settings page where you can grant this permission.',
              [
                {
                  text: 'Cancel',
                  onPress: () => resolve(false),
                  style: 'cancel',
                },
                {
                  text: 'Open Settings',
                  onPress: async () => {
                    await StorageAccessModule.requestManageStoragePermission();
                    // Give user time to grant permission
                    setTimeout(async () => {
                      const granted = await StorageAccessModule.checkManageStoragePermission();
                      resolve(granted);
                    }, 1000);
                  },
                },
              ],
            );
          });
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error checking storage permission:', error);
    }
    
    return false;
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      // First check permission
      const hasPermission = await this.checkAndRequestPermission();
      if (!hasPermission) {
        throw new Error('Storage permission not granted');
      }

      // Use the native module to delete
      if (StorageAccessModule) {
        const result = await StorageAccessModule.deleteFileWithPermission(filePath);
        return result;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
    
    return false;
  }
}