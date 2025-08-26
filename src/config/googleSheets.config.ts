// For React Native, we'll use direct values since env variables are complex
// In production, use react-native-config or react-native-dotenv

export const GOOGLE_SHEETS_CONFIG = {
  // Google Sheets configuration
  SPREADSHEET_ID: '1anIXPC7QiEKVBMEJ5XV9GrdCqmgfLWYN_PD-zInbeYQ',
  SHEET_NAME: 'Songs',
  
  // Google API credentials (Service Account) - Now using actual private key!
  CLIENT_EMAIL: 'kalyan@central-spot-470008-a0.iam.gserviceaccount.com',
  PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC1T1eTpQDnatxi\nbgf0y1IhcX81zEDN/prz/pnFzJL/SS57sYkQ4Paykj9ZM6qX139sYBENw7Ef4i57\nNU99NqpR4wXXlLc8GOOBvwqL26Dux3rzGfbtrP77a5ERwOrt6vufrc2wSm+zSZbM\nWG2hDpjGyJAYIhbRKxL5AyvztcDMtHiWd9hnVHfH2O9ieu0+B8ErOg/DSFcmGnhC\nBTxO+++6WmzLB+oiTCwpgk9skfHWBd9zpIXb35kxkW4S0wNyOFHaxbHeWtNb4ALg\nm6+eyILO5UncTgOXA2is8O/CFwcf6JJZIe4iNm5an5Fb32DopXXCmvAd6j9yQWL7\niUvnjmwhAgMBAAECggEAA8vIF34jR1UWTWTEm6BUpUDbMxkGS9HOdHiSh2DFvJzP\ngXU5e44cOCel9iQF6LUxNKeLv9wmpZZelwOKGSLnfLyqMwXo8rQKMl2Zts0nwMwS\nI8wZvobqVUD+qe6eNJJAh6qzxWK/lTM/miJpVC+KLRJGqwyuqd0zId3KQileYqLF\nFMt81if8cETNLLJFdOG9ufE3G9ZtL9hRioRY6fm2YOsFRqMrElJ1/MsQcR5OCLda\nMYPNPhMGIUUnHiWA30lfieASJ/0nTTDxh6W0emfVZ5Xg+iA25ClWiZwwRbPWu7+g\nrt7DDhoogRQvFI+fWklwB6oTW4NqGwB4H/Zj1LtA2QKBgQDyJi+FiFLitIchg+dq\nvrZaqVLOxy5SY6Ses+pXJJwj/gbNanKRwYKNis8eUSZCUk4mL7q5fk+uGsXyNpsg\nwTjbiCGfjmOuf4Hi2YRBq99c/W/Gb1O7NyxbaSkheShAGRUpLslBJJsIvVtiL43u\nNy7E1EITzVjQC56NKKbkI0xrSQKBgQC/rkgQ5B+UVAneMeQCpMg0B2IUIK+87OeK\nPv7+Az2QVbUj4kLjWkZa6rfn0ftdO30oLwqcOs9idqnUGXwM/Tagdwxz4NnGUjZM\nIpEq5vtft5zSXjngkfwwa4Be5gFsXBd/vbOqtQmSNRnNgO/0++X4BO0KkWXTO4Ym\nRbd2XdZiGQKBgQCcW8fnw6UxujxfidrOdKMvW5Ka7saccLcFu0sgRgWEwC0ISyn7\nsCZq2yzueJvpy1enFL7PtB4jYCpdQqFcvyfFqdt8Oedn7/Gg16+s8Bxk4UlhqtU4\nWGIODJOAh8lTyl59nzZZGBf7xrnRZr+RCJTsh9q7CqfEfxw8LfnF6n0X8QKBgE8T\nul1lj3Wk+fE1yeghTQrR5O+C0J1zas5I0O/ALHzILxOfu5KJ4q6NWNOFeFrtOOQE\nDC+Jv5bSd5ut69R7/jZTBssjfxRnRElClXsKkbfaSxMqllwEPfNH1kzQPNQUZglo\nHKAXUdyElaGHSPdbmHMqrRQICecMDnrplhd5/QC5AoGBAInBYq9mtYQhqQeLpnp/\niLUUTace70CaUB5Noy+VWJNSZ8bp7IPzML4FCnOZMD5Aos4VD7IlN6fxboR+vPA8\nQ5WRniMiYekFWRKrUa4LGsnd8s4DIeiHuLq0CO5mw9K3kpGnEbLGa4dfxZS2NUkG\nTbwF0hKpEZMB4mERoaNfbAyp\n-----END PRIVATE KEY-----\n",
  
  // Sheet columns structure
  COLUMNS: {
    ID: 0,           // A - Unique ID
    NAME: 1,         // B - Song Name
    ARTIST: 2,       // C - Artist Name
    MOVIE: 3,        // D - Movie/Album
    GENRE: 4,        // E - Genre
    YEAR: 5,         // F - Year
    DRIVE_LINK: 6,   // G - Google Drive Link
    THUMBNAIL: 7,    // H - Thumbnail URL
    DURATION: 8,     // I - Duration
    PLAY_COUNT: 9,   // J - Play Count
    LIKES: 10,       // K - Likes
    UPLOADED_BY: 11, // L - Uploader Name
    UPLOAD_DATE: 12, // M - Upload Date
    STATUS: 13,      // N - Status (active/pending/removed)
    TAGS: 14,        // O - Tags (comma separated)
  },
  
  // Google Drive configuration
  DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || 'YOUR_DRIVE_FOLDER_ID',
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_SONGS_PER_REQUEST: 100,
};

export interface GoogleSheetSong {
  id: string;
  name: string;
  artist: string;
  movie?: string;
  genre?: string;
  year?: number;
  driveLink: string;
  thumbnail?: string;
  duration?: string;
  playCount: number;
  likes: number;
  uploadedBy: string;
  uploadDate: string;
  status: 'active' | 'pending' | 'removed';
  tags?: string[];
}