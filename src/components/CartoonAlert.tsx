import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';

const {width} = Dimensions.get('window');

interface CartoonAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onClose?: () => void;
}

const Icon = ({name, size = 48, color = '#000000'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'info': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </Svg>
    ),
    'warning': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </Svg>
    ),
    'error': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </Svg>
    ),
    'success': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </Svg>
    ),
    'storage': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
      </Svg>
    ),
  };
  
  return icons[name] || icons['info'];
};

export const CartoonAlert: React.FC<CartoonAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{text: 'OK', onPress: () => {}}],
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [visible]);

  const getIconName = () => {
    switch (type) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning': return '#FFA500';
      case 'error': return '#FF0000';
      case 'success': return '#00FF00';
      default: return '#000000';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Header with Icon */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{translateY: bounceAnim}],
                },
              ]}>
              <Icon name={getIconName()} size={48} color={getIconColor()} />
            </Animated.View>
            <View style={styles.bubbleDecor1} />
            <View style={styles.bubbleDecor2} />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title.toUpperCase()}</Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  buttons.length > 1 && index === 0 && styles.firstButton,
                ]}
                onPress={() => {
                  button.onPress();
                  onClose?.();
                }}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                  ]}>
                  {button.text.toUpperCase()}
                </Text>
                {button.style === 'default' && <View style={styles.buttonAccent} />}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Permission specific alert
export const PermissionAlert = ({
  visible,
  onAllow,
  onDeny,
}: {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
}) => {
  return (
    <CartoonAlert
      visible={visible}
      title="Storage Permission"
      message="AniMusic needs access to your device storage to play local music files. This allows you to enjoy your downloaded songs offline!"
      type="info"
      buttons={[
        {
          text: 'Allow',
          onPress: onAllow,
          style: 'default',
        },
        {
          text: 'Deny',
          onPress: onDeny,
          style: 'cancel',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
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
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  bubbleDecor1: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bubbleDecor2: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#000000',
    marginTop: 8,
  },
  messageContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  message: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 3,
    borderTopColor: '#000000',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  firstButton: {
    borderRightWidth: 3,
    borderRightColor: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
  },
  destructiveButton: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cancelButtonText: {
    color: '#000000',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
  buttonAccent: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});