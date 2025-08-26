import {colors} from './colors';
import {typography} from './typography';

export const theme = {
  colors,
  typography,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 8,
    medium: 16,
    large: 24,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: colors.shadow.light,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    medium: {
      shadowColor: colors.shadow.medium,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6.27,
      elevation: 10,
    },
    large: {
      shadowColor: colors.shadow.dark,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
      verySlow: 1000,
    },
    easing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};