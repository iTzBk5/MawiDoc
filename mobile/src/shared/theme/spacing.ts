import { Platform } from 'react-native';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#07274D', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#07274D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 10 },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#07274D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.13, shadowRadius: 20 },
    android: { elevation: 8 },
    default: {},
  }),
  xl: Platform.select({
    ios: { shadowColor: '#07274D', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 28 },
    android: { elevation: 12 },
    default: {},
  }),
  // Colored "glow" shadow for accent CTAs (e.g. primary Book Appointment button)
  accentGlow: Platform.select({
    ios: { shadowColor: '#00A896', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14 },
    android: { elevation: 6 },
    default: {},
  }),
} as const;