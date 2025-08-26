import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';

const {width} = Dimensions.get('window');

interface SongOptionsModalProps {
  visible: boolean;
  songTitle: string;
  onClose: () => void;
  onDelete: () => void;
  onPlay?: () => void;
  showPlayOption?: boolean;
}

const Icon = ({name, size = 24, color = '#000000'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'play': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M8 5v14l11-7z" />
      </Svg>
    ),
    'delete': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
      </Svg>
    ),
    'close': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const SongOptionsModal: React.FC<SongOptionsModalProps> = ({
  visible,
  songTitle,
  onClose,
  onDelete,
  onPlay,
  showPlayOption = true,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity 
          activeOpacity={1}
          style={styles.container}
          onPress={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{songTitle}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.options}>
            {showPlayOption && onPlay && (
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => {
                  onPlay();
                  onClose();
                }}>
                <View style={styles.iconContainer}>
                  <Icon name="play" size={20} color="#000000" />
                </View>
                <Text style={styles.optionText}>Play Song</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.optionItem, styles.deleteOption]}
              onPress={() => {
                onClose();
                setTimeout(onDelete, 100); // Small delay to close modal first
              }}>
              <View style={[styles.iconContainer, styles.deleteIconContainer]}>
                <Icon name="delete" size={20} color="#FF4444" />
              </View>
              <Text style={[styles.optionText, styles.deleteText]}>Delete Song</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  options: {
    padding: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  deleteOption: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFCCCC',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#000000',
  },
  deleteIconContainer: {
    borderColor: '#FF4444',
    backgroundColor: '#FFEEEE',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  deleteText: {
    color: '#FF4444',
  },
});