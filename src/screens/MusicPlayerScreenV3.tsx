import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  ImageBackground,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MusicService from '../services/MusicService';
import {useMusic} from '../context/MusicContext';
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
        <Path d="M5 3l14 9-14 9V3z" />
      </Svg>
    ),
    'pause': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Rect x="6" y="4" width="4" height="16" fill={color} />
        <Rect x="14" y="4" width="4" height="16" fill={color} />
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
    'playlist': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
      </Svg>
    ),
    'dots': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Circle cx="12" cy="5" r="2" />
        <Circle cx="12" cy="12" r="2" />
        <Circle cx="12" cy="19" r="2" />
      </Svg>
    ),
    'speed': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44z" />
        <Path d="M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z" />
      </Svg>
    ),
    'queue': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
      </Svg>
    ),
    'close': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const MusicPlayerScreenV3 = ({navigation, route}: any) => {
  const song = route.params?.song;
  const {setCurrentSong, setIsPlaying: setGlobalPlaying, playSong} = useMusic();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [fadeOut, setFadeOut] = useState(false);
  const [customTimerValue, setCustomTimerValue] = useState('');
  const [timerMode, setTimerMode] = useState<'preset' | 'custom'>('preset');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const barHeights = useRef([
    new Animated.Value(20),
    new Animated.Value(30),
    new Animated.Value(25),
    new Animated.Value(35),
    new Animated.Value(28),
  ]).current;

  useEffect(() => {
    initializePlayer();
    startAnimations();
    loadSongPosition();
    
    return () => {
      saveSongPosition();
      MusicService.cancelSleepTimer();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPlaying) {
        const progress = await MusicService.getProgress();
        setCurrentTime(progress.position);
        setDuration(progress.duration || 100);
        
        // Auto-save position every 5 seconds
        if (Math.floor(progress.position) % 5 === 0) {
          saveSongPosition();
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

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
      await playSong(song);
      setCurrentSong(song);
      setIsPlaying(true);
      setGlobalPlaying(true);
    }
  };

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Visualizer bars animation (using transform instead of height)
    barHeights.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 40 + Math.random() * 20,
            duration: 300 + index * 100,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 20 + Math.random() * 10,
            duration: 300 + index * 100,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await MusicService.pause();
      setGlobalPlaying(false);
      saveSongPosition();
    } else {
      await MusicService.play();
      setGlobalPlaying(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkipNext = async () => {
    saveSongPosition();
    await MusicService.skipToNext();
  };

  const handleSkipPrevious = async () => {
    saveSongPosition();
    await MusicService.skipToPrevious();
  };

  const handleSeek = (value: number) => {
    MusicService.seekTo(value);
    setCurrentTime(value);
  };

  const handleTimerSelect = (minutes: number) => {
    MusicService.setSleepTimer(minutes, fadeOut);
    setSelectedTimer(minutes);
    setShowTimerModal(false);
  };

  const handleCustomTimer = () => {
    const minutes = parseInt(customTimerValue);
    if (minutes > 0 && minutes <= 999) {
      handleTimerSelect(minutes);
      setCustomTimerValue('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    // Here you would actually change the playback speed
    // MusicService.setPlaybackSpeed(nextSpeed);
  };

  // Options Menu Modal
  const OptionsMenu = () => (
    <Modal
      visible={showOptionsMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowOptionsMenu(false)}>
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowOptionsMenu(false)}>
        <View style={styles.optionsMenuContent}>
          <View style={styles.optionsMenuHeader}>
            <Text style={styles.optionsMenuTitle}>OPTIONS</Text>
            <TouchableOpacity onPress={() => setShowOptionsMenu(false)}>
              <Icon name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sleep Timer Option */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsMenu(false);
                setShowTimerModal(true);
              }}>
              <Icon name="timer" size={24} color="#000000" />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Sleep Timer</Text>
                <Text style={styles.optionSubtitle}>
                  {selectedTimer ? `Active: ${selectedTimer} min` : 'Set a sleep timer'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Playback Speed */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={changePlaybackSpeed}>
              <Icon name="speed" size={24} color="#000000" />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Playback Speed</Text>
                <Text style={styles.optionSubtitle}>{playbackSpeed}x</Text>
              </View>
            </TouchableOpacity>

            {/* Queue */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsMenu(false);
                setShowQueueModal(true);
              }}>
              <Icon name="queue" size={24} color="#000000" />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Queue</Text>
                <Text style={styles.optionSubtitle}>Manage play queue</Text>
              </View>
            </TouchableOpacity>

            {/* Add to Playlist */}
            <TouchableOpacity style={styles.optionItem}>
              <Icon name="playlist" size={24} color="#000000" />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Add to Playlist</Text>
                <Text style={styles.optionSubtitle}>Save to your playlists</Text>
              </View>
            </TouchableOpacity>

            {/* Song Info */}
            <View style={styles.optionItem}>
              <Icon name="dots" size={24} color="#000000" />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Song Info</Text>
                <Text style={styles.optionSubtitle}>{song?.path || 'Unknown'}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Enhanced Timer Modal
  const TimerModal = () => {
    const timerPresets = [5, 10, 15, 20, 30, 45, 60, 90, 120];
    
    return (
      <Modal
        visible={showTimerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimerModal(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimerModal(false)}>
          <View style={styles.timerModalContent}>
            <View style={styles.timerModalHeader}>
              <Text style={styles.timerModalTitle}>SLEEP TIMER</Text>
              <TouchableOpacity onPress={() => setShowTimerModal(false)}>
                <Text style={styles.timerModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Timer Mode Toggle */}
            <View style={styles.timerModeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, timerMode === 'preset' && styles.modeButtonActive]}
                onPress={() => setTimerMode('preset')}>
                <Text style={[styles.modeButtonText, timerMode === 'preset' && styles.modeButtonTextActive]}>
                  PRESET
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, timerMode === 'custom' && styles.modeButtonActive]}
                onPress={() => setTimerMode('custom')}>
                <Text style={[styles.modeButtonText, timerMode === 'custom' && styles.modeButtonTextActive]}>
                  CUSTOM
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fade Out Option */}
            <View style={styles.fadeOutOption}>
              <Text style={styles.fadeOutLabel}>Fade out when timer ends</Text>
              <Switch
                value={fadeOut}
                onValueChange={setFadeOut}
                trackColor={{false: '#E0E0E0', true: '#000000'}}
                thumbColor={fadeOut ? '#FFFFFF' : '#666666'}
              />
            </View>
            
            {timerMode === 'preset' ? (
              <ScrollView style={styles.timerGrid} showsVerticalScrollIndicator={false}>
                {timerPresets.map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.timerOption,
                      selectedTimer === minutes && styles.timerOptionActive,
                    ]}
                    onPress={() => handleTimerSelect(minutes)}>
                    <Text style={[
                      styles.timerOptionText,
                      selectedTimer === minutes && styles.timerOptionTextActive,
                    ]}>
                      {minutes}
                    </Text>
                    <Text style={[
                      styles.timerOptionLabel,
                      selectedTimer === minutes && styles.timerOptionLabelActive,
                    ]}>
                      MIN
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.customTimerContainer}>
                <TextInput
                  style={styles.customTimerInput}
                  placeholder="Enter minutes (1-999)"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  maxLength={3}
                  value={customTimerValue}
                  onChangeText={setCustomTimerValue}
                />
                <TouchableOpacity
                  style={styles.customTimerButton}
                  onPress={handleCustomTimer}>
                  <Text style={styles.customTimerButtonText}>SET TIMER</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {selectedTimer && (
              <TouchableOpacity
                style={styles.timerCancelButton}
                onPress={() => {
                  MusicService.cancelSleepTimer();
                  setSelectedTimer(null);
                  setShowTimerModal(false);
                }}>
                <Text style={styles.timerCancelText}>CANCEL TIMER</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/wallpaperimg1.jpg')}
        style={StyleSheet.absoluteFillObject}
        blurRadius={20}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 1)']}
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
            onPress={() => setShowOptionsMenu(true)}>
            <Icon name="dots" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Album Art Section */}
        <Animated.View 
          style={[
            styles.albumSection,
            {
              transform: [
                {translateY: slideAnim},
                {scale: scaleAnim},
              ],
            },
          ]}>
          <View style={styles.albumContainer}>
            <View style={styles.albumArt}>
              {/* Visualizer Bars */}
              <View style={styles.visualizer}>
                {barHeights.map((animHeight, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.visualizerBar,
                      {
                        height: isPlaying ? animHeight : 20,
                      },
                    ]}
                  />
                ))}
              </View>
              
              <Text style={styles.albumEmoji}>🎵</Text>
              
              {/* Timer Badge */}
              {selectedTimer && (
                <View style={styles.timerBadge}>
                  <Icon name="timer" size={16} color="#000000" />
                  <Text style={styles.timerBadgeText}>{selectedTimer}m</Text>
                </View>
              )}

              {/* Speed Badge */}
              {playbackSpeed !== 1.0 && (
                <View style={styles.speedBadge}>
                  <Text style={styles.speedBadgeText}>{playbackSpeed}x</Text>
                </View>
              )}
            </View>
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

          {/* Action Buttons */}
          <View style={styles.songActions}>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
              <Icon 
                name={isFavorite ? "heart-filled" : "heart"} 
                size={28} 
                color={isFavorite ? "#FF0000" : "#FFFFFF"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowQueueModal(true)}>
              <Icon name="queue" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowTimerModal(true)}>
              <Icon name="timer" size={28} color={selectedTimer ? "#00FF00" : "#FFFFFF"} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={changePlaybackSpeed}>
              <Icon name="speed" size={28} color={playbackSpeed !== 1.0 ? "#00FF00" : "#FFFFFF"} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Progress Section */}
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
            onValueChange={handleSeek}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
            thumbTintColor="#FFFFFF"
          />
        </View>

        {/* Main Controls */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[styles.secondaryControl, isShuffle && styles.activeControl]}
            onPress={() => setIsShuffle(!isShuffle)}>
            <Icon name="shuffle" size={20} color={isShuffle ? "#000000" : "#FFFFFF"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainControl}
            onPress={handleSkipPrevious}>
            <Icon name="previous" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}>
            <LinearGradient
              colors={['#FFFFFF', '#F0F0F0']}
              style={styles.playButtonGradient}>
              <Icon 
                name={isPlaying ? 'pause' : 'play'} 
                size={32} 
                color="#000000" 
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainControl}
            onPress={handleSkipNext}>
            <Icon name="next" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryControl, isRepeat && styles.activeControl]}
            onPress={() => setIsRepeat(!isRepeat)}>
            <Icon name="repeat" size={20} color={isRepeat ? "#000000" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Modals */}
      <OptionsMenu />
      <TimerModal />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    opacity: 0.8,
  },
  albumSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  albumContainer: {
    marginBottom: 30,
  },
  albumArt: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  visualizer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  visualizerBar: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  albumEmoji: {
    fontSize: 100,
    opacity: 0.8,
  },
  timerBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 4,
  },
  speedBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  speedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  songArtist: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  songActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 25,
    marginBottom: 20,
  },
  progressSection: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
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
    paddingBottom: 40,
    gap: 20,
  },
  mainControl: {
    padding: 10,
  },
  secondaryControl: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControl: {
    backgroundColor: '#FFFFFF',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  // Options Menu Styles
  optionsMenuContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  optionsMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  optionsMenuTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  // Timer Modal Styles
  timerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  timerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  timerModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  timerModalClose: {
    fontSize: 24,
    color: '#666666',
  },
  timerModeToggle: {
    flexDirection: 'row',
    marginHorizontal: 25,
    marginBottom: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#000000',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  fadeOutOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 15,
  },
  fadeOutLabel: {
    fontSize: 14,
    color: '#333333',
  },
  timerGrid: {
    paddingHorizontal: 20,
  },
  timerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingVertical: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timerOptionActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  timerOptionText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginRight: 8,
  },
  timerOptionTextActive: {
    color: '#FFFFFF',
  },
  timerOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  timerOptionLabelActive: {
    color: '#FFFFFF',
  },
  customTimerContainer: {
    paddingHorizontal: 25,
  },
  customTimerInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  customTimerButton: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  customTimerButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  timerCancelButton: {
    backgroundColor: '#FF0000',
    marginHorizontal: 25,
    marginTop: 15,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  timerCancelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});