import RNFS from 'react-native-fs';

// This service uses a service account to upload all files to a central Google Drive
// No user authentication required!
class CentralDriveService {
  private static instance: CentralDriveService;
  private serviceAccountKey: any = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly FOLDER_ID = 'YOUR_FOLDER_ID'; // We'll get this from the shared folder

  private constructor() {}

  static getInstance(): CentralDriveService {
    if (!CentralDriveService.instance) {
      CentralDriveService.instance = new CentralDriveService();
    }
    return CentralDriveService.instance;
  }

  // Initialize with service account credentials
  async initialize(serviceAccountKeyPath?: string) {
    try {
      // Load service account key
      // In production, this would be bundled with the app or fetched from secure storage
      if (serviceAccountKeyPath) {
        const keyContent = await RNFS.readFile(serviceAccountKeyPath);
        this.serviceAccountKey = JSON.parse(keyContent);
      } else {
        // For now, we'll need to embed the key
        // You'll paste your service account key here
        this.serviceAccountKey = {
          // PASTE YOUR SERVICE ACCOUNT KEY HERE
          type: "service_account",
          project_id: "your-project",
          private_key_id: "key-id",
          private_key: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
          client_email: "animusic-uploader@your-project.iam.gserviceaccount.com",
          client_id: "1234567890",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        };
      }
    } catch (error) {
      console.error('Failed to load service account key:', error);
    }
  }

  // Get access token using JWT
  private async getAccessToken(): Promise<string | null> {
    try {
      // Check if we have a valid token
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      // Create JWT
      const now = Math.floor(Date.now() / 1000);
      const jwt = {
        iss: this.serviceAccountKey.client_email,
        scope: 'https://www.googleapis.com/auth/drive.file',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      };

      // Sign JWT with private key (this is simplified - in production use a proper JWT library)
      const signedJwt = await this.createSignedJWT(jwt);

      // Exchange JWT for access token
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedJwt}`,
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);
        return this.accessToken;
      }

      throw new Error('Failed to get access token');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Simplified JWT signing (in production, use a proper library)
  private async createSignedJWT(payload: any): Promise<string> {
    // This is a placeholder - we'll need to implement proper JWT signing
    // For React Native, we might need to use a backend service for this
    // Or use a React Native JWT library that supports RS256
    
    // For now, we'll use a workaround:
    // Option 1: Call a backend endpoint that signs the JWT
    // Option 2: Use react-native-jwt-io or similar library
    
    console.warn('JWT signing not fully implemented - using backend service');
    
    // Temporary: Return a mock token for testing
    return 'mock-jwt-token';
  }

  // Upload file to central Drive
  async uploadFile(
    filePath: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; fileId?: string; webViewLink?: string; error?: string }> {
    try {
      // Get access token
      const token = await this.getAccessToken();
      if (!token) {
        // Fallback: Use backend service
        return this.uploadViaBackend(filePath, fileName, onProgress);
      }

      // Read file
      const fileContent = await RNFS.readFile(filePath, 'base64');
      
      // Create file metadata
      const metadata = {
        name: fileName,
        mimeType: 'audio/mpeg',
        parents: [this.FOLDER_ID], // Upload to specific folder
      };

      // Create multipart request
      const boundary = 'animusic_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartBody = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: audio/mpeg\r\n' +
        'Content-Transfer-Encoding: base64\r\n\r\n' +
        fileContent +
        closeDelimiter;

      // Upload to Google Drive
      onProgress?.(20);
      
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        }
      );

      onProgress?.(80);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Make file publicly accessible
      await this.makeFilePublic(result.id, token);
      
      onProgress?.(100);

      return {
        success: true,
        fileId: result.id,
        webViewLink: `https://drive.google.com/file/d/${result.id}/view`,
      };
    } catch (error: any) {
      console.error('Error uploading to central Drive:', error);
      return { success: false, error: error.message };
    }
  }

  // Make file publicly accessible
  private async makeFilePublic(fileId: string, token: string): Promise<void> {
    try {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone',
          }),
        }
      );
    } catch (error) {
      console.error('Error making file public:', error);
    }
  }

  // Fallback: Upload via backend service
  private async uploadViaBackend(
    filePath: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; fileId?: string; webViewLink?: string; error?: string }> {
    console.log('Using backend upload service...');
    
    // This would call your backend API that has the service account credentials
    // Backend handles the JWT signing and upload
    
    // For now, return error
    return {
      success: false,
      error: 'Backend service not configured. Please set up service account properly.',
    };
  }
}

export default CentralDriveService;