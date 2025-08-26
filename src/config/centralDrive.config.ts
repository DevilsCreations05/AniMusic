// Central Drive Configuration
// This uses YOUR Google Drive account for all uploads

export const CENTRAL_DRIVE_CONFIG = {
  // Service Account Email (from the JSON key file)
  SERVICE_ACCOUNT_EMAIL: 'kalyan@central-spot-470008-a0.iam.gserviceaccount.com',
  
  // Your Drive Folder ID where all songs will be uploaded
  // To get this:
  // 1. Create a folder in your Google Drive called "AniMusic Songs"
  // 2. Open the folder
  // 3. Look at the URL: https://drive.google.com/drive/folders/FOLDER_ID_HERE
  // 4. Copy the FOLDER_ID and paste below
  CENTRAL_FOLDER_ID: '1pUXO7XzGSk5_iEKypnTF4Px26D5T9yWK',
  
  // Backend service URL (we'll create this)
  // This backend will handle the actual upload using service account
  BACKEND_UPLOAD_URL: 'https://your-backend.com/upload',
  
  // For now, we'll use Google Apps Script as our backend
  // This is easier than setting up a full Node.js server
  APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_URL_HERE',
};