import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  ImageBackground,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {CartoonSidebar} from '../components/CartoonSidebar';
import {CartoonButton} from '../components/CartoonButton';
import Svg, {Path} from 'react-native-svg';

const {width, height} = Dimensions.get('window');

const Icon = ({name, size = 24, color = '#000000'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'menu': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
      </Svg>
    ),
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
    'heart': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    ),
    'more': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const MusicHomeScreen = ({navigation}: any) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | string | null>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mock data for music
  const featuredSongs = [
    {id: 1, title: 'Binks\' Sake', artist: 'One Piece', genre: 'Anime'},
    {id: 2, title: 'We Are!', artist: 'One Piece OP1', genre: 'Opening'},
    {id: 3, title: 'Overtaken', artist: 'One Piece OST', genre: 'Soundtrack'},
  ];

  const recentlyPlayed = [
    {id: 4, title: 'Blue Bird', artist: 'Naruto', genre: 'Opening'},
    {id: 5, title: 'Unravel', artist: 'Tokyo Ghoul', genre: 'Opening'},
    {id: 6, title: 'Gurenge', artist: 'Demon Slayer', genre: 'Opening'},
    {id: 7, title: 'Shinzou wo Sasageyo', artist: 'Attack on Titan', genre: 'Opening'},
  ];

  useEffect(() => {
    // Bounce animation for floating elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for playing indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const togglePlay = (songId: number) => {
    setCurrentlyPlaying(currentlyPlaying === songId ? null : songId);
  };

  const renderSongCard = ({item}: any) => (
    <TouchableOpacity 
      style={styles.songCard} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('MusicPlayer', { song: item })}>
      <View style={styles.songCardInner}>
        <View style={styles.songNumber}>
          <Text style={styles.songNumberText}>{item.id}</Text>
        </View>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{item.title}</Text>
          <Text style={styles.songArtist}>{item.artist}</Text>
          <View style={styles.genreBubble}>
            <Text style={styles.genreText}>{item.genre}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.playButton,
            currentlyPlaying === item.id && styles.playingButton
          ]}
          onPress={() => togglePlay(item.id)}>
          <Animated.View
            style={[
              currentlyPlaying === item.id && {
                transform: [{scale: pulseAnim}]
              }
            ]}>
            <Icon
              name={currentlyPlaying === item.id ? 'pause' : 'play'}
              size={16}
              color={currentlyPlaying === item.id ? '#000000' : '#FFFFFF'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/wallpaperimg1.jpg')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover">
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 240, 240, 0.9)']}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSidebarOpen(true)}>
          <Icon name="menu" size={28} color="#000000" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>ANIMUSIC</Text>
        </View>
        <View style={styles.headerBubble} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Animated.View
          style={[
            styles.welcomeCard,
            {transform: [{translateY: bounceAnim}]}
          ]}>
          <Text style={styles.welcomeTitle}>WELCOME BACK!</Text>
          <Text style={styles.welcomeSubtitle}>Ready for some epic music?</Text>
          <View style={styles.welcomeBubbles}>
            <View style={[styles.bubble, styles.bubble1]} />
            <View style={[styles.bubble, styles.bubble2]} />
            <View style={[styles.bubble, styles.bubble3]} />
          </View>
        </Animated.View>

        {/* Featured Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FEATURED</Text>
            <View style={styles.sectionLine} />
          </View>
          <FlatList
            data={featuredSongs}
            renderItem={renderSongCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Recently Played Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENTLY PLAYED</Text>
            <View style={styles.sectionLine} />
          </View>
          <FlatList
            data={recentlyPlayed}
            renderItem={renderSongCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <CartoonButton
            title="BROWSE ALL"
            onPress={() => navigation.navigate('Browse')}
            variant="primary"
            size="large"
          />
          <CartoonButton
            title="MY PLAYLISTS"
            onPress={() => navigation.navigate('Playlists')}
            variant="secondary"
            size="large"
          />
        </View>
      </ScrollView>

      {/* Mini Player */}
      {currentlyPlaying && (
        <View style={styles.miniPlayer}>
          <View style={styles.miniPlayerContent}>
            <View style={styles.miniPlayerInfo}>
              <Text style={styles.miniPlayerTitle}>
                {featuredSongs.find(s => s.id === currentlyPlaying)?.title ||
                 recentlyPlayed.find(s => s.id === currentlyPlaying)?.title}
              </Text>
              <Text style={styles.miniPlayerArtist}>
                {featuredSongs.find(s => s.id === currentlyPlaying)?.artist ||
                 recentlyPlayed.find(s => s.id === currentlyPlaying)?.artist}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.miniPlayerButton}
              onPress={() => setCurrentlyPlaying(null)}>
              <Icon name="pause" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.miniPlayerProgress}>
            <View style={styles.miniPlayerProgressBar} />
          </View>
        </View>
      )}

      {/* Sidebar */}
      <CartoonSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
        currentRoute="Home"
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  headerBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    margin: 20,
    padding: 18,
    backgroundColor: '#000000',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 3,
    opacity: 0.9,
  },
  welcomeBubbles: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bubble1: {
    width: 60,
    height: 60,
    right: 0,
    top: 0,
  },
  bubble2: {
    width: 40,
    height: 40,
    right: 50,
    top: 30,
  },
  bubble3: {
    width: 25,
    height: 25,
    right: 20,
    top: 60,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#000000',
    marginLeft: 12,
  },
  songCard: {
    marginBottom: 8,
  },
  songCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 10,
  },
  songNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 3,
  },
  genreBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  genreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  quickActions: {
    padding: 20,
    gap: 10,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    borderTopWidth: 2,
    borderTopColor: '#FFFFFF',
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  miniPlayerArtist: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 1,
  },
  miniPlayerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayerProgress: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  miniPlayerProgressBar: {
    height: 3,
    width: '40%',
    backgroundColor: '#FFFFFF',
  },
});