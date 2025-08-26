import { GOOGLE_SHEETS_CONFIG } from '../config/googleSheets.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL for Google Apps Script or your backend service
// Deploy google-apps-script.js to Google Apps Script and put the URL here
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycby9RDmxCBc6vpxga3a8Muu9jEyoZ9zM01bZaT2bL5ejAfnDd5HbK5LHyfgpGDsvhwEI/exec';

// React Native compatible Google Sheets service
// Uses direct REST API calls instead of Node.js libraries
export class GoogleSheetsServiceRN {
  private static instance: GoogleSheetsServiceRN;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private lastFetchTime = 0;
  private cachedSongs: any[] = [];

  private constructor() {}

  static getInstance(): GoogleSheetsServiceRN {
    if (!GoogleSheetsServiceRN.instance) {
      GoogleSheetsServiceRN.instance = new GoogleSheetsServiceRN();
    }
    return GoogleSheetsServiceRN.instance;
  }

  // For React Native, we'll use API key for read operations
  // and a backend service for write operations
  private async getAccessToken(): Promise<string> {
    // In production, implement a backend service that:
    // 1. Handles JWT signing with the private key
    // 2. Returns an access token to the React Native app
    // For now, return empty string and use API key for public sheets
    return '';
  }

  // For React Native, we'll use a simpler approach with direct API key
  // In production, you should use a backend service for JWT signing
  private async createJWT(header: any, payload: any): Promise<string> {
    // Since JWT signing with RSA is complex in React Native,
    // we'll use the API key approach for public sheets
    // or implement a backend service for private sheets
    return '';
  }

  // Fetch songs using Google Sheets API v4 REST endpoint
  async fetchAllSongs(forceRefresh = false): Promise<any[]> {
    try {
      // Check cache
      const now = Date.now();
      if (!forceRefresh && 
          this.cachedSongs.length > 0 && 
          now - this.lastFetchTime < GOOGLE_SHEETS_CONFIG.CACHE_DURATION) {
        return this.cachedSongs;
      }

      // Try backend URL first if configured
      if (BACKEND_URL) {
        try {
          const response = await fetch(`${BACKEND_URL}?action=getSongs`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          const text = await response.text();
          console.log('Backend response:', text.substring(0, 200));
          
          // Check if response is JSON
          if (text.startsWith('{') || text.startsWith('[')) {
            const result = JSON.parse(text);
            if (result.success && result.songs) {
              const songs = result.songs;
              this.cachedSongs = songs;
              this.lastFetchTime = now;
              await this.saveSongsToCache(songs);
              return songs;
            }
          } else {
            console.warn('Backend returned HTML instead of JSON. Check Google Apps Script deployment.');
          }
        } catch (backendError) {
          console.error('Backend fetch error:', backendError);
        }
      }

      // Fallback to direct API (requires public sheet)
      const sheetName = GOOGLE_SHEETS_CONFIG.SHEET_NAME;
      const range = `${sheetName}!A:O`; // Columns A to O
      
      // Try to fetch without authentication first (works for public sheets)
      // You need to get an API key from Google Cloud Console
      const API_KEY = 'AIzaSyBaMqLZeJ3Sx7V3nnZViG7yH8WqJz5yEXs'; // Replace with your actual API key
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('Unable to fetch songs. Please check your Google Sheet settings.');
        throw new Error('Connection failed');
      }

      const data = await response.json();
      const songs = this.processSheetData(data);
      
      // Update cache
      this.cachedSongs = songs;
      this.lastFetchTime = now;
      
      // Save to local storage
      await this.saveSongsToCache(songs);
      
      return songs;
    } catch (error) {
      console.error('Error fetching songs:', error);
      
      // Fallback to cached data
      const cachedData = await this.loadSongsFromCache();
      if (cachedData.length > 0) {
        return cachedData;
      }
      
      // Return empty array instead of demo data
      return [];
    }
  }

