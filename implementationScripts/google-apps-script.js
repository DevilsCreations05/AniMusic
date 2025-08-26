// Google Apps Script for AniMusic Central Upload
// Deploy this as a Web App with "Execute as: Me" and "Who has access: Anyone"

const FOLDER_ID = '1pUXO7XzGSk5_iEKypnTF4Px26D5T9yWK';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Get the folder
    const folder = DriveApp.getFolderById(FOLDER_ID);
    
    // Decode base64 file content
    const fileBlob = Utilities.newBlob(
      Utilities.base64Decode(data.fileContent),
      data.mimeType || 'audio/mpeg',
      data.fileName
    );
    
    // Create file in the folder
    const file = folder.createFile(fileBlob);
    
    // Make file publicly accessible
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    // Get the direct download link
    const fileId = file.getId();
    const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;
    const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        fileId: fileId,
        webViewLink: webViewLink,
        downloadLink: downloadLink,
        fileName: file.getName()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ready',
      folder: FOLDER_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}