# 🎵 AniMusic - Complete Implementation Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Credentials & API Keys](#credentials--api-keys)
3. [Core Architecture](#core-architecture)
4. [Implementation Details](#implementation-details)
5. [File Upload Flow](#file-upload-flow)
6. [Google Services Setup](#google-services-setup)
7. [Important Files](#important-files)
8. [Testing & Deployment](#testing--deployment)

---

## 🎯 Project Overview

**AniMusic** is a React Native music streaming app that allows users to:
- Upload MP3 files to a centralized Google Drive storage
- Store song metadata in Google Sheets (acting as a database)
- Stream music directly from Google Drive
- Search and filter songs
- No user authentication required for uploads

### Tech Stack
- **Frontend**: React Native 0.76.5
- **Storage**: Google Drive (Central Account)
- **Database**: Google Sheets
- **Backend**: Google Apps Script
- **Authentication**: Service Account (for central uploads)

---

## 🔑 Credentials & API Keys

### 1. Google Cloud Project
```
Project Name: central-spot-470008-a0
Project ID: central-spot-470008-a0
Project Number: 847348972299
```

### 2. OAuth 2.0 Credentials
```
Web Client ID: 847348972299-6058dnia0e9hgoi4bvgt36frmoevkj43.apps.googleusercontent.com
Android Package Name: com.animusic
SHA-1 Certificate: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### 3. Service Account
```
Email: kalyan@central-spot-470008-a0.iam.gserviceaccount.com
Purpose: Central Drive uploads without user authentication
```

### 4. Google Drive Folder
```
Folder ID: 1pUXO7XzGSk5_iEKypnTF4Px26D5T9yWK
Folder URL: https://drive.google.com/drive/folders/1pUXO7XzGSk5_iEKypnTF4Px26D5T9yWK
Owner: Your Google Account
Access: Public (Anyone with link can view)
```

### 5. Google Sheets Database
```
Sheet ID: 1EDy2Y2cObNvlHN5LxowJt8OKpYg5G_DmN5aVNg-3VBQ
Sheet URL: https://docs.google.com/spreadsheets/d/1EDy2Y2cObNvlHN5LxowJt8OKpYg5G_DmN5aVNg-3VBQ
Tab Name: Songs
Access: Public Read, Service Account Write
```

### 6. Google Apps Script (Backend)
```
Script URL: https://script.google.com/macros/s/AKfycbyKYiJeaSuzirsPjz2AuRI27COkf_PWTst6ZHI6XscM-rgAm8LaFtz3z8VZDWpsnIR7ow/exec
Execution: As You (Owner)
Access: Anyone
Purpose: Handles file uploads and sheet operations
```

### 7. Backend Service (Sheet Operations)
```
URL: https://script.google.com/macros/s/AKfycbxg6Ev9GDpVMB3hR0R8AyslZXPuNUxDp_aq_SJb1QPOyaL9dBxK_uDW_yD3TBKo_lNu/exec
Purpose: Read/Write operations on Google Sheet
```

---

## 🏗️ Core Architecture

### System Design
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React     │────▶│  Google Apps     │────▶│  Google Drive   │
│   Native    │     │    Script        │     │  (Central)      │
│    App      │     │   (Backend)      │     │                 │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                     │                         │
       │                     ▼                         │
       │            ┌──────────────────┐              │
       └───────────▶│  Google Sheets   │◀─────────────┘
                    │   (Database)     │
                    └──────────────────┘
```

### Data Flow
1. **Upload Flow**: App → Apps Script → Google Drive → Update Sheet
2. **Read Flow**: App → Backend Service → Google Sheet → Return JSON
3. **Stream Flow**: App → Direct Google Drive URL → Audio Stream

---

## 💻 Implementation Details

### 1. Centralized Upload System

**File**: `src/services/SimpleCentralUpload.ts`
```typescript
class SimpleCentralUpload {
  // Apps Script URL for backend processing
  private APPS_SCRIPT_URL = 'https://script.google.com/.../exec';
  
  async uploadFile(filePath, fileName, onProgress) {
    // 1. Read file as base64
    const fileContent = await RNFS.readFile(filePath, 'base64');
    
    // 2. Send to Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        fileName: fileName,
        fileContent: fileContent,
        mimeType: 'audio/mpeg'
      })
    });
    
    // 3. Return Drive link
    return { fileId, webViewLink, downloadLink };
  }
}
```

### 2. Google Apps Script Backend

**File**: `google-apps-script.js`
```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  // 1. Get central folder
  const folder = DriveApp.getFolderById('1pUXO7XzGSk5_iEKypnTF4Px26D5T9yWK');
  
  // 2. Create file from base64
  const fileBlob = Utilities.newBlob(
    Utilities.base64Decode(data.fileContent),
    'audio/mpeg',
    data.fileName
  );
  
  // 3. Save to Drive
  const file = folder.createFile(fileBlob);
  
  // 4. Make public
  file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  
  // 5. Return links
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    fileId: file.getId(),
    webViewLink: `https://drive.google.com/file/d/${file.getId()}/view`,
    downloadLink: `https://drive.google.com/uc?export=download&id=${file.getId()}`
  }));
}
```

### 3. Google Sheets Integration

**File**: `src/services/GoogleSheetsServiceRN.ts`
```typescript
class GoogleSheetsServiceRN {
  // Fetch songs from sheet
  async fetchAllSongs() {
    const response = await fetch(
      `${BACKEND_URL}?action=getSongs`
    );
    return response.json();
  }
  
  // Add new song
  async addSong(songData) {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'addSong',
        song: {
          name: songData.name,
          artist: songData.artist,
          movie: songData.movie,
          genre: songData.genre,
          driveLink: songData.driveLink,
          tags: songData.tags, // Array
          uploadedBy: 'AniMusic User'
        }
      })
    });
    return response.json();
  }
}
```

### 4. Sheet Structure

**Google Sheet Columns**:
| Column | Type | Description |
|--------|------|-------------|
| A: ID | Number | Auto-increment ID |
| B: Name | String | Song name |
| C: Artist | String | Artist name |
| D: Movie | String | Movie/Album name |
| E: Genre | String | Music genre |
| F: Drive Link | URL | Google Drive link |
| G: Tags | String | Comma-separated tags |
| H: Uploaded By | String | Uploader identifier |
| I: Upload Date | Date | Timestamp |

---

## 📤 File Upload Flow

### Complete Upload Process

1. **User Selects MP3**
   ```typescript
   DocumentPicker.pick({ type: [DocumentPicker.types.audio] })
   ```

2. **File Validation**
   - Check file extension (.mp3)
   - Verify file size
   - Extract metadata

3. **Central Upload (No Sign-in)**
   ```typescript
   // No authentication required!
   centralUpload.uploadFile(filePath, fileName)
   ```

4. **Apps Script Processing**
   - Receive base64 file
   - Decode and save to Drive
   - Set public permissions
   - Return file links

5. **Update Database**
   ```typescript
   googleSheetsService.addSong({
     name, artist, movie, genre,
     driveLink: uploadResult.webViewLink,
     tags: tagsArray
   })
   ```

6. **Success Response**
   - File stored in central Drive
   - Metadata saved to Sheet
   - Ready for streaming

---

## 🔧 Google Services Setup

### 1. Enable APIs
```
✅ Google Drive API
✅ Google Sheets API
✅ Google Apps Script API
```

### 2. OAuth Consent Screen
```
App Name: AniMusic
User Type: External
Scopes: 
- drive.file
- spreadsheets
- userinfo.email
```

### 3. Service Account Permissions
```
Folder: Editor access to central folder
Sheet: Editor access to database sheet
```

### 4. Apps Script Deployment
```
Execute as: Me (owner account)
Who has access: Anyone
```

---

## 📁 Important Files

### Configuration Files
```
src/config/
├── googleSheets.config.ts    # Sheet ID, backend URL
├── googleAuth.config.ts      # OAuth credentials
├── centralDrive.config.ts    # Central folder config
└── appsScript.config.ts      # Apps Script URL
```

### Service Files
```
src/services/
├── SimpleCentralUpload.ts    # Central upload handler
├── GoogleSheetsServiceRN.ts  # Sheet operations
├── GoogleAuthService.ts      # OAuth handling (optional)
└── GoogleDriveService.ts     # Direct Drive operations
```

### Screen Files
```
src/screens/
├── RealUploadScreen.tsx      # Main upload interface
├── GoogleMusicScreen.tsx     # Music library
├── MusicPlayerScreen.tsx     # Audio player
└── EasyUploadScreen.tsx      # Manual link entry
```

### Android Configuration
```
android/
├── app/google-services.json  # Firebase/Google config
├── app/build.gradle          # Google Services plugin
└── build.gradle              # Project dependencies
```

---

## 🚀 Testing & Deployment

### Local Testing
```bash
# Install dependencies
npm install

# Android
npx react-native run-android

# iOS (if configured)
cd ios && pod install
npx react-native run-ios
```

### Build APK
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Test Credentials
- Test upload with any MP3 file
- Files appear in: https://drive.google.com/drive/folders/1pUXO7XzGSk5_iEKypnTF4Px26D5T9yWK
- Database updates: https://docs.google.com/spreadsheets/d/1EDy2Y2cObNvlHN5LxowJt8OKpYg5G_DmN5aVNg-3VBQ

---

## 🔒 Security Considerations

1. **No Sensitive Keys in Code**
   - Service account key not embedded
   - Using Apps Script as proxy

2. **Public Access Control**
   - Files are public read-only
   - Write access only through Apps Script

3. **Rate Limiting**
   - Apps Script has quotas
   - Consider caching for reads

4. **Data Validation**
   - Validate file types
   - Sanitize user inputs
   - Size limits for uploads

---

## 📊 Monitoring

### Apps Script Dashboard
- View executions: https://script.google.com
- Check quotas and errors
- Monitor API usage

### Google Drive
- Storage usage
- File organization
- Access logs

### Google Sheets
- Data integrity
- Row count
- Formula performance

---

## 🛠️ Maintenance

### Regular Tasks
1. Monitor Drive storage (15GB free limit)
2. Clean up orphaned files
3. Backup Sheet data
4. Update Apps Script if needed
5. Review access logs

### Scaling Considerations
- Upgrade Drive storage if needed
- Consider database migration for >10k songs
- Implement CDN for streaming
- Add user authentication for premium features

---

## 📞 Support

### Common Issues

1. **Upload Fails**
   - Check Apps Script URL in config
   - Verify folder permissions
   - Check internet connection

2. **Sheet Not Updating**
   - Verify backend URL
   - Check Sheet permissions
   - Review Apps Script logs

3. **Playback Issues**
   - Ensure files are public
   - Check Drive quota
   - Verify file format (MP3)

### Debug Commands
```bash
# Check logs
adb logcat | grep -i animusic

# Clear cache
npx react-native start --reset-cache

# Rebuild
cd android && ./gradlew clean && ./gradlew assembleDebug
```

---

## 📝 Notes

- All uploads go to central Drive (no user sign-in)
- Sheet acts as searchable database
- Files automatically made public for streaming
- No server costs (using Google's free tier)
- Scalable to ~3000 songs with 15GB free storage

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Author**: AniMusic Team