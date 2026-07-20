export const LightColors = {
  // Primary palette (from logo)
  primary: '#07274D',
  primaryLight: '#123B6B',
  primaryDark: '#041B36',
  accent: '#00A896',
  accentLight: '#1FCBB5',
  accentDark: '#017E70',

  // Surfaces
  white: '#FFFFFF',
  background: '#F5F8FB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F3F6FA',
  backdrop: 'rgba(4, 27, 54, 0.55)',

  // Borders
  border: '#E4EAF1',
  borderLight: '#EEF2F7',
  divider: '#EFF2F6',

  // Text
  textPrimary: '#131C2E',
  textSecondary: '#5B6B84',
  textLight: '#9AA8BC',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  // Status
  success: '#12B76A',
  successLight: '#DFF7EA',
  error: '#EF4444',
  errorLight: '#FDEAEA',
  warning: '#F5A524',
  warningLight: '#FDF2DB',
  info: '#3B82F6',
  infoLight: '#E4EDFD',

  // Appointment statuses
  pending: '#B45B00',
  pendingBg: '#FDF2DB',
  accepted: '#0E8F57',
  acceptedBg: '#DFF7EA',
  rejected: '#C13333',
  rejectedBg: '#FDEAEA',
  cancelled: '#5B6B84',
  cancelledBg: '#EEF1F5',
  completed: '#2563EB',
  completedBg: '#E4EDFD',

  // Slot colors
  slotAvailable: '#F3F6FA',
  slotBooked: '#FDEAEA',
  slotBookedBorder: '#EF4444',
  slotSelected: '#DFF7EA',
  slotSelectedBorder: '#12B76A',

  // Gradient (now actively used by Header/Button)
  gradientStart: '#07274D',
  gradientEnd: '#00A896',

  // Additional gradient sets for varied surfaces
  gradientPrimary: ['#0B3163', '#07274D'] as [string, string],
  gradientAccent: ['#1FCBB5', '#00A896'] as [string, string],
  gradientHero: ['#07274D', '#0E3A6E', '#00A896'] as [string, string, string],
  gradientDanger: ['#FF6B6B', '#EF4444'] as [string, string],

  // Soft tints used for icon chips, avatars, illustration backdrops
  tintPrimary: 'rgba(7, 39, 77, 0.08)',
  tintAccent: 'rgba(0, 168, 150, 0.10)',
  overlayWhite: 'rgba(255, 255, 255, 0.14)',
};

export type ThemeColors = typeof LightColors;

export const DarkColors: ThemeColors = {
  // Primary palette (from logo, lightened for Dark Mode visibility)
  primary: '#60A5FA', // Bright blue for icons/text
  primaryLight: '#93C5FD',
  primaryDark: '#2563EB',
  accent: '#00A896',
  accentLight: '#1FCBB5',
  accentDark: '#017E70',

  // Surfaces
  white: '#FFFFFF', // True white for icons and text overlays
  background: '#0F172A', // Very dark blue/slate
  surface: '#1E293B', // Slightly lighter slate
  surfaceElevated: '#334155',
  surfaceMuted: '#0F172A', // Darker to contrast against surface
  backdrop: 'rgba(0, 0, 0, 0.75)',

  // Borders
  border: '#475569', // More visible border
  borderLight: '#334155', // Visibly different from surface
  divider: '#334155',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textLight: '#64748B',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  // Status (slightly desaturated/adjusted for dark mode visibility)
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.15)',

  // Appointment statuses
  pending: '#F59E0B',
  pendingBg: 'rgba(245, 158, 11, 0.15)',
  accepted: '#10B981',
  acceptedBg: 'rgba(16, 185, 129, 0.15)',
  rejected: '#EF4444',
  rejectedBg: 'rgba(239, 68, 68, 0.15)',
  cancelled: '#94A3B8',
  cancelledBg: 'rgba(148, 163, 184, 0.15)',
  completed: '#3B82F6',
  completedBg: 'rgba(59, 130, 246, 0.15)',

  // Slot colors
  slotAvailable: '#1E293B',
  slotBooked: 'rgba(239, 68, 68, 0.15)',
  slotBookedBorder: '#EF4444',
  slotSelected: 'rgba(16, 185, 129, 0.15)',
  slotSelectedBorder: '#10B981',

  // Gradient (now actively used by Header/Button)
  gradientStart: '#0F172A',
  gradientEnd: '#00A896',

  // Additional gradient sets for varied surfaces
  gradientPrimary: ['#1E293B', '#0F172A'] as [string, string],
  gradientAccent: ['#1FCBB5', '#00A896'] as [string, string],
  gradientHero: ['#0F172A', '#1E293B', '#00A896'] as [string, string, string],
  gradientDanger: ['#FF6B6B', '#EF4444'] as [string, string],

  // Soft tints used for icon chips, avatars, illustration backdrops
  tintPrimary: 'rgba(255, 255, 255, 0.08)',
  tintAccent: 'rgba(0, 168, 150, 0.15)',
  overlayWhite: 'rgba(255, 255, 255, 0.08)',
};


// Keep `Colors` exported temporarily as alias to `LightColors` to avoid instantly breaking the app before refactor is complete
export const Colors = LightColors;
export type ColorKey = keyof ThemeColors;