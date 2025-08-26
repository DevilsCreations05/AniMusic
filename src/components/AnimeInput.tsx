import React, {useRef, useState} from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Animated,
  TextInputProps,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {theme} from '../theme';

interface AnimeInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

const Icon = ({name, size = 20, color}: {name: string; size?: number; color: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'email': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </Svg>
    ),
    'lock': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </Svg>
    ),
    'alert-circle': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <Path d="M12 8v4m0 4h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const AnimeInput: React.FC<AnimeInputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: error
      ? ['#FF0000', '#FF0000']
      : ['#DDD', '#667EEA'],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#666', '#667EEA'],
  });

  return (
    <View style={styles.container}>
      {label && (
        <Animated.Text style={[styles.label, {color: labelColor}]}>
          {label}
        </Animated.Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          {borderColor},
          isFocused && styles.focusedContainer,
          error && styles.errorContainer,
        ]}>
        {icon && (
          <View style={styles.leftIcon}>
            <Icon
              name={icon}
              color={
                isFocused
                  ? '#667EEA'
                  : '#999'
              }
            />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
          ]}
          placeholderTextColor="#999"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <View style={styles.rightIcon}>
            <Icon
              name={rightIcon}
              color="#C0C0C0"
            />
          </View>
        )}
      </Animated.View>
      {error && (
        <View style={styles.errorMessageContainer}>
          <Icon
            name="alert-circle"
            size={14}
            color="#FF0000"
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.s,
  },
  label: {
    fontSize: theme.typography.fontSize.small,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.m,
    minHeight: 48,
  },
  focusedContainer: {
    ...theme.shadows.small,
    backgroundColor: '#F8F9FF',
    borderColor: '#667EEA',
  },
  errorContainer: {
    borderColor: theme.colors.status.error,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.regular,
    color: '#000000', // Always use black text for readability
    paddingVertical: theme.spacing.s,
  },
  inputWithLeftIcon: {
    marginLeft: theme.spacing.s,
  },
  inputWithRightIcon: {
    marginRight: theme.spacing.s,
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    padding: theme.spacing.xs,
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.status.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
});