  // Process raw sheet data into song objects
  private processSheetData(data: any): any[] {
    if (!data.values || data.values.length < 2) {
      return [];
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map((row: any[], index: number) => ({
      id: row[0] || `song_${index + 1}`,
      name: row[1] || '',
      artist: row[2] || '',
      movie: row[3] || undefined,
      genre: row[4] || 'Unknown',
      year: parseInt(row[5]) || undefined,
      driveLink: row[6] || '',
      thumbnail: row[7] || undefined,
      duration: row[8] || undefined,
      playCount: parseInt(row[9]) || 0,
      likes: parseInt(row[10]) || 0,
      uploadedBy: row[11] || 'Unknown',
      uploadDate: row[12] || new Date().toISOString(),
      status: row[13] || 'active',
      tags: row[14] ? row[14].split(',').map((t: string) => t.trim()) : [],
    })).filter(song => song.status === 'active' && song.name && song.driveLink);
  }

  // Add a new song to the sheet
  async addSong(songData: any): Promise<boolean> {
    try {
      // If backend URL is configured, use it
      if (BACKEND_URL) {
        try {
          const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              action: 'addSong',
              song: songData,
            }),
          });

          const text = await response.text();
          console.log('Add song response:', text.substring(0, 200));
          
          if (text.startsWith('{') || text.startsWith('[')) {
            const result = JSON.parse(text);
            if (result.success) {
              // Clear cache
              this.cachedSongs = [];
              this.lastFetchTime = 0;
              return true;
            }
          }
          return false;
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          return false;
        }
      }
      
      // Backend not configured
      console.warn('Backend service not configured for uploads');
      throw new Error('Upload service unavailable');
    } catch (error) {
      console.error('Error adding song:', error);
      return false;
    }
  }

  // Return empty array instead of demo data
  private getDemoSongs(): any[] {
    return [];
  }

  // Cache management
  private async saveSongsToCache(songs: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_songs', JSON.stringify(songs));
      await AsyncStorage.setItem('cache_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error saving songs to cache:', error);
    }
  }

  private async loadSongsFromCache(): Promise<any[]> {
    try {
      const cachedData = await AsyncStorage.getItem('cached_songs');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error loading songs from cache:', error);
    }
    return [];
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('cached_songs');
      await AsyncStorage.removeItem('cache_timestamp');
      this.cachedSongs = [];
      this.lastFetchTime = 0;
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get Google Drive direct download link
  getDriveDirectLink = (driveLink: string): string => {
    // Extract file ID from various Google Drive URL formats
    let fileId = '';
    
    // Check for /d/ format (most common)
    const dMatch = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch) {
      fileId = dMatch[1];
    } else {
      // Check for id= format
      const idMatch = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        fileId = idMatch[1];
      } else {
        // Try to find any long alphanumeric string
        const fileIdMatch = driveLink.match(/[-\w]{25,}/);
        if (fileIdMatch) {
          fileId = fileIdMatch[0];
        }
      }
    }
    
    if (fileId) {
      // Use the direct download URL format that works for streaming
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    return driveLink;
  }

  // Search songs
  async searchSongs(query: string): Promise<any[]> {
    const allSongs = await this.fetchAllSongs();
    const searchTerm = query.toLowerCase();
    
    return allSongs.filter(song => 
      song.name.toLowerCase().includes(searchTerm) ||
      song.artist.toLowerCase().includes(searchTerm) ||
      song.movie?.toLowerCase().includes(searchTerm) ||
      song.genre?.toLowerCase().includes(searchTerm) ||
      song.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get songs by genre
  async getSongsByGenre(genre: string): Promise<any[]> {
    const allSongs = await this.fetchAllSongs();
    return allSongs.filter(song => 
      song.genre?.toLowerCase() === genre.toLowerCase()
    );
  }

  // Get popular songs
  async getPopularSongs(limit = 10): Promise<any[]> {
    const allSongs = await this.fetchAllSongs();
    return allSongs
      .sort((a, b) => (b.playCount + b.likes) - (a.playCount + a.likes))
      .slice(0, limit);
  }

  // Update play count for a song
  updatePlayCount = async (songId: string): Promise<void> => {
    try {
      if (BACKEND_URL) {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'updatePlayCount',
            songId: songId,
          }),
        });
        console.log('UpdatePlayCount response:', response.status);
      }
    } catch (error) {
      console.error('Error updating play count:', error);
    }
  }

  // Like a song
  likeSong = async (songId: string): Promise<void> => {
    try {
      if (BACKEND_URL) {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'likeSong',
            songId: songId,
          }),
        });
        console.log('LikeSong response:', response.status);
      }
    } catch (error) {
      console.error('Error liking song:', error);
    }
  }
}