import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { GoogleSheetsServiceRN } from '../services/GoogleSheetsServiceRN';
import SimpleCentralUpload from '../services/SimpleCentralUpload';
import { AnimeInput } from '../components/AnimeInput';
import { CartoonButton } from '../components/CartoonButton';
import Svg, { Path } from 'react-native-svg';

const Icon = ({ name, size = 24, color = '#000000' }: { name: string; size?: number; color?: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    'back': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </Svg>
    ),
    'upload': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
      </Svg>
    ),
    'music': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const RealUploadScreen = ({ navigation }: any) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [movie, setMovie] = useState('');
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const googleSheetsService = GoogleSheetsServiceRN.getInstance();
  const centralUpload = SimpleCentralUpload.getInstance();

  const pickMP3File = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
        copyTo: 'cachesDirectory',
      });

      if (result && result[0]) {
        const file = result[0];
        console.log('Selected file:', file);
        
        // Check if it's an MP3
        if (!file.name?.toLowerCase().endsWith('.mp3')) {
          Alert.alert('Invalid File', 'Please select an MP3 file');
          return;
        }

        setSelectedFile(file);
        
        // Try to extract song name from filename
        const nameWithoutExt = file.name.replace(/\.mp3$/i, '');
        const parts = nameWithoutExt.split('-');
        
        if (parts.length >= 2) {
          setArtist(parts[0].trim());
          setSongName(parts[1].trim());
        } else {
          setSongName(nameWithoutExt);
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.error('Error picking file:', err);
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };

  const uploadToGoogleDrive = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select an MP3 file first');
      return;
    }

    if (!songName || !artist) {
      Alert.alert('Missing Info', 'Please enter song name and artist');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Central Google Drive (no sign-in required!)
      console.log('Starting upload to Central Drive...');
      setUploadProgress(20);
      
      const uploadResult = await centralUpload.uploadFile(
        selectedFile.fileCopyUri || selectedFile.uri,
        `${songName} - ${artist}.mp3`,
        (progress) => {
          setUploadProgress(20 + (progress * 60)); // 20-80%
        }
      );

      if (!uploadResult.success) {
        Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload to Google Drive');
        return;
      }

      setUploadProgress(80);
      console.log('File uploaded to Drive:', uploadResult.webViewLink);

      // Step 3: Add song to Google Sheet
      const songData = {
        name: songName,
        artist: artist,
        movie: movie || '',
        genre: genre || 'Unknown',
        driveLink: uploadResult.webViewLink || '',
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
        uploadedBy: 'AniMusic User',
      };

      const sheetResult = await googleSheetsService.addSong(songData);
      setUploadProgress(100);

      if (sheetResult) {
        Alert.alert(
          '✅ Success!',
          'Your song has been uploaded to the central music library!',
          [
            {
              text: 'Upload Another',
              onPress: () => {
                // Reset form
                setSelectedFile(null);
                setSongName('');
                setArtist('');
                setMovie('');
                setGenre('');
                setTags('');
                setUploadProgress(0);
              }
            },
            {
              text: 'View Songs',
              onPress: () => navigation.navigate('GoogleMusic')
            }
          ]
        );
      } else {
        Alert.alert('Partial Success', 'File uploaded to Drive but failed to add to sheet');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const showManualGuide = () => {
    Alert.alert(
      '📱 Manual Upload Guide',
      '1. Open Google Drive app\n' +
      '2. Tap + button\n' +
      '3. Select "Upload"\n' +
      '4. Choose your MP3 file\n' +
      '5. After upload, tap the file\n' +
      '6. Tap share icon\n' +
      '7. Change to "Anyone with link"\n' +
      '8. Copy link\n' +
      '9. Come back here and use "Paste Link" option',
      [{ text: 'Got it!' }]
    );
  };

  const handleManualLinkUpload = () => {
    navigation.navigate('EasyUpload');
  };

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
        <Text style={styles.headerTitle}>REAL UPLOAD</Text>
        <View style={styles.headerRight}>
          <Icon name="upload" size={24} color="#000000" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* File Picker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT MP3 FILE</Text>
          
          <TouchableOpacity
            style={styles.filePickerButton}
            onPress={pickMP3File}
          >
            <Icon name="music" size={32} color="#000000" />
            <Text style={styles.filePickerText}>
              {selectedFile ? selectedFile.name : 'TAP TO SELECT MP3'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <View style={styles.fileInfo}>
              <Text style={styles.fileInfoText}>
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          )}
        </View>

        {/* Song Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SONG DETAILS</Text>
          
          <AnimeInput
            label="Song Name"
            value={songName}
            onChangeText={setSongName}
            placeholder="Enter song name"
          />

          <AnimeInput
            label="Artist"
            value={artist}
            onChangeText={setArtist}
            placeholder="Enter artist name"
          />

          <AnimeInput
            label="Movie/Album"
            value={movie}
            onChangeText={setMovie}
            placeholder="Enter movie or album (optional)"
          />

          <AnimeInput
            label="Genre"
            value={genre}
            onChangeText={setGenre}
            placeholder="e.g., Pop, Rock, Classical"
          />

          <AnimeInput
            label="Tags"
            value={tags}
            onChangeText={setTags}
            placeholder="e.g., romantic, party, sad (comma separated)"
          />
        </View>

        {/* Upload Options */}
        <View style={styles.buttonSection}>
          <CartoonButton
            title={isUploading ? `UPLOADING... ${uploadProgress}%` : 'UPLOAD TO DRIVE'}
            onPress={uploadToGoogleDrive}
            variant="primary"
            size="large"
            loading={isUploading}
            disabled={isUploading || !selectedFile}
          />

          {isUploading && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <CartoonButton
            title="USE MANUAL LINK"
            onPress={handleManualLinkUpload}
            variant="secondary"
            size="large"
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ How it works:</Text>
          <Text style={styles.infoText}>
            • Select MP3 from your phone{'\n'}
            • Fill in song details{'\n'}
            • Upload directly to Google Drive{'\n'}
            • Automatically adds to your music library
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
    marginBottom: 15,
  },
  filePickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePickerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginTop: 10,
    textAlign: 'center',
  },
  fileInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  fileInfoText: {
    fontSize: 12,
    color: '#666666',
  },
  buttonSection: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#000000',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000000',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
});