import React, {createContext, useState, useContext, useEffect} from 'react';
import MusicService from '../services/MusicService';

interface MusicContextType {
  currentSong: any;
  isPlaying: boolean;
  setCurrentSong: (song: any) => void;
  setIsPlaying: (playing: boolean) => void;
  playSong: (song: any) => Promise<void>;
  pauseSong: () => Promise<void>;
  stopSong: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    MusicService.initialize();
  }, []);

  const playSong = async (song: any) => {
    try {
      // Always use MusicService which now handles both URLs and local files
      await MusicService.playSong(song);
      setCurrentSong(song);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing song:', error);
      // Show user-friendly error
      if (error?.message?.includes('load')) {
        console.log('Failed to load audio. Check internet connection for streaming.');
      }
    }
  };

  const pauseSong = async () => {
    try {
      await MusicService.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing song:', error);
    }
  };

  const stopSong = async () => {
    try {
      await MusicService.stop();
      setCurrentSong(null);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping song:', error);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        setCurrentSong,
        setIsPlaying,
        playSong,
        pauseSong,
        stopSong,
      }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};