import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';

const {width} = Dimensions.get('window');

interface QuickOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onTimerPress: () => void;
  onDeletePress: () => void;
  hasActiveTimer: boolean;
  timerMinutes?: number;
}

const Icon = ({name, size = 20, color = '#000000'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'timer': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M12 6v6l4 2" />
      </Svg>
    ),
    'delete': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const QuickOptionsMenu: React.FC<QuickOptionsMenuProps> = ({
  visible,
  onClose,
  onTimerPress,
  onDeletePress,
  hasActiveTimer,
  timerMinutes,
}) => {
  if (!visible) return null;

  return (
    <>
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            onTimerPress();
            onClose();
          }}>
          <Icon name="timer" size={22} color={hasActiveTimer ? "#00C853" : "#000000"} />
          <Text style={[styles.menuText, hasActiveTimer && styles.activeText]}>
            Sleep Timer
          </Text>
          {hasActiveTimer && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{timerMinutes}m</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            onDeletePress();
            onClose();
          }}>
          <Icon name="delete" size={22} color="#FF4444" />
          <Text style={[styles.menuText, {color: '#FF4444'}]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  menu: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  activeText: {
    color: '#00C853',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  badge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#00C853',
    fontSize: 11,
    fontWeight: '700',
  },
});