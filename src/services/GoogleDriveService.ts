import RNFS from 'react-native-fs';
import { GOOGLE_AUTH_CONFIG } from '../config/googleAuth.config';
import GoogleAuthService from './GoogleAuthService';

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private authService: GoogleAuthService;

  private constructor() {
    this.authService = GoogleAuthService.getInstance();
  }

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async uploadFile(
    filePath: string,
    fileName: string,
    mimeType: string = 'audio/mpeg',
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; fileId?: string; webViewLink?: string; error?: string }> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        // Try to sign in
        const signedIn = await this.authService.signIn();
        if (!signedIn) {
          return { success: false, error: 'Failed to authenticate with Google' };
        }
      }

      const token = await this.authService.getAccessToken();
      if (!token) {
        return { success: false, error: 'No access token available' };
      }

      // Read file
      const fileContent = await RNFS.readFile(filePath, 'base64');
      
      // Create file metadata
      const metadata = {
        name: fileName,
        mimeType: mimeType,
        parents: ['root'], // Upload to root of Drive
      };

      // Create multipart request body
      const boundary = 'foo_bar_baz';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartBody = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n` +
        'Content-Transfer-Encoding: base64\r\n\r\n' +
        fileContent +
        closeDelimiter;

      // Upload to Google Drive
      console.log('Uploading file to Google Drive...');
      
      const response = await fetch(
        `${GOOGLE_AUTH_CONFIG.DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name,webViewLink,webContentLink`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Upload failed:', error);
        return { success: false, error: `Upload failed: ${response.status}` };
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      // Make file publicly accessible
      await this.makeFilePublic(result.id, token);

      // Get shareable link
      const shareableLink = await this.getShareableLink(result.id, token);

      return {
        success: true,
        fileId: result.id,
        webViewLink: shareableLink || result.webViewLink,
      };
    } catch (error: any) {
      console.error('Error uploading to Google Drive:', error);
      return { success: false, error: error.message };
    }
  }

  private async makeFilePublic(fileId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `${GOOGLE_AUTH_CONFIG.DRIVE_FILES_URL}/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone',
          }),
        }
      );

      if (!response.ok) {
        console.error('Failed to make file public:', await response.text());
      } else {
        console.log('File made public successfully');
      }
    } catch (error) {
      console.error('Error making file public:', error);
    }
  }

  private async getShareableLink(fileId: string, accessToken: string): Promise<string> {
    try {
      const response = await fetch(
        `${GOOGLE_AUTH_CONFIG.DRIVE_FILES_URL}/${fileId}?fields=webViewLink,webContentLink`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
      }
    } catch (error) {
      console.error('Error getting shareable link:', error);
    }
    
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
}

export default GoogleDriveService;