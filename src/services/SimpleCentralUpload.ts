import RNFS from 'react-native-fs';
import { APPS_SCRIPT_CONFIG } from '../config/appsScript.config';

class SimpleCentralUpload {
  private static instance: SimpleCentralUpload;
  
  // URL from config file
  private APPS_SCRIPT_URL = APPS_SCRIPT_CONFIG.URL;

  private constructor() {}

  static getInstance(): SimpleCentralUpload {
    if (!SimpleCentralUpload.instance) {
      SimpleCentralUpload.instance = new SimpleCentralUpload();
    }
    return SimpleCentralUpload.instance;
  }

  setAppsScriptUrl(url: string) {
    this.APPS_SCRIPT_URL = url;
  }

  isConfigured(): boolean {
    return !!this.APPS_SCRIPT_URL;
  }

  async uploadFile(
    filePath: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; fileId?: string; webViewLink?: string; downloadLink?: string; error?: string }> {
    try {
      if (!this.APPS_SCRIPT_URL) {
        throw new Error('Apps Script URL not configured. Please deploy the script first.');
      }

      // Read file as base64
      onProgress?.(10);
      const fileContent = await RNFS.readFile(filePath, 'base64');
      
      onProgress?.(30);
      
      // Prepare the request
      const requestBody = {
        fileName: fileName,
        fileContent: fileContent,
        mimeType: 'audio/mpeg'
      };

      onProgress?.(50);

      // Send to Apps Script
      const response = await fetch(this.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      onProgress?.(80);

      const result = await response.json();
      
      onProgress?.(100);

      if (result.success) {
        return {
          success: true,
          fileId: result.fileId,
          webViewLink: result.webViewLink,
          downloadLink: result.downloadLink,
        };
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Central upload error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to upload file'
      };
    }
  }
}

export default SimpleCentralUpload;