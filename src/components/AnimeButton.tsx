import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../theme';

interface AnimeButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AnimeButton: React.FC<AnimeButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [theme.colors.primary.black, theme.colors.primary.darkGray];
      case 'secondary':
        return [theme.colors.secondary.charcoal, theme.colors.secondary.steel];
      case 'danger':
        return [theme.colors.status.error, theme.colors.accent.red];
      default:
        return [theme.colors.primary.black, theme.colors.primary.darkGray];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: theme.borderRadius.small,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: theme.borderRadius.large,
        };
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: theme.borderRadius.medium,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.fontSize.small;
      case 'large':
        return theme.typography.fontSize.large;
      default:
        return theme.typography.fontSize.medium;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {transform: [{scale: scaleAnim}]},
        style,
      ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}>
        <LinearGradient
          colors={disabled ? ['#cccccc', '#999999'] : getGradientColors()}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            styles.gradient,
            getSizeStyles(),
            disabled && styles.disabled,
          ]}>
          {loading ? (
            <ActivityIndicator
              color={theme.colors.text.light}
              size={size === 'small' ? 'small' : 'large'}
            />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text
                style={[
                  styles.text,
                  {fontSize: getTextSize()},
                  icon && styles.textWithIcon,
                  textStyle,
                ]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: theme.spacing.s,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  text: {
    color: theme.colors.text.light,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: theme.spacing.s,
  },
  disabled: {
    opacity: 0.6,
  },
});