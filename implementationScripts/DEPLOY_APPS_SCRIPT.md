# Deploy Google Apps Script for Central Upload

## Step 1: Open Google Apps Script
1. Go to https://script.google.com
2. Sign in with your Google account (the one that owns the central folder)
3. Click "New Project"

## Step 2: Copy the Script
1. Delete the default code
2. Copy ALL the code from `google-apps-script.js` file
3. Paste it into the Apps Script editor
4. Name your project "AniMusic Central Upload"

## Step 3: Deploy as Web App
1. Click "Deploy" button (top right)
2. Select "New Deployment"
3. Click the gear icon ⚙️ next to "Select type"
4. Choose "Web app"
5. Configure:
   - Description: "AniMusic Central Upload Service"
   - Execute as: **Me** (your email)
   - Who has access: **Anyone**
6. Click "Deploy"

## Step 4: Get the URL
1. You'll see a Web App URL like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
2. Copy this URL - you'll need it!

## Step 5: Test the Script
1. Open the URL in your browser
2. You should see:
   ```json
   {"status":"ready","folder":"1pUXO7XzGSk5_iEKypnTF4Px26D5T9yWK"}
   ```

## Step 6: Update the App
1. Open `src/services/SimpleCentralUpload.ts`
2. Find this line:
   ```typescript
   private APPS_SCRIPT_URL = '';
   ```
3. Replace with your URL:
   ```typescript
   private APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```

## Permissions
When you first deploy, Google will ask for permissions:
- View and manage Google Drive files
- This is needed to upload files to your folder

## Troubleshooting
- If you see "Authorization required", click Review Permissions
- If uploads fail, check that the folder ID matches
- Make sure "Execute as: Me" is selected (not "User accessing the web app")

## Your Current Settings
- Folder ID: `1pUXO7XzGSk5_iEKypnTF4Px26D5T9yWK`
- Service Account: `kalyan@central-spot-470008-a0.iam.gserviceaccount.com`

That's it! Your central upload service is ready!