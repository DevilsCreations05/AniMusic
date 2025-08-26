import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Clipboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { GoogleSheetsServiceRN } from '../services/GoogleSheetsServiceRN';
import { GoogleSheetSong } from '../config/googleSheets.config';
import { useMusic } from '../context/MusicContext';
import RNFS from 'react-native-fs';
import { CartoonButton } from '../components/CartoonButton';
import { GoogleSongOptionsModal } from '../components/GoogleSongOptionsModal';

const { width } = Dimensions.get('window');

const Icon = ({ name, size = 24, color = '#000000' }: { name: string; size?: number; color?: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    'back': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </Svg>
    ),
    'search': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </Svg>
    ),
    'play': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M8 5v14l11-7z" />
      </Svg>
    ),
    'cloud': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </Svg>
    ),
    'refresh': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
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

export const GoogleMusicScreen = ({ navigation }: any) => {
  const [songs, setSongs] = useState<GoogleSheetSong[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<GoogleSheetSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingSongs, setDownloadingSongs] = useState<Set<string>>(new Set());
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<GoogleSheetSong | null>(null);
  
  const { playSong, currentSong, isPlaying } = useMusic();
  const googleSheetsService = useRef(GoogleSheetsServiceRN.getInstance()).current;

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [searchQuery, songs]);

  const loadSongs = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const fetchedSongs = await googleSheetsService.fetchAllSongs(forceRefresh);
      setSongs(fetchedSongs);
      setFilteredSongs(fetchedSongs);
    } catch (error) {
      console.error('Error loading Google Sheets songs:', error);
      Alert.alert('Error', 'Failed to load songs from Google Sheets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterSongs = () => {
    if (!searchQuery) {
      setFilteredSongs(songs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = songs.filter(
      song =>
        song.name.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.movie?.toLowerCase().includes(query) ||
        song.genre?.toLowerCase().includes(query)
    );

    setFilteredSongs(filtered);
  };

  const handlePlaySong = async (song: GoogleSheetSong) => {
    try {
      // Update play count - wrap in try/catch to not block playback
      try {
        if (googleSheetsService && typeof googleSheetsService.updatePlayCount === 'function') {
          await googleSheetsService.updatePlayCount(song.id);
        }
      } catch (updateError) {
        console.log('Could not update play count:', updateError);
      }

      // Get direct download link
      const directLink = googleSheetsService.getDriveDirectLink(song.driveLink);
      
      console.log('Original link:', song.driveLink);
      console.log('Direct link:', directLink);

      // Check if it's a simulated link (for testing)
      if (song.driveLink.includes('simulated')) {
        Alert.alert(
          '🎵 Demo Song',
          'This is a simulated song for testing.\n\nTo play real songs:\n1. Upload MP3 files to Google Drive\n2. Share them publicly\n3. Add the share link to your Google Sheet',
          [{ text: 'OK' }]
        );
        return;
      }

      // Play the song directly using the music context
      const songData = {
        id: song.id,
        title: song.name,
        artist: song.artist,
        path: directLink,
        url: directLink,
        album: song.movie,
        isGoogleDrive: true,
      };

      // Play through context
      await playSong(songData);
      
      // Then navigate to player
      navigation.navigate('MusicPlayer', {
        song: songData,
        fromList: true,
        shouldPlay: false // Already playing
      });
    } catch (error) {
      console.error('Error playing song:', error);
      Alert.alert('Error', 'Cannot play this song. Check your internet connection.');
    }
  };

  const handleSongOptions = (song: GoogleSheetSong) => {
    setSelectedSong(song);
    setShowOptionsModal(true);
  };

  const handleCopyLink = () => {
    if (selectedSong) {
      Clipboard.setString(selectedSong.driveLink);
      // Show custom styled alert
      setTimeout(() => {
        Alert.alert('✅ Success', 'Google Drive link copied to clipboard');
      }, 100);
    }
  };

  const handleStreamInfo = () => {
    Alert.alert(
      '☁️ Streaming Info',
      'This song streams directly from Google Drive.\n\n• Requires internet connection\n• No storage space needed\n• Instant playback'
    );
  };

  const renderSongItem = ({ item, index }: { item: GoogleSheetSong; index: number }) => {
    const isCurrentSong = currentSong?.id === item.id;
    const isDownloading = downloadingSongs.has(item.id);

    return (
      <TouchableOpacity
        style={styles.songCard}
        onPress={() => handlePlaySong(item)}
        activeOpacity={0.8}
      >
        <View style={styles.songNumber}>
          <Text style={styles.songNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
          <View style={styles.songDetails}>
            <Icon name="cloud" size={12} color="#999999" />
            <Text style={styles.songDetailsText}>
              {item.movie || item.genre}
            </Text>
            {item.status === 'pending' && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>NEW</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={() => handlePlaySong(item)}
          >
            <Icon name="play" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleSongOptions(item)}
          >
            <Icon name="more" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>☁️</Text>
      <Text style={styles.emptyTitle}>NO SONGS IN CLOUD</Text>
      <Text style={styles.emptySubtitle}>
        {loading ? 'Loading from Google Sheets...' : 'Upload songs to see them here'}
      </Text>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/images/wallpaperimg1.jpg')}
      style={styles.container}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.98)', 'rgba(245, 245, 245, 0.95)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GOOGLE MUSIC</Text>
        <View style={styles.headerRight}>
          <Text style={styles.songCount}>{filteredSongs.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Refresh Button */}
      <View style={styles.scanContainer}>
        <CartoonButton
          title={loading ? 'LOADING...' : 'REFRESH SONGS'}
          onPress={() => loadSongs(true)}
          variant="primary"
          size="medium"
          loading={loading}
          disabled={loading}
        />
      </View>

      {/* Songs List */}
      {loading && songs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading songs from Google Sheets...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}

      {/* Song Options Modal */}
      <GoogleSongOptionsModal
        visible={showOptionsModal}
        songTitle={selectedSong?.name || ''}
        onClose={() => setShowOptionsModal(false)}
        onPlay={() => selectedSong && handlePlaySong(selectedSong)}
        onCopyLink={handleCopyLink}
        onStreamInfo={handleStreamInfo}
      />
    </ImageBackground>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  backButton: {
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
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  headerRight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#000000',
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 10,
  },
  clearButton: {
    fontSize: 20,
    color: '#666666',
    padding: 5,
  },
  scanContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 8,
    marginBottom: 8,
  },
  songNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  songNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  songInfo: {
    flex: 1,
    marginRight: 10,
  },
  songTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 2,
  },
  songDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songDetailsText: {
    fontSize: 10,
    color: '#999999',
    marginLeft: 4,
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
  },
});