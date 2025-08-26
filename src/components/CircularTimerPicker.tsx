import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';

const {width, height} = Dimensions.get('window');

interface CircularTimerPickerProps {
  onSelect: (minutes: number) => void;
  onCancel: () => void;
  visible: boolean;
}

export const CircularTimerPicker: React.FC<CircularTimerPickerProps> = ({
  onSelect,
  onCancel,
  visible,
}) => {
  const [selectedTime, setSelectedTime] = useState(15);
  const scrollRef = useRef<ScrollView>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const timeOptions = Array.from({length: 24}, (_, i) => (i + 1) * 5); // 5 to 120 minutes

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / 60);
    const minutes = timeOptions[index] || 5;
    setSelectedTime(minutes);
  };

  const handleSelect = () => {
    onSelect(selectedTime);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.title}>SLEEP TIMER</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.pickerContainer}>
          <View style={styles.selectionIndicator} />
          
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            snapToInterval={60}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}>
            
            {/* Empty space at top */}
            <View style={{height: 90}} />
            
            {timeOptions.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={styles.timeOption}
                onPress={() => {
                  setSelectedTime(minutes);
                  const index = timeOptions.indexOf(minutes);
                  scrollRef.current?.scrollTo({y: index * 60, animated: true});
                }}>
                <Text 
                  style={[
                    styles.timeText,
                    selectedTime === minutes && styles.selectedTimeText,
                  ]}>
                  {minutes}
                </Text>
                <Text 
                  style={[
                    styles.minText,
                    selectedTime === minutes && styles.selectedMinText,
                  ]}>
                  MIN
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Empty space at bottom */}
            <View style={{height: 90}} />
          </ScrollView>

          {/* Circular decorations */}
          <View style={styles.circleDecor1} />
          <View style={styles.circleDecor2} />
        </View>

        <View style={styles.displayContainer}>
          <Text style={styles.displayText}>{selectedTime}</Text>
          <Text style={styles.displayLabel}>MINUTES</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}>
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleSelect}>
            <Text style={styles.confirmButtonText}>SET TIMER</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: width * 0.9,
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 4,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  titleUnderline: {
    width: 80,
    height: 3,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  pickerContainer: {
    height: 240,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: '#000000',
    borderRadius: 30,
    zIndex: 1,
    opacity: 0.1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  timeOption: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#666666',
    marginRight: 10,
  },
  selectedTimeText: {
    color: '#000000',
    fontSize: 36,
  },
  minText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999999',
    letterSpacing: 1,
  },
  selectedMinText: {
    color: '#000000',
  },
  circleDecor1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    top: 70,
    left: -50,
  },
  circleDecor2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    bottom: 70,
    right: -40,
  },
  displayContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: '#000000',
  },
  displayText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000000',
  },
  displayLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 2,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 3,
    borderTopColor: '#000000',
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRightWidth: 2,
    borderRightColor: '#000000',
  },
  confirmButton: {
    backgroundColor: '#000000',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});