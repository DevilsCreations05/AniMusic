import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';

const {width} = Dimensions.get('window');

interface DeleteConfirmModalProps {
  visible: boolean;
  songTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  songTitle,
  onConfirm,
  onCancel,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {transform: [{scale: scaleAnim}]}
          ]}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <Svg width={80} height={80} viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="10" fill="#FF4444" />
              <Path 
                d="M9 9L15 15M15 9L9 15" 
                stroke="#FFFFFF" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </Svg>
          </View>

          {/* Title */}
          <Text style={styles.title}>Delete Song</Text>
          
          {/* Message */}
          <Text style={styles.message}>
            Are you sure you want to permanently delete
          </Text>
          <Text style={styles.songName}>"{songTitle}"?</Text>
          
          {/* Warning */}
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ This action cannot be undone</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}>
              <Text style={styles.deleteText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 15,
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 5,
  },
  songName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    borderColor: '#CCCCCC',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    borderColor: '#CC0000',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});