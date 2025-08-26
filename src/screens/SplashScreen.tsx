import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../theme';

const {width, height} = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({onAnimationComplete}) => {
  const containerAnim = useRef(new Animated.Value(height)).current;
  const titleAnim = useRef(new Animated.Value(-height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setHidden(true);
    
    // Cartoon-style entrance animation
    Animated.sequence([
      // Container slides up from bottom
      Animated.parallel([
        Animated.spring(containerAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Title drops from top with bounce
      Animated.spring(titleAnim, {
        toValue: 0,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      // Bounce effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        {iterations: 2}
      ),
    ]).start();

    const timer = setTimeout(() => {
      StatusBar.setHidden(false);
      StatusBar.setBarStyle('light-content');
      onAnimationComplete();
    }, 3500);

    return () => {
      clearTimeout(timer);
      StatusBar.setHidden(false);
      StatusBar.setBarStyle('default');
    };
  }, [containerAnim, titleAnim, fadeAnim, bounceAnim, onAnimationComplete]);

  return (
    <ImageBackground
      source={require('../assets/images/wallpaperimg1.jpg')}
      style={styles.container}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.9)']}
        style={styles.overlay}>
        
        {/* Main container sliding from bottom */}
        <Animated.View
          style={[
            styles.mainContainer,
            {
              opacity: fadeAnim,
              transform: [
                {translateY: containerAnim},
                {translateY: bounceAnim},
              ],
            },
          ]}>
          <View style={styles.logoBox}>
            <View style={styles.logoInner}>
              <Animated.Text style={styles.logoText}>AniMusic</Animated.Text>
            </View>
            <View style={styles.logoBottom} />
          </View>
        </Animated.View>

        {/* Title dropping from top */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: titleAnim}],
            },
          ]}>
          <View style={styles.titleBox}>
            <Animated.Text style={styles.titleText}>音楽の冒険</Animated.Text>
            <Animated.Text style={styles.subtitleText}>Musical Adventure</Animated.Text>
          </View>
        </Animated.View>

        {/* Cartoon style decoration lines */}
        <View style={styles.decorationContainer}>
          <View style={styles.decorationLine} />
          <View style={[styles.decorationLine, styles.decorationLine2]} />
          <View style={[styles.decorationLine, styles.decorationLine3]} />
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 4,
    borderColor: '#000000',
    padding: 30,
    paddingBottom: 40,
  },
  logoInner: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 6,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  logoBottom: {
    position: 'absolute',
    bottom: -15,
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#000000',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  titleContainer: {
    position: 'absolute',
    top: 100,
  },
  titleBox: {
    backgroundColor: '#000000',
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  decorationContainer: {
    position: 'absolute',
    width: width,
    height: height,
    pointerEvents: 'none',
  },
  decorationLine: {
    position: 'absolute',
    width: 150,
    height: 4,
    backgroundColor: '#FFFFFF',
    top: height / 2 - 100,
    left: -50,
    transform: [{rotate: '45deg'}],
  },
  decorationLine2: {
    top: height / 2,
    right: -50,
    left: undefined,
    transform: [{rotate: '-45deg'}],
  },
  decorationLine3: {
    top: height / 2 + 100,
    left: 50,
    transform: [{rotate: '30deg'}],
  },
});