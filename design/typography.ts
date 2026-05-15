import { Platform } from 'react-native';

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';
const sansSerif = Platform.OS === 'ios' ? 'System' : 'sans-serif';

export const typography = {
  display: {
    fontFamily: serif,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    fontWeight: '400' as const,
  },
  headline: {
    fontFamily: serif,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
    fontWeight: '400' as const,
  },
  bodyLarge: {
    fontFamily: sansSerif,
    fontSize: 19,
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  body: {
    fontFamily: sansSerif,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: sansSerif,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '400' as const,
  },
} as const;
