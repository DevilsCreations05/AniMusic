import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {AnimeButton} from '../components/AnimeButton';
import {AnimeInput} from '../components/AnimeInput';
import {theme} from '../theme';
import {AuthService} from '../services/AuthService';
import {SongModel} from '../database/models/Song';
import {GoogleSheetsServiceRN} from '../services/GoogleSheetsServiceRN';

export const UploadScreen = () => {
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [movie, setMovie] = useState('');
  const [genre, setGenre] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const authService = AuthService.getInstance();
  const songModel = new SongModel();
  const googleSheetsService = GoogleSheetsServiceRN.getInstance();

  const handleUpload = async () => {
    if (!songName || !artist || !driveLink) {
      Alert.alert('Error', 'Please fill in all required fields including Google Drive link');
      return;
    }

    // Validate Google Drive link
    if (!driveLink.includes('drive.google.com')) {
      Alert.alert('Error', 'Please provide a valid Google Drive link');
      return;
    }

    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      setLoading(true);
      
      // Upload to Google Sheets
      const success = await googleSheetsService.addSong({
        name: songName,
        artist: artist,
        movie: movie || undefined,
        genre: genre || 'Unknown',
        driveLink: driveLink,
        uploadedBy: currentUser.name,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
      });

      if (success) {
        // Also save to local database for offline access
        await songModel.create({
          name: songName,
          artist: artist,
          movie: movie || undefined,
          drive_link: driveLink,
          uploaded_by: currentUser.id!,
          uploader_name: currentUser.name,
          status: 'pending',
        });

        Alert.alert(
          'Success', 
          'Song uploaded to Google Sheets successfully! It will be visible after admin approval.',
          [{ text: 'OK', onPress: () => {
            // Clear form
            setSongName('');
            setArtist('');
            setMovie('');
            setGenre('');
            setDriveLink('');
            setTags('');
          }}]
        );
      } else {
        throw new Error('Failed to upload to Google Sheets');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload song. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Upload New Song</Text>
      
      <AnimeInput
        label="Song Name *"
        placeholder="Enter song name"
        value={songName}
        onChangeText={setSongName}
      />

      <AnimeInput
        label="Artist *"
        placeholder="Enter artist name"
        value={artist}
        onChangeText={setArtist}
      />

      <AnimeInput
        label="Movie/Album"
        placeholder="Enter movie or album name"
        value={movie}
        onChangeText={setMovie}
      />

      <AnimeInput
        label="Genre"
        placeholder="Pop, Rock, Hip-Hop, EDM, etc."
        value={genre}
        onChangeText={setGenre}
      />

      <AnimeInput
        label="Google Drive Link *"
        placeholder="https://drive.google.com/file/d/..."
        value={driveLink}
        onChangeText={setDriveLink}
      />

      <AnimeInput
        label="Tags"
        placeholder="Anime, OST, Remix (comma separated)"
        value={tags}
        onChangeText={setTags}
      />

      <AnimeButton
        title="Upload to Google Sheets"
        onPress={handleUpload}
        loading={loading}
        size="large"
        style={styles.uploadButton}
      />

      <Text style={styles.note}>
        Note: Only registered users can upload songs. Songs will be visible after admin approval.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  content: {
    padding: theme.spacing.l,
  },
  title: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.l,
  },
  uploadButton: {
    marginTop: theme.spacing.xl,
  },
  note: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.l,
    fontStyle: 'italic',
  },
});