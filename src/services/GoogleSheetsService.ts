import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CONFIG, GoogleSheetSong } from '../config/googleSheets.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private doc: GoogleSpreadsheet | null = null;
  private initialized = false;
  private lastFetchTime = 0;
  private cachedSongs: GoogleSheetSong[] = [];

  private constructor() {}

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create JWT auth client
      const serviceAccountAuth = new JWT({
        email: GOOGLE_SHEETS_CONFIG.CLIENT_EMAIL,
        key: GOOGLE_SHEETS_CONFIG.PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      // Initialize the document
      this.doc = new GoogleSpreadsheet(GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID, serviceAccountAuth);
      await this.doc.loadInfo();
      
      this.initialized = true;
      console.log('Google Sheets initialized:', this.doc.title);
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      throw new Error('Failed to connect to Google Sheets');
    }
  }

  async fetchAllSongs(forceRefresh = false): Promise<GoogleSheetSong[]> {
    try {
      // Check cache
      const now = Date.now();
      if (!forceRefresh && 
          this.cachedSongs.length > 0 && 
          now - this.lastFetchTime < GOOGLE_SHEETS_CONFIG.CACHE_DURATION) {
        return this.cachedSongs;
      }

      await this.initialize();
      
      if (!this.doc) {
        throw new Error('Google Sheets not initialized');
      }

      const sheet = this.doc.sheetsByTitle[GOOGLE_SHEETS_CONFIG.SHEET_NAME];
      if (!sheet) {
        throw new Error(`Sheet "${GOOGLE_SHEETS_CONFIG.SHEET_NAME}" not found`);
      }

      // Load all rows
      const rows = await sheet.getRows({ limit: GOOGLE_SHEETS_CONFIG.MAX_SONGS_PER_REQUEST });
      
      // Map rows to song objects
      const songs: GoogleSheetSong[] = rows
        .map((row, index) => ({
          id: row.get('ID') || `song_${index + 1}`,
          name: row.get('NAME') || '',
          artist: row.get('ARTIST') || '',
          movie: row.get('MOVIE') || undefined,
          genre: row.get('GENRE') || undefined,
          year: parseInt(row.get('YEAR')) || undefined,
          driveLink: row.get('DRIVE_LINK') || '',
          thumbnail: row.get('THUMBNAIL') || undefined,
          duration: row.get('DURATION') || undefined,
          playCount: parseInt(row.get('PLAY_COUNT')) || 0,
          likes: parseInt(row.get('LIKES')) || 0,
          uploadedBy: row.get('UPLOADED_BY') || 'Unknown',
          uploadDate: row.get('UPLOAD_DATE') || new Date().toISOString(),
          status: (row.get('STATUS') || 'active') as 'active' | 'pending' | 'removed',
          tags: row.get('TAGS') ? row.get('TAGS').split(',').map((t: string) => t.trim()) : [],
        }))
        .filter(song => song.status === 'active' && song.name && song.driveLink);

      // Update cache
      this.cachedSongs = songs;
      this.lastFetchTime = now;

      // Save to local storage for offline access
      await this.saveSongsToCache(songs);

      return songs;
    } catch (error) {
      console.error('Error fetching songs from Google Sheets:', error);
      
      // Fallback to cached data
      const cachedData = await this.loadSongsFromCache();
      if (cachedData.length > 0) {
        return cachedData;
      }
      
      throw error;
    }
  }

  async searchSongs(query: string): Promise<GoogleSheetSong[]> {
    const allSongs = await this.fetchAllSongs();
    const searchTerm = query.toLowerCase();
    
    return allSongs.filter(song => 
      song.name.toLowerCase().includes(searchTerm) ||
      song.artist.toLowerCase().includes(searchTerm) ||
      song.movie?.toLowerCase().includes(searchTerm) ||
      song.genre?.toLowerCase().includes(searchTerm) ||
      song.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  async getSongsByGenre(genre: string): Promise<GoogleSheetSong[]> {
    const allSongs = await this.fetchAllSongs();
    return allSongs.filter(song => 
      song.genre?.toLowerCase() === genre.toLowerCase()
    );
  }

  async getPopularSongs(limit = 10): Promise<GoogleSheetSong[]> {
    const allSongs = await this.fetchAllSongs();
    return allSongs
      .sort((a, b) => (b.playCount + b.likes) - (a.playCount + a.likes))
      .slice(0, limit);
  }

  async getRecentlyAdded(limit = 10): Promise<GoogleSheetSong[]> {
    const allSongs = await this.fetchAllSongs();
    return allSongs
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      .slice(0, limit);
  }

  async addSong(songData: Partial<GoogleSheetSong>): Promise<boolean> {
    try {
      await this.initialize();
      
      if (!this.doc) {
        throw new Error('Google Sheets not initialized');
      }

      const sheet = this.doc.sheetsByTitle[GOOGLE_SHEETS_CONFIG.SHEET_NAME];
      if (!sheet) {
        throw new Error(`Sheet "${GOOGLE_SHEETS_CONFIG.SHEET_NAME}" not found`);
      }

      // Generate unique ID
      const songId = `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add new row
      await sheet.addRow({
        ID: songId,
        NAME: songData.name || '',
        ARTIST: songData.artist || '',
        MOVIE: songData.movie || '',
        GENRE: songData.genre || 'Unknown',
        YEAR: songData.year || new Date().getFullYear(),
        DRIVE_LINK: songData.driveLink || '',
        THUMBNAIL: songData.thumbnail || '',
        DURATION: songData.duration || '',
        PLAY_COUNT: 0,
        LIKES: 0,
        UPLOADED_BY: songData.uploadedBy || 'User',
        UPLOAD_DATE: new Date().toISOString(),
        STATUS: 'pending', // New songs start as pending
        TAGS: songData.tags?.join(', ') || '',
      });

      // Clear cache to force refresh
      this.cachedSongs = [];
      this.lastFetchTime = 0;

      return true;
    } catch (error) {
      console.error('Error adding song to Google Sheets:', error);
      return false;
    }
  }

  async updatePlayCount(songId: string): Promise<void> {
    try {
      await this.initialize();
      
      if (!this.doc) return;

      const sheet = this.doc.sheetsByTitle[GOOGLE_SHEETS_CONFIG.SHEET_NAME];
      if (!sheet) return;

      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('ID') === songId);
      
      if (row) {
        const currentCount = parseInt(row.get('PLAY_COUNT')) || 0;
        row.set('PLAY_COUNT', currentCount + 1);
        await row.save();
      }
    } catch (error) {
      console.error('Error updating play count:', error);
    }
  }

  async updateLikes(songId: string, increment: number): Promise<void> {
    try {
      await this.initialize();
      
      if (!this.doc) return;

      const sheet = this.doc.sheetsByTitle[GOOGLE_SHEETS_CONFIG.SHEET_NAME];
      if (!sheet) return;

      const rows = await sheet.getRows();
      const row = rows.find(r => r.get('ID') === songId);
      
      if (row) {
        const currentLikes = parseInt(row.get('LIKES')) || 0;
        row.set('LIKES', Math.max(0, currentLikes + increment));
        await row.save();
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  }

  // Cache management
  private async saveSongsToCache(songs: GoogleSheetSong[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_songs', JSON.stringify(songs));
      await AsyncStorage.setItem('cache_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error saving songs to cache:', error);
    }
  }

  private async loadSongsFromCache(): Promise<GoogleSheetSong[]> {
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
  getDriveDirectLink(driveLink: string): string {
    // Convert Google Drive sharing link to direct download link
    const fileIdMatch = driveLink.match(/[-\w]{25,}/);
    if (fileIdMatch) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[0]}`;
    }
    return driveLink;
  }
}