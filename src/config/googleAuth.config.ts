// Google Authentication Configuration
export const GOOGLE_AUTH_CONFIG = {
  // REPLACE THESE WITH YOUR ACTUAL VALUES
  
  // Web Client ID from Google Cloud Console
  // Go to APIs & Services > Credentials > OAuth 2.0 Client IDs (Web application)
  WEB_CLIENT_ID: '847348972299-6058dnia0e9hgoi4bvgt36frmoevkj43.apps.googleusercontent.com',
  
  // Android Client ID (optional - only if different from default)
  // ANDROID_CLIENT_ID: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  
  // iOS Client ID (if you have iOS app)
  // IOS_CLIENT_ID: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  
  // Scopes for Google Drive access
  SCOPES: [
    'https://www.googleapis.com/auth/drive.file', // Create and access files created by app
    'https://www.googleapis.com/auth/drive.appdata', // Access app data folder
    'https://www.googleapis.com/auth/userinfo.email', // Get user email
    'https://www.googleapis.com/auth/userinfo.profile', // Get user profile
  ],
  
  // Drive API settings
  DRIVE_API_VERSION: 'v3',
  DRIVE_UPLOAD_URL: 'https://www.googleapis.com/upload/drive/v3/files',
  DRIVE_FILES_URL: 'https://www.googleapis.com/drive/v3/files',
};