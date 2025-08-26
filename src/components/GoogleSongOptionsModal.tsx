import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface GoogleSongOptionsModalProps {
  visible: boolean;
  songTitle: string;
  onClose: () => void;
  onPlay: () => void;
  onCopyLink: () => void;
  onStreamInfo: () => void;
}

export const GoogleSongOptionsModal: React.FC<GoogleSongOptionsModalProps> = ({
  visible,
  songTitle,
  onClose,
  onPlay,
  onCopyLink,
  onStreamInfo,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F5F5F5']}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {songTitle}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    onPlay();
                    onClose();
                  }}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionEmoji}>▶️</Text>
                  </View>
                  <Text style={styles.optionText}>PLAY SONG</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    onCopyLink();
                    onClose();
                  }}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionEmoji}>📋</Text>
                  </View>
                  <Text style={styles.optionText}>COPY DRIVE LINK</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    onStreamInfo();
                    onClose();
                  }}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionEmoji}>☁️</Text>
                  </View>
                  <Text style={styles.optionText}>STREAM INFO</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, styles.cancelButton]}
                  onPress={onClose}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionEmoji}>❌</Text>
                  </View>
                  <Text style={styles.optionText}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    borderWidth: 3,
    borderColor: '#000000',
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    flex: 1,
    letterSpacing: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 12,
    marginBottom: 10,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginTop: 5,
  },
});