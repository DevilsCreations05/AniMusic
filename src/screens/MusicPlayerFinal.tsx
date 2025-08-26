import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MusicService from '../services/MusicService';
import {useMusic} from '../context/MusicContext';
import {TimerModal} from '../components/TimerModal';
import {DeleteConfirmModalFast} from '../components/DeleteConfirmModalFast';
import {QuickOptionsMenu} from '../components/QuickOptionsMenu';
import Svg, {Path, Circle, Rect} from 'react-native-svg';

const {width, height} = Dimensions.get('window');

const Icon = ({name, size = 24, color = '#FFFFFF'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'back': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </Svg>
    ),
    'play': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Path d="M5 3l14 9-14 9V3z" fill={color} />
      </Svg>
    ),
    'pause': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Rect x="6" y="4" width="4" height="16" />
        <Rect x="14" y="4" width="4" height="16" />
      </Svg>
    ),
    'next': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      </Svg>
    ),
    'previous': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
      </Svg>
    ),
    'shuffle': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
      </Svg>
    ),
    'repeat': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
      </Svg>
    ),
    'heart': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </Svg>
    ),
    'heart-filled': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    ),
    'timer': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M12 6v6l4 2" />
      </Svg>
    ),
    'delete': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
      </Svg>
    ),
    'more': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Circle cx="12" cy="5" r="2" />
        <Circle cx="12" cy="12" r="2" />
        <Circle cx="12" cy="19" r="2" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const MusicPlayerFinal = ({navigation, route}: any) => {
  const song = route.params?.song;
  const fromMiniPlayer = route.params?.fromMiniPlayer;
  const fromList = route.params?.fromList;
  const shouldPlay = route.params?.shouldPlay;
  const {currentSong, setCurrentSong, setIsPlaying: setGlobalPlaying, playSong, stopSong} = useMusic();
  
  // Core states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // Animation refs - not causing re-renders
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Progress update interval ref
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check navigation source
    if (fromMiniPlayer) {
      // Coming from mini player, don't restart
      startAnimations();
      const updateState = async () => {
        const playing = MusicService.isPlaying();
        setIsPlaying(playing);
        setGlobalPlaying(playing);
        const progress = await MusicService.getProgress();
        setCurrentTime(progress.position);
        setDuration(progress.duration || 100);
      };
      updateState();
    } else if (fromList && shouldPlay === false) {
      // Same song clicked from list, don't restart
      startAnimations();
      const updateState = async () => {
        const playing = MusicService.isPlaying();
        setIsPlaying(playing);
        setGlobalPlaying(playing);
        const progress = await MusicService.getProgress();
        setCurrentTime(progress.position);
        setDuration(progress.duration || 100);
      };
      updateState();
    } else {
      // Normal initialization
      initializePlayer();
      startAnimations();
      if (!fromList) {
        loadSongPosition();
      }
    }
    
    return () => {
      saveSongPosition();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Separate effect for progress updates
  useEffect(() => {
    if (isPlaying) {
      const startProgressUpdates = () => {
        progressInterval.current = setInterval(async () => {
          const progress = await MusicService.getProgress();
          setCurrentTime(progress.position);
          setDuration(progress.duration || 100);
        }, 1000);
      };
      startProgressUpdates();
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  const loadSongPosition = async () => {
    if (song?.id) {
      const savedPosition = await AsyncStorage.getItem(`song_position_${song.id}`);
      if (savedPosition) {
        const position = parseFloat(savedPosition);
        setCurrentTime(position);
        MusicService.seekTo(position);
      }
    }
  };

  const saveSongPosition = async () => {
    if (song?.id && currentTime > 0) {
      await AsyncStorage.setItem(`song_position_${song.id}`, currentTime.toString());
    }
  };

  const initializePlayer = async () => {
    await MusicService.initialize();
    if (song) {
      // Check if it's the same song already playing
      if (currentSong?.id === song.id && MusicService.isPlaying()) {
        // Same song is playing, just update UI
        const progress = await MusicService.getProgress();
        setCurrentTime(progress.position);
        setDuration(progress.duration || 100);
        setIsPlaying(true);
      } else if (currentSong?.id === song.id && !MusicService.isPlaying()) {
        // Same song but paused, resume it
        setIsPlaying(false);
        const progress = await MusicService.getProgress();
        setCurrentTime(progress.position);
        setDuration(progress.duration || 100);
      } else {
        // Different song, play it
        await playSong(song);
        setCurrentSong(song);
        setIsPlaying(true);
        setGlobalPlaying(true);
      }
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await MusicService.pause();
      setGlobalPlaying(false);
      saveSongPosition();
    } else {
      await MusicService.play();
      setGlobalPlaying(true);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSkipNext = useCallback(async () => {
    saveSongPosition();
    await MusicService.skipToNext();
  }, [currentTime]);

  const handleSkipPrevious = useCallback(async () => {
    saveSongPosition();
    await MusicService.skipToPrevious();
  }, [currentTime]);

  const handleSeek = useCallback((value: number) => {
    MusicService.seekTo(value);
    setCurrentTime(value);
  }, []);

  const handleTimerSelect = useCallback((minutes: number, fadeOut: boolean) => {
    MusicService.setSleepTimer(minutes, fadeOut);
    setSelectedTimer(minutes);
  }, []);

  const handleCancelTimer = useCallback(() => {
    MusicService.cancelSleepTimer();
    setSelectedTimer(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setGlobalPlaying(false);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDeleteSong = async () => {
    try {
      // Stop playing
      await stopSong();
      
      // Delete the file
      await MusicService.deleteSong(song.path);
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song. Please check permissions.');
    }
    setShowDeleteModal(false);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/wallpaperimg1.jpg')}
        style={StyleSheet.absoluteFillObject}
        blurRadius={15}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.95)']}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>

      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}>
            <Icon name="back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>NOW PLAYING</Text>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowOptions(!showOptions)}>
            <Icon name="more" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Options Menu */}
        <QuickOptionsMenu
          visible={showOptions}
          onClose={() => setShowOptions(false)}
          onTimerPress={() => setShowTimerModal(true)}
          onDeletePress={() => setShowDeleteModal(true)}
          hasActiveTimer={selectedTimer !== null}
          timerMinutes={selectedTimer || undefined}
        />

        {/* Album Art */}
        <Animated.View 
          style={[
            styles.albumSection,
            {transform: [{scale: scaleAnim}]},
          ]}>
          <View style={styles.albumArt}>
            <Text style={styles.albumEmoji}>🎵</Text>
            
            {selectedTimer && (
              <View style={styles.timerBadge}>
                <Text style={styles.timerBadgeText}>{selectedTimer}m</Text>
              </View>
            )}
          </View>
          
          {/* Song Info */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {song?.title || 'Unknown Song'}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {song?.artist || 'Unknown Artist'}
            </Text>
          </View>
          
          {/* Favorite */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}>
            <Icon 
              name={isFavorite ? "heart-filled" : "heart"} 
              size={32} 
              color={isFavorite ? "#FF0000" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={duration || 100}
            value={currentTime}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            thumbTintColor="#FFFFFF"
          />
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[styles.secondaryControl, isShuffle && styles.activeControl]}
            onPress={() => setIsShuffle(!isShuffle)}>
            <Icon name="shuffle" size={20} color={isShuffle ? "#000000" : "#FFFFFF"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainControl}
            onPress={handleSkipPrevious}>
            <Icon name="previous" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}>
            <LinearGradient
              colors={['#FFFFFF', '#E0E0E0']}
              style={styles.playButtonGradient}>
              <Icon 
                name={isPlaying ? 'pause' : 'play'} 
                size={36} 
                color="#000000" 
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainControl}
            onPress={handleSkipNext}>
            <Icon name="next" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryControl, isRepeat && styles.activeControl]}
            onPress={() => setIsRepeat(!isRepeat)}>
            <Icon name="repeat" size={20} color={isRepeat ? "#000000" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Timer Modal - Separate component, no re-renders */}
      <TimerModal
        visible={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        onSelectTimer={handleTimerSelect}
        onCancelTimer={handleCancelTimer}
        currentTimer={selectedTimer}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModalFast
        visible={showDeleteModal}
        songTitle={song?.title || ''}
        onConfirm={handleDeleteSong}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2,
  },
  albumSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  albumArt: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 30,
    position: 'relative',
  },
  albumEmoji: {
    fontSize: 100,
  },
  timerBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#00FF00',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  timerBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  songTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  songArtist: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  favoriteButton: {
    padding: 10,
  },
  progressSection: {
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  progressSlider: {
    height: 40,
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
    gap: 15,
  },
  mainControl: {
    padding: 10,
  },
  secondaryControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControl: {
    backgroundColor: '#FFFFFF',
  },
  playButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    overflow: 'hidden',
    marginHorizontal: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});