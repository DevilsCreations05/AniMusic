import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import {useRoute, RouteProp} from '@react-navigation/native';
import {theme} from '../theme';
import {ISong} from '../database/models/Song';
import {FavoriteModel} from '../database/models/Favorite';
import {DownloadModel} from '../database/models/Download';
import {AuthService} from '../services/AuthService';
// import LottieView from 'lottie-react-native';
import Svg, {Path} from 'react-native-svg';

const {width: screenWidth} = Dimensions.get('window');

type PlayerScreenRouteProp = RouteProp<{
  Player: {song: ISong};
}, 'Player'>;

const Icon = ({name, size = 24, color}: {name: string; size?: number; color: string}) => {
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
    'heart': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    ),
    'heart-outline': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" stroke={color} strokeWidth="2"/>
      </Svg>
    ),
    'download': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
      </Svg>
    ),
    'share': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const PlayerScreen = () => {
  const route = useRoute<PlayerScreenRouteProp>();
  const song = route.params?.song;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes default
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const authService = AuthService.getInstance();
  const favoriteModel = new FavoriteModel();
  const downloadModel = new DownloadModel();

  useEffect(() => {
    if (song) {
      checkFavoriteStatus();
      checkDownloadStatus();
    }
  }, [song]);

  const checkFavoriteStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && song?.id) {
        const favorites = await favoriteModel.findByUser(user.id!);
        setIsFavorite(favorites.some(fav => fav.song_id === song.id));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const checkDownloadStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && song?.id) {
        const downloads = await downloadModel.findByUser(user.id!);
        setIsDownloaded(downloads.some(dl => dl.song_id === song.id));
      }
    } catch (error) {
      console.error('Error checking download status:', error);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In production, this would control actual audio playback
  };

  const toggleFavorite = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Login Required', 'Please login to add favorites');
        return;
      }

      if (!song?.id) return;

      if (isFavorite) {
        await favoriteModel.remove(user.id!, song.id);
        setIsFavorite(false);
        Alert.alert('Removed', 'Song removed from favorites');
      } else {
        await favoriteModel.create({
          user_id: user.id!,
          song_id: song.id,
        });
        setIsFavorite(true);
        Alert.alert('Added', 'Song added to favorites');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleDownload = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Login Required', 'Please login to download songs');
        return;
      }

      if (!song?.id) return;

      if (isDownloaded) {
        Alert.alert('Already Downloaded', 'This song is already in your downloads');
        return;
      }

      await downloadModel.create({
        user_id: user.id!,
        song_id: song.id,
        file_path: 'local://downloads/' + song.name.replace(/\s+/g, '_') + '.mp3',
      });
      
      setIsDownloaded(true);
      Alert.alert('Success', 'Song downloaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to download song');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!song) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No song selected</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.colors.background.gradient}
      style={styles.container}>
      <View style={styles.albumArtContainer}>
        {song.cover_url ? (
          <Image source={{uri: song.cover_url}} style={styles.albumArt} />
        ) : (
          <View style={styles.albumArtPlaceholder}>
            {/* <LottieView
              source={require('../assets/animations/music-visualizer.json')}
              autoPlay
              loop
              style={styles.visualizer}
            /> */}
            <Text style={styles.tempVisualizer}>🎶</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.songTitle}>{song.name}</Text>
        <Text style={styles.artistName}>{song.artist}</Text>
        {song.movie && <Text style={styles.movieName}>{song.movie}</Text>}
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          onValueChange={setCurrentTime}
          minimumTrackTintColor={theme.colors.primary.pink}
          maximumTrackTintColor={theme.colors.secondary.lavender}
          thumbTintColor={theme.colors.primary.purple}
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="skip-previous" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={togglePlayPause}>
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="skip-next" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? theme.colors.primary.pink : 'white'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Icon
            name="download"
            size={24}
            color={isDownloaded ? theme.colors.status.success : 'white'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light,
  },
  errorText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.text.secondary,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  albumArt: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.large,
  },
  albumArtPlaceholder: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: theme.borderRadius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  visualizer: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.l,
  },
  songTitle: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.s,
    textShadowColor: theme.colors.shadow.dark,
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  artistName: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.primary.sakura,
    textAlign: 'center',
  },
  movieName: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.secondary.lavender,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: theme.spacing.s,
  },
  timeText: {
    fontSize: theme.typography.fontSize.small,
    color: 'white',
    minWidth: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  controlButton: {
    padding: theme.spacing.m,
    marginHorizontal: theme.spacing.m,
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.l,
    ...theme.shadows.medium,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  actionButton: {
    padding: theme.spacing.m,
    marginHorizontal: theme.spacing.l,
  },
  tempVisualizer: {
    fontSize: 100,
  },
});