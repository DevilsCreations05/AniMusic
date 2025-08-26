import {NativeModules, Platform, Alert} from 'react-native';

const {MusicDelete} = NativeModules;

export class FinalDeleteService {
  static async deleteFile(filePath: string): Promise<boolean> {
    console.log('FinalDeleteService: Deleting:', filePath);
    
    if (Platform.OS !== 'android') {
      return false;
    }
    
    if (!MusicDelete) {
      console.error('MusicDelete module not found - rebuild the app');
      Alert.alert('Error', 'Delete module not found. Please rebuild the app.');
      return false;
    }
    
    try {
      // This will show Android's system delete dialog for Android 11+
      // Or delete directly for older versions
      const result = await MusicDelete.deleteFile(filePath);
      
      if (result) {
        console.log('File deleted successfully');
        return true;
      } else {
        console.log('Delete failed or user cancelled');
        return false;
      }
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }
}