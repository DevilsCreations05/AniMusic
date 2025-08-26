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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
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
    'volume': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </Svg>
    ),
    'dots': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Circle cx="12" cy="5" r="2" />
        <Circle cx="12" cy="12" r="2" />
        <Circle cx="12" cy="19" r="2" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const MusicPlayerScreenV2 = ({navigation, route}: any) => {
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
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(0.7);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializePlayer();
    startAnimations();
    
    return () => {
      MusicService.cancelSleepTimer();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPlaying) {
        const progress = await MusicService.getProgress();
        setCurrentTime(progress.position);
        setDuration(progress.duration || 100);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

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

    // Wave animation for visualizer
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await MusicService.pause();
      setGlobalPlaying(false);
    } else {
      await MusicService.play();
      setGlobalPlaying(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkipNext = async () => {
    await MusicService.skipToNext();
  };

  const handleSkipPrevious = async () => {
    await MusicService.skipToPrevious();
  };

  const handleSeek = (value: number) => {
    MusicService.seekTo(value);
    setCurrentTime(value);
  };

  const handleTimerSelect = (minutes: number) => {
    MusicService.setSleepTimer(minutes);
    setSelectedTimer(minutes);
    setShowTimerModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render Timer Modal separately to prevent re-renders
  const TimerModal = () => {
    const timerOptions = [5, 10, 15, 20, 30, 45, 60, 90, 120];
    
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
            
            <ScrollView style={styles.timerGrid} showsVerticalScrollIndicator={false}>
              {timerOptions.map((minutes) => (
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
              
              {selectedTimer && (
                <TouchableOpacity
                  style={[styles.timerOption, styles.timerCancelButton]}
                  onPress={() => {
                    MusicService.cancelSleepTimer();
                    setSelectedTimer(null);
                    setShowTimerModal(false);
                  }}>
                  <Text style={styles.timerCancelText}>CANCEL TIMER</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
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
            onPress={() => setShowVolumeSlider(!showVolumeSlider)}>
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
                {[...Array(5)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.visualizerBar,
                      {
                        height: isPlaying ? 
                          waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20 + i * 10, 60 - i * 5],
                          }) : 20,
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

          {/* Like and Options */}
          <View style={styles.songActions}>
            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}>
              <Icon 
                name={isFavorite ? "heart-filled" : "heart"} 
                size={28} 
                color={isFavorite ? "#FF0000" : "#FFFFFF"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.timerButton} onPress={() => setShowTimerModal(true)}>
              <Icon name="timer" size={24} color="#FFFFFF" />
              {selectedTimer && (
                <View style={styles.timerDot} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity>
              <Icon name="playlist" size={28} color="#FFFFFF" />
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

        {/* Volume Slider (Hidden by default) */}
        {showVolumeSlider && (
          <Animated.View style={styles.volumeContainer}>
            <Icon name="volume" size={20} color="#FFFFFF" />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor="#FFFFFF"
            />
          </Animated.View>
        )}
      </Animated.View>

      {/* Timer Modal */}
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
    height: 80,
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
    gap: 30,
    marginBottom: 20,
  },
  timerButton: {
    position: 'relative',
  },
  timerDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
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
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
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
  timerCancelButton: {
    backgroundColor: '#FF0000',
    marginTop: 10,
  },
  timerCancelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});