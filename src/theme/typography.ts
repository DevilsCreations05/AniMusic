import {Platform} from 'react-native';

export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
    }),
    anime: 'AnimeAce',
  },
  fontSize: {
    tiny: 10,
    small: 12,
    medium: 14,
    regular: 16,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
    huge: 48,
  },
  lineHeight: {
    tiny: 12,
    small: 16,
    medium: 20,
    regular: 24,
    large: 28,
    xlarge: 32,
    xxlarge: 40,
    huge: 56,
  },
};