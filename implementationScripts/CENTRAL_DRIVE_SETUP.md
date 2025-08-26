# 🎵 Central Drive Storage Setup

## Current Problem
Right now, each user uploads to their own Drive:
- User A uploads song → stored in User A's Drive
- User B uploads song → stored in User B's Drive
- If User A deletes their file → song breaks for everyone!

## Better Solution: Central Storage

### Option 1: Service Account (Best for Apps)
1. Create a service account in Google Cloud Console
2. Give it Drive API access
3. All uploads go to service account's Drive
4. Users never sign in - app handles everything

**Implementation:**
```javascript
// In GoogleDriveService.ts
class GoogleDriveService {
  async uploadFileToServiceAccount(file) {
    // Use service account credentials
    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive']
    );
    
    // Upload to service account's Drive
    // No user sign-in needed!
  }
}
```

### Option 2: Shared Folder Method
1. Create a shared folder in YOUR Drive
2. Give service account write access
3. All files upload to your folder
4. You own and control everything

### Option 3: Backend Server (Most Professional)
1. Create a backend (Node.js/Firebase)
2. Backend has service account credentials
3. App uploads to backend
4. Backend uploads to central Drive
5. Returns link to app

```javascript
// Backend API
app.post('/upload', async (req, res) => {
  const file = req.files.mp3;
  
  // Upload to central Drive using service account
  const driveLink = await uploadToCentralDrive(file);
  
  // Add to sheet
  await addToSheet({ ...songData, driveLink });
  
  res.json({ success: true, driveLink });
});
```

## Quick Fix: Shared Upload Account

Create a dedicated Google account for uploads:
1. Create account: animusic.uploads@gmail.com
2. Share its credentials with the app
3. All uploads go through this account
4. Share the folder publicly

## Recommended Architecture

```
User App → Backend Server → Service Account → Central Drive
                           ↓
                     Google Sheet (song database)
```

Benefits:
- No user sign-in
- Central control
- Professional setup
- Scalable
- Secure

## Storage Considerations

- Free Google Drive: 15GB
- Google One: 100GB for $2/month
- Service Account: 15GB free
- Consider: MP3 ~5MB each = 3000 songs in 15GB

## Implementation Priority

1. **Quick Fix**: Keep current setup, document risks
2. **Better**: Implement service account
3. **Best**: Build backend with central storage

The current setup works but has risks. Users control their own files!