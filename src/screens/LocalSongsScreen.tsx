import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MusicService, {LocalSong} from '../services/MusicService';
import {PermissionAlert} from '../components/CartoonAlert';
import {CartoonButton} from '../components/CartoonButton';
import {DeleteConfirmModalFast} from '../components/DeleteConfirmModalFast';
import {SongOptionsModal} from '../components/SongOptionsModal';
import Svg, {Path, Circle} from 'react-native-svg';
import {useMusic} from '../context/MusicContext';

const {width} = Dimensions.get('window');

const Icon = ({name, size = 24, color = '#000000'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
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
    'scan': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </Svg>
    ),
    'folder': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
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

export const LocalSongsScreen = ({navigation}: any) => {
  const [songs, setSongs] = useState<LocalSong[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<LocalSong[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<LocalSong | null>(null);
  const {currentSong, stopSong} = useMusic();

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [searchQuery, songs]);

  const loadSongs = async () => {
    setIsLoading(true);
    setScanProgress('Checking permissions...');
    
    try {
      const hasPermission = await MusicService.requestStoragePermission();
      if (!hasPermission) {
        setShowPermissionDialog(true);
        setIsLoading(false);
        return;
      }

      setScanProgress('Scanning music folders...');
      const localSongs = await MusicService.getLocalSongs();
      setSongs(localSongs);
      setFilteredSongs(localSongs);
      setScanProgress(`Found ${localSongs.length} songs`);
    } catch (error) {
      console.error('Error loading songs:', error);
      setScanProgress('Error loading songs');
    } finally {
      setIsLoading(false);
      setTimeout(() => setScanProgress(''), 3000);
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
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
    setFilteredSongs(filtered);
  };

  const handleSongPress = (song: LocalSong) => {
    // Check if this song is already playing
    if (currentSong?.id === song.id) {
      // Just navigate, don't restart
      navigation.navigate('MusicPlayer', {
        song,
        fromList: true,
        shouldPlay: false
      });
    } else {
      // Different song, play it
      navigation.navigate('MusicPlayer', {
        song,
        fromList: true,
        shouldPlay: true
      });
    }
  };

  const handleOptionsPress = (song: LocalSong) => {
    setSelectedSong(song);
    setShowOptionsModal(true);
  };

  const handleDeletePress = () => {
    setShowOptionsModal(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSong) return;
    
    try {
      // Stop the song if it's currently playing
      if (currentSong?.id === selectedSong.id) {
        await stopSong();
      }
      
      // Delete the file
      await MusicService.deleteSong(selectedSong.path);
      
      // Remove from list
      const updatedSongs = songs.filter(s => s.id !== selectedSong.id);
      setSongs(updatedSongs);
      setFilteredSongs(updatedSongs);
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedSong(null);
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song. Please check permissions.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handlePlayFromOptions = () => {
    if (selectedSong) {
      handleSongPress(selectedSong);
    }
  };

  const handlePermissionAllow = async () => {
    setShowPermissionDialog(false);
    await loadSongs();
  };

  const handlePermissionDeny = () => {
    setShowPermissionDialog(false);
    navigation.goBack();
  };

  const renderSong = ({item, index}: {item: LocalSong; index: number}) => (
    <TouchableOpacity
      style={styles.songCard}
      onPress={() => handleSongPress(item)}
      activeOpacity={0.8}>
      <View style={styles.songNumber}>
        <Text style={styles.songNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
        <View style={styles.songPath}>
          <Icon name="folder" size={12} color="#999999" />
          <Text style={styles.songPathText} numberOfLines={1}>
            {item.path.split('/').slice(-2).join('/')}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.playButton} onPress={() => handleSongPress(item)}>
          <Icon name="play" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.moreButton} 
          onPress={() => handleOptionsPress(item)}>
          <Icon name="more" size={20} color="#000000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎵</Text>
      <Text style={styles.emptyTitle}>NO SONGS FOUND</Text>
      <Text style={styles.emptySubtitle}>
        {isLoading ? 'Scanning...' : 'Tap scan to search for music files'}
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
        <Text style={styles.headerTitle}>LOCAL SONGS</Text>
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

      {/* Scan Button and Progress */}
      <View style={styles.scanContainer}>
        <CartoonButton
          title={isLoading ? 'SCANNING...' : 'SCAN FOR MUSIC'}
          onPress={loadSongs}
          variant="primary"
          size="medium"
          loading={isLoading}
          disabled={isLoading}
        />
        {scanProgress ? (
          <Text style={styles.scanProgress}>{scanProgress}</Text>
        ) : null}
      </View>

      {/* Songs List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Scanning music folders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          renderItem={renderSong}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}

      {/* Permission Dialog */}
      <PermissionAlert
        visible={showPermissionDialog}
        onAllow={handlePermissionAllow}
        onDeny={handlePermissionDeny}
      />
      
      {/* Song Options Modal */}
      <SongOptionsModal
        visible={showOptionsModal}
        songTitle={selectedSong?.title || ''}
        onClose={() => setShowOptionsModal(false)}
        onDelete={handleDeletePress}
        onPlay={handlePlayFromOptions}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModalFast
        visible={showDeleteModal}
        songTitle={selectedSong?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
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
  scanProgress: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
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
  songPath: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songPathText: {
    fontSize: 10,
    color: '#999999',
    marginLeft: 4,
    flex: 1,
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