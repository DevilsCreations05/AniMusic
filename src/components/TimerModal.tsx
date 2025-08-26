import React, {useState, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';

const {height} = Dimensions.get('window');

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTimer: (minutes: number, fadeOut: boolean) => void;
  onCancelTimer: () => void;
  currentTimer: number | null;
}

export const TimerModal = memo<TimerModalProps>(({
  visible,
  onClose,
  onSelectTimer,
  onCancelTimer,
  currentTimer,
}) => {
  const [timerMode, setTimerMode] = useState<'preset' | 'custom'>('preset');
  const [fadeOut, setFadeOut] = useState(false);
  const [customTimerValue, setCustomTimerValue] = useState('');
  
  const timerPresets = [5, 10, 15, 20, 30, 45, 60, 90, 120];

  const handleTimerSelect = (minutes: number) => {
    onSelectTimer(minutes, fadeOut);
    onClose();
  };

  const handleCustomTimer = () => {
    const minutes = parseInt(customTimerValue);
    if (minutes > 0 && minutes <= 999) {
      handleTimerSelect(minutes);
      setCustomTimerValue('');
    }
  };

  const handleCancelTimer = () => {
    onCancelTimer();
    onClose();
  };

  // Don't re-render modal content when it's not visible
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity 
          activeOpacity={1}
          style={styles.timerModalContent}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.timerModalHeader}>
            <Text style={styles.timerModalTitle}>SLEEP TIMER</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.timerModalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Timer Mode Toggle */}
          <View style={styles.timerModeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, timerMode === 'preset' && styles.modeButtonActive]}
              onPress={() => setTimerMode('preset')}>
              <Text style={[styles.modeButtonText, timerMode === 'preset' && styles.modeButtonTextActive]}>
                PRESET
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, timerMode === 'custom' && styles.modeButtonActive]}
              onPress={() => setTimerMode('custom')}>
              <Text style={[styles.modeButtonText, timerMode === 'custom' && styles.modeButtonTextActive]}>
                CUSTOM
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fade Out Option */}
          <View style={styles.fadeOutOption}>
            <Text style={styles.fadeOutLabel}>Fade out when timer ends</Text>
            <Switch
              value={fadeOut}
              onValueChange={setFadeOut}
              trackColor={{false: '#E0E0E0', true: '#000000'}}
              thumbColor={fadeOut ? '#FFFFFF' : '#666666'}
            />
          </View>
          
          {timerMode === 'preset' ? (
            <ScrollView style={styles.timerGrid} showsVerticalScrollIndicator={false}>
              {timerPresets.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.timerOption,
                    currentTimer === minutes && styles.timerOptionActive,
                  ]}
                  onPress={() => handleTimerSelect(minutes)}>
                  <Text style={[
                    styles.timerOptionText,
                    currentTimer === minutes && styles.timerOptionTextActive,
                  ]}>
                    {minutes}
                  </Text>
                  <Text style={[
                    styles.timerOptionLabel,
                    currentTimer === minutes && styles.timerOptionLabelActive,
                  ]}>
                    MIN
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.customTimerContainer}>
              <TextInput
                style={styles.customTimerInput}
                placeholder="Enter minutes (1-999)"
                placeholderTextColor="#999999"
                keyboardType="numeric"
                maxLength={3}
                value={customTimerValue}
                onChangeText={setCustomTimerValue}
              />
              <TouchableOpacity
                style={styles.customTimerButton}
                onPress={handleCustomTimer}>
                <Text style={styles.customTimerButtonText}>SET TIMER</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {currentTimer && (
            <TouchableOpacity
              style={styles.timerCancelButton}
              onPress={handleCancelTimer}>
              <Text style={styles.timerCancelText}>CANCEL TIMER</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}, (prevProps, nextProps) => {
  // Only re-render if visible or currentTimer changes
  return prevProps.visible === nextProps.visible && 
         prevProps.currentTimer === nextProps.currentTimer;
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  timerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  timerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  timerModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  timerModalClose: {
    fontSize: 24,
    color: '#666666',
  },
  timerModeToggle: {
    flexDirection: 'row',
    marginHorizontal: 25,
    marginBottom: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#000000',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  fadeOutOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 15,
  },
  fadeOutLabel: {
    fontSize: 14,
    color: '#333333',
  },
  timerGrid: {
    paddingHorizontal: 20,
  },
  timerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingVertical: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timerOptionActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  timerOptionText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginRight: 8,
  },
  timerOptionTextActive: {
    color: '#FFFFFF',
  },
  timerOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  timerOptionLabelActive: {
    color: '#FFFFFF',
  },
  customTimerContainer: {
    paddingHorizontal: 25,
  },
  customTimerInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  customTimerButton: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  customTimerButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  timerCancelButton: {
    backgroundColor: '#FF0000',
    marginHorizontal: 25,
    marginTop: 15,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  timerCancelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});