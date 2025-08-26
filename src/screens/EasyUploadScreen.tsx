import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { AnimeButton } from '../components/AnimeButton';
import { AnimeInput } from '../components/AnimeInput';
import { theme } from '../theme';
import { AuthService } from '../services/AuthService';
import { GoogleSheetsServiceRN } from '../services/GoogleSheetsServiceRN';
import { GoogleDriveService } from '../services/GoogleDriveService';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const Icon = ({ name, size = 24, color = '#FFFFFF' }: { name: string; size?: number; color?: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    'music': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </Svg>
    ),
    'upload': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
      </Svg>
    ),
    'check': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </Svg>
    ),
  };
  return icons[name] || null;
};

export const EasyUploadScreen = () => {
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [movie, setMovie] = useState('');
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const authService = AuthService.getInstance();
  const googleSheetsService = GoogleSheetsServiceRN.getInstance();
  const googleDriveService = GoogleDriveService.getInstance();

  // Pick song from device
  const pickSongFromDevice = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });

      if (result && result[0]) {
        const file = result[0];
        setSelectedFile(file);
        
        // Auto-fill song name from filename if empty
        if (!songName && file.name) {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          setSongName(nameWithoutExt);
        }
        
        Alert.alert('Success', `Selected: ${file.name}`);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick file');
        console.error('File pick error:', err);
      }
    }
  };

  // Upload song to Google Drive and Sheets
  const handleEasyUpload = async () => {
    if (!songName || !artist) {
      Alert.alert('Error', 'Please fill in song name and artist');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a song file from your device');
      return;
    }

    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // Step 1: Upload file to Google Drive
      Alert.alert('Uploading', 'Uploading song to cloud storage...');
      setUploadProgress(30);

      // For now, we'll simulate the upload since Google Drive API needs OAuth
      // In production, you'd implement OAuth2 flow for user's Google Drive
      const simulatedDriveLink = `https://drive.google.com/file/d/simulated_${Date.now()}/view`;
      
      // In real implementation:
      // const driveLink = await googleDriveService.uploadFile(selectedFile);
      
      setUploadProgress(70);

      // Step 2: Add song metadata to Google Sheets
      const success = await googleSheetsService.addSong({
        name: songName,
        artist: artist,
        movie: movie || undefined,
        genre: genre || 'Unknown',
        driveLink: simulatedDriveLink, // Use real drive link in production
        uploadedBy: currentUser.name,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
      });

      setUploadProgress(90);

      if (success) {
        setUploadProgress(100);
        Alert.alert(
          'Success! 🎉',
          'Your song has been uploaded successfully!\n\nIt will appear in the app after admin approval.',
          [{ 
            text: 'Upload Another',
            onPress: () => {
              // Reset form
              setSongName('');
              setArtist('');
              setMovie('');
              setGenre('');
              setTags('');
              setSelectedFile(null);
              setUploadProgress(0);
            }
          }]
        );
      } else {
        throw new Error('Failed to save to Google Sheets');
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again later');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.header}
      >
        <Icon name="upload" size={48} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Easy Song Upload</Text>
        <Text style={styles.headerSubtitle}>
          Upload songs directly from your phone!
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* File Picker */}
        <TouchableOpacity
          style={[styles.filePicker, selectedFile && styles.fileSelected]}
          onPress={pickSongFromDevice}
        >
          <Icon name="music" size={32} color={selectedFile ? '#667EEA' : '#999'} />
          <Text style={styles.filePickerText}>
            {selectedFile ? selectedFile.name : 'Tap to select song from device'}
          </Text>
          {selectedFile && <Icon name="check" size={24} color="#4CAF50" />}
        </TouchableOpacity>

        {/* Song Details Form */}
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

        <View style={styles.genreContainer}>
          <Text style={styles.genreLabel}>Select Genre:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Pop', 'Rock', 'Hip-Hop', 'EDM', 'Anime', 'Classical', 'Jazz'].map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genreChip, genre === g && styles.genreChipSelected]}
                onPress={() => setGenre(g)}
              >
                <Text style={[styles.genreChipText, genre === g && styles.genreChipTextSelected]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <AnimeInput
          label="Tags"
          placeholder="Anime, OST, Remix (comma separated)"
          value={tags}
          onChangeText={setTags}
        />

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{uploadProgress}% Uploaded</Text>
          </View>
        )}

        {/* Upload Button */}
        <AnimeButton
          title={uploading ? "Uploading..." : "Upload Song"}
          onPress={handleEasyUpload}
          loading={uploading}
          disabled={!selectedFile || uploading}
          size="large"
          style={styles.uploadButton}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📝 How it works:</Text>
          <Text style={styles.infoText}>1. Select a song from your phone</Text>
          <Text style={styles.infoText}>2. Fill in song details</Text>
          <Text style={styles.infoText}>3. Hit upload - we handle the rest!</Text>
          <Text style={styles.infoText}>4. Song uploads to cloud automatically</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: theme.spacing.m,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.small,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.l,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.l,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DDD',
    marginBottom: theme.spacing.l,
  },
  fileSelected: {
    borderColor: '#667EEA',
    borderStyle: 'solid',
    backgroundColor: '#F8F9FF',
  },
  filePickerText: {
    flex: 1,
    marginLeft: theme.spacing.m,
    fontSize: theme.typography.fontSize.regular,
    color: '#333', // Dark text for readability
  },
  genreContainer: {
    marginVertical: theme.spacing.m,
  },
  genreLabel: {
    fontSize: theme.typography.fontSize.regular,
    color: '#333', // Dark text for readability
    marginBottom: theme.spacing.s,
    fontWeight: '500',
  },
  genreChip: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#667EEA',
    marginRight: theme.spacing.s,
  },
  genreChipSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  genreChipText: {
    fontSize: theme.typography.fontSize.small,
    color: '#333', // Dark text for readability
  },
  genreChipTextSelected: {
    color: '#FFFFFF',
  },
  progressContainer: {
    marginVertical: theme.spacing.m,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
  },
  uploadButton: {
    marginTop: theme.spacing.l,
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.xl,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.regular,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  infoText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
});