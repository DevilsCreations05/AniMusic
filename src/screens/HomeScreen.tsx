import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {theme} from '../theme';
import {SongModel, ISong} from '../database/models/Song';
import {useState, useEffect} from 'react';

export const HomeScreen = () => {
  const [songs, setSongs] = useState<ISong[]>([]);
  const [loading, setLoading] = useState(true);
  const songModel = new SongModel();

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const approvedSongs = await songModel.findApproved();
      setSongs(approvedSongs);
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSongItem = ({item}: {item: ISong}) => (
    <TouchableOpacity style={styles.songItem}>
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{item.name}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading songs...</Text>
      ) : songs.length === 0 ? (
        <Text style={styles.emptyText}>No songs available yet</Text>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id?.toString() || ''}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  listContent: {
    padding: theme.spacing.m,
  },
  songItem: {
    backgroundColor: 'white',
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: theme.typography.fontSize.regular,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  songArtist: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});