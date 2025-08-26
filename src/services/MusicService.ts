import {PermissionsAndroid, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import {FinalDeleteService} from './FinalDeleteService';

export interface LocalSong {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  artwork?: string;
  path: string;
}

class MusicService {
  private static instance: MusicService;
  private currentSound: Sound | null = null;
  private sleepTimer: NodeJS.Timeout | null = null;
  private currentSong: LocalSong | null = null;
  private isPlaying: boolean = false;

  private constructor() {
    // Enable playback in silence mode
    Sound.setCategory('Playback');
  }

  static getInstance(): MusicService {
    if (!MusicService.instance) {
      MusicService.instance = new MusicService();
    }
    return MusicService.instance;
  }

  async initialize() {
    console.log('MusicService initialized with react-native-sound');
  }

  async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true; // iOS doesn't need runtime permissions for music
    }

    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 33) {
        // Android 13+ uses READ_MEDIA_AUDIO
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          {
            title: 'Music Access Permission',
            message: 'AniMusic needs access to your music files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Older Android versions use READ_EXTERNAL_STORAGE
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'AniMusic needs access to your storage to play music',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  async getLocalSongs(): Promise<LocalSong[]> {
    try {
      const hasPermission = await this.requestStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission denied');
      }

      const musicPaths = [
        RNFS.ExternalStorageDirectoryPath + '/Music',
        RNFS.ExternalStorageDirectoryPath + '/Download',
        RNFS.ExternalStorageDirectoryPath + '/Android/media',
      ];

      const songs: LocalSong[] = [];
      
      for (const path of musicPaths) {
        try {
          const exists = await RNFS.exists(path);
          if (!exists) continue;

          const files = await RNFS.readDir(path);
          
          for (const file of files) {
            if (file.isFile() && this.isMusicFile(file.name)) {
              songs.push({
                id: file.path,
                url: file.path,
                title: this.extractTitle(file.name),
                artist: 'Unknown Artist',
                path: file.path,
                duration: 0,
              });
            }
          }
        } catch (error) {
          console.log(`Error reading ${path}:`, error);
        }
      }

      return songs;
    } catch (error) {
      console.error('Error getting local songs:', error);
      return [];
    }
  }

  private isMusicFile(filename: string): boolean {
    const musicExtensions = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.wma'];
    return musicExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  private extractTitle(filename: string): string {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    return nameWithoutExt.replace(/_/g, ' ');
  }

  async playSong(song: LocalSong) {
    return new Promise<void>((resolve, reject) => {
      // Stop current song if playing
      if (this.currentSound) {
        this.currentSound.stop();
        this.currentSound.release();
      }

      // Check if it's a URL or local file
      const isUrl = song.path?.startsWith('http') || song.url?.startsWith('http');
      const soundPath = isUrl ? (song.url || song.path) : song.path;
      const soundBasePath = isUrl ? '' : '';

      console.log('Playing song:', song.title, 'Path:', soundPath, 'Is URL:', isUrl);

      // Create new sound instance
      this.currentSound = new Sound(soundPath, soundBasePath, (error) => {
        if (error) {
          console.error('Failed to load sound', error);
          reject(error);
          return;
        }

        // Play the sound
        this.currentSound?.play((success) => {
          if (success) {
            console.log('Successfully finished playing');
            this.isPlaying = false;
          } else {
            console.log('Playback failed');
          }
        });

        this.currentSong = song;
        this.isPlaying = true;
        resolve();
      });
    });
  }

  // Add new method specifically for URL playback
  async playFromUrl(url: string, songInfo: any) {
    return this.playSong({
      ...songInfo,
      path: url,
      url: url,
      id: songInfo.id || Date.now().toString(),
      title: songInfo.title || songInfo.name || 'Unknown',
      artist: songInfo.artist || 'Unknown Artist',
    });
  }

  async play() {
    if (this.currentSound) {
      this.currentSound.play();
      this.isPlaying = true;
    }
  }

  async pause() {
    if (this.currentSound) {
      this.currentSound.pause();
      this.isPlaying = false;
    }
  }

  async stop() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.isPlaying = false;
    }
  }

  async skipToNext() {
    // This would need playlist management
    console.log('Skip to next - not implemented');
  }

  async skipToPrevious() {
    // This would need playlist management
    console.log('Skip to previous - not implemented');
  }

  async seekTo(position: number) {
    if (this.currentSound) {
      this.currentSound.setCurrentTime(position);
    }
  }

  getCurrentPosition(): Promise<number> {
    return new Promise((resolve) => {
      if (this.currentSound) {
        this.currentSound.getCurrentTime((seconds) => {
          resolve(seconds);
        });
      } else {
        resolve(0);
      }
    });
  }

  getDuration(): number {
    if (this.currentSound) {
      return this.currentSound.getDuration();
    }
    return 0;
  }

  async getCurrentTrack() {
    return this.currentSong;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  async getProgress() {
    const position = await this.getCurrentPosition();
    const duration = this.getDuration();
    return {
      position,
      duration,
      buffered: duration,
    };
  }

  // Sleep timer functionality with fade out
  setSleepTimer(minutes: number, fadeOut: boolean = false) {
    // Clear existing timer
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
    }

    if (minutes > 0) {
      const duration = minutes * 60 * 1000;
      
      if (fadeOut) {
        // Start fading out 30 seconds before the timer ends
        const fadeStartTime = duration - 30000;
        
        if (fadeStartTime > 0) {
          setTimeout(() => {
            this.startFadeOut(30);
          }, fadeStartTime);
        }
      }
      
      this.sleepTimer = setTimeout(async () => {
        await this.stop();
        this.sleepTimer = null;
      }, duration);
    }
  }
  
  private startFadeOut(seconds: number) {
    if (!this.currentSound) return;
    
    const steps = 10;
    const stepDuration = (seconds * 1000) / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
      if (this.currentSound && currentStep < steps) {
        const newVolume = 1 - (currentStep / steps);
        this.currentSound.setVolume(newVolume);
        currentStep++;
      } else {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  cancelSleepTimer() {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }
  }

  async deleteSong(filePath: string): Promise<void> {
    try {
      console.log('MusicService: Attempting to delete file:', filePath);
      
      // Stop playing if this song is currently playing
      if (this.currentSong?.path === filePath) {
        this.stop();
        this.currentSong = null;
      }

      // Use FinalDeleteService which shows Android system delete dialog
      const deleted = await FinalDeleteService.deleteFile(filePath);
      
      if (deleted) {
        console.log('Song deleted successfully');
      } else {
        console.log('Delete cancelled or failed');
        // Don't throw error if user cancelled
      }
      
    } catch (error) {
      console.error('MusicService: Error deleting song:', error);
      throw error;
    }
  }

  async requestManageStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      // For Android 11+, check if we have MANAGE_EXTERNAL_STORAGE
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      
      if (!granted) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        
        return result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === 'granted';
      }
      
      return true;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }

  async requestWritePermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 30) {
        // Android 11+ requires MANAGE_EXTERNAL_STORAGE
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Delete Permission',
            message: 'AniMusic needs permission to delete music files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Older Android versions
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'AniMusic needs write access to delete music files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  destroy() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }
    this.cancelSleepTimer();
  }
}

export default MusicService.getInstance();