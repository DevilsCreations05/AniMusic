import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import MusicService from '../services/MusicService';
import Svg, {Path} from 'react-native-svg';

const {width} = Dimensions.get('window');

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
    'close': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

interface GlobalMiniPlayerProps {
  navigation: any;
  currentSong: any;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  currentRoute?: string;
}

export const GlobalMiniPlayer: React.FC<GlobalMiniPlayerProps> = ({
  navigation,
  currentSong,
  isPlaying,
  onPlayPause,
  onClose,
  currentRoute,
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentSong) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Animate progress bar
      if (isPlaying) {
        Animated.loop(
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 30000, // 30 seconds for demo
            useNativeDriver: false,
          })
        ).start();
      } else {
        progressAnim.stopAnimation();
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSong, isPlaying]);

  // Don't show mini player on MusicPlayer screen or if no song is playing
  if (!currentSong || currentRoute === 'MusicPlayer') return null;

  const handlePress = () => {
    // Navigate without restarting the song
    navigation.navigate('MusicPlayer', { 
      song: currentSong,
      fromMiniPlayer: true 
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.9}
        onPress={handlePress}>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={onPlayPause}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={24} color="#000000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}>
            <Icon name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    borderTopWidth: 3,
    borderTopColor: '#FFFFFF',
    zIndex: 999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  songInfo: {
    flex: 1,
    marginRight: 10,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});