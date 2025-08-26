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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import MusicService from '../services/MusicService';
import {CircularTimerPicker} from '../components/CircularTimerPicker';
import {useMusic} from '../context/MusicContext';
import Svg, {Path} from 'react-native-svg';

const {width, height} = Dimensions.get('window');

const Icon = ({name, size = 24, color = '#FFFFFF'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'play': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M8 5v14l11-7z" />
      </Svg>
    ),
    'pause': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </Svg>
    ),
    'skip-next': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      </Svg>
    ),
    'skip-previous': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
      </Svg>
    ),
    'repeat': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
      </Svg>
    ),
    'shuffle': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
      </Svg>
    ),
    'timer': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </Svg>
    ),
    'back': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </Svg>
    ),
    'stop': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 6h12v12H6z" />
      </Svg>
    ),
    'heart': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const MusicPlayerScreen = ({navigation, route}: any) => {
  const song = route.params?.song;
  const {setCurrentSong, setIsPlaying: setGlobalPlaying, playSong} = useMusic();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializePlayer();
    startAnimations();
    
    return () => {
      MusicService.cancelSleepTimer();
    };
  }, []);

  useEffect(() => {
    // Update progress periodically
    const interval = setInterval(async () => {
      if (isPlaying) {
        const progress = await MusicService.getProgress();
        setCurrentTime(progress.position);
        setDuration(progress.duration || 100);
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
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
    // Pulse animation for play button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // No rotation animation
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

  const handleStop = async () => {
    await MusicService.stop();
    setIsPlaying(false);
    setGlobalPlaying(false);
    setCurrentSong(null);
    setCurrentTime(0);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTimerSelect = (minutes: number) => {
    MusicService.setSleepTimer(minutes);
    setSelectedTimer(minutes);
    setShowTimerModal(false);
  };

  const TimerModal = () => (
    <CircularTimerPicker
      visible={showTimerModal}
      onSelect={handleTimerSelect}
      onCancel={() => setShowTimerModal(false)}
    />
  );


  return (
    <ImageBackground
      source={require('../assets/images/wallpaperimg1.jpg')}
      style={styles.container}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.95)']}
        style={styles.overlay}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NOW PLAYING</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}>
            <Icon name="heart" size={24} color={isFavorite ? '#FF0000' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Album Art */}
          <View style={styles.albumContainer}>
            <View style={styles.albumArt}>
              <View style={styles.albumInner}>
                <Text style={styles.albumText}>🎵</Text>
              </View>
              <View style={styles.vinylHole} />
            </View>
            {selectedTimer && (
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>{selectedTimer} MIN</Text>
              </View>
            )}
          </View>

          {/* Song Info */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{song?.title || 'Unknown Song'}</Text>
            <Text style={styles.songArtist}>{song?.artist || 'Unknown Artist'}</Text>
            {song?.album && (
              <View style={styles.albumBubble}>
                <Text style={styles.albumName}>{song.album}</Text>
              </View>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 100}
              value={currentTime}
              onValueChange={handleSeek}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor="#FFFFFF"
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Main Controls */}
          <View style={styles.mainControls}>
            <TouchableOpacity
              style={[styles.controlButton, isShuffle && styles.activeControl]}
              onPress={() => setIsShuffle(!isShuffle)}>
              <Icon name="shuffle" size={24} color={isShuffle ? '#000000' : '#FFFFFF'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipPrevious}>
              <Icon name="skip-previous" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}>
              <Animated.View style={{transform: [{scale: pulseAnim}]}}>
                <View style={styles.playButtonInner}>
                  <Icon
                    name={isPlaying ? 'pause' : 'play'}
                    size={36}
                    color="#000000"
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipNext}>
              <Icon name="skip-next" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isRepeat && styles.activeControl]}
              onPress={() => setIsRepeat(!isRepeat)}>
              <Icon name="repeat" size={24} color={isRepeat ? '#000000' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>

          {/* Stop Button */}
          <View style={styles.stopButtonContainer}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStop}>
              <Icon name="stop" size={24} color="#FFFFFF" />
              <Text style={styles.stopButtonText}>STOP</Text>
            </TouchableOpacity>
          </View>

          {/* Sleep Timer Button */}
          <View style={styles.timerContainer}>
            <TouchableOpacity
              style={styles.timerButton}
              onPress={() => setShowTimerModal(true)}>
              <Icon name="timer" size={24} color="#000000" />
              <Text style={styles.timerButtonText}>
                {selectedTimer ? `${selectedTimer} MIN` : 'SET TIMER'}
              </Text>
            </TouchableOpacity>
            {selectedTimer && (
              <TouchableOpacity
                style={styles.cancelTimerButton}
                onPress={() => {
                  MusicService.cancelSleepTimer();
                  setSelectedTimer(null);
                }}>
                <Text style={styles.cancelTimerText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Decorative Elements */}
          <View style={styles.bubbleContainer}>
            <View style={[styles.bubble, styles.bubble1]} />
            <View style={[styles.bubble, styles.bubble2]} />
            <View style={[styles.bubble, styles.bubble3]} />
          </View>
        </ScrollView>

        {/* Timer Modal */}
        <TimerModal />
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  albumContainer: {
    alignItems: 'center',
    marginVertical: 30,
    position: 'relative',
  },
  albumArt: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  albumInner: {
    width: '80%',
    height: '80%',
    borderRadius: width * 0.28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumText: {
    fontSize: 80,
  },
  vinylHole: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
  },
  timerBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 3,
    borderColor: '#000000',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  songArtist: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 10,
  },
  albumBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  albumName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    minWidth: 45,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  activeControl: {
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    padding: 10,
    marginHorizontal: 15,
  },
  playButton: {
    marginHorizontal: 20,
  },
  playButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000000',
  },
  stopButtonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#000000',
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderWidth: 3,
    borderColor: '#000000',
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginLeft: 10,
    letterSpacing: 1,
  },
  cancelTimerButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  cancelTimerText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bubbleContainer: {
    position: 'absolute',
    width: width,
    height: '100%',
    pointerEvents: 'none',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bubble1: {
    width: 60,
    height: 60,
    top: 50,
    left: 20,
  },
  bubble2: {
    width: 40,
    height: 40,
    top: 150,
    right: 30,
  },
  bubble3: {
    width: 80,
    height: 80,
    bottom: 100,
    left: 40,
  },
});