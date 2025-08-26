import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface AnimeErrorPopupProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

const ErrorIcon = ({ size = 60 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    {/* Anime-style error icon */}
    <Circle cx="30" cy="30" r="28" stroke="#000" strokeWidth="3" fill="none" />
    <Path
      d="M20 20 L40 40 M40 20 L20 40"
      stroke="#000"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Anime speed lines */}
    <Path d="M5 15 L10 15" stroke="#000" strokeWidth="2" opacity="0.5" />
    <Path d="M50 15 L55 15" stroke="#000" strokeWidth="2" opacity="0.5" />
    <Path d="M5 45 L10 45" stroke="#000" strokeWidth="2" opacity="0.5" />
    <Path d="M50 45 L55 45" stroke="#000" strokeWidth="2" opacity="0.5" />
  </Svg>
);

export const AnimeErrorPopup: React.FC<AnimeErrorPopupProps> = ({
  visible,
  message,
  onClose,
  duration = 2000,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Anime-style entrance animation
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            tension: 200,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Manga-style background pattern */}
          <View style={styles.mangaPattern}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.speedLine,
                  {
                    transform: [
                      { rotate: `${i * 45}deg` },
                    ],
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.content}>
            <ErrorIcon size={60} />
            <Text style={styles.errorText}>ERROR!</Text>
            <Text style={styles.message}>{message}</Text>
            
            {/* Anime-style action lines */}
            <View style={styles.actionLines}>
              <View style={styles.line} />
              <View style={styles.line} />
              <View style={styles.line} />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 0, // Sharp edges for manga style
    borderWidth: 4,
    borderColor: '#000000',
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mangaPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedLine: {
    position: 'absolute',
    width: 2,
    height: '150%',
    backgroundColor: '#000',
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  errorText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    marginTop: 10,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  message: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
    maxWidth: '90%',
  },
  actionLines: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 5,
  },
  line: {
    width: 20,
    height: 3,
    backgroundColor: '#000000',
    opacity: 0.5,
  },
});

// Helper function to show error popup
export const showAnimeError = (message: string) => {
  // This would be implemented with a global state or event emitter
  console.error('Anime Error:', message);
};