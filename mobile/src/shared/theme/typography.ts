import { Platform, I18nManager } from 'react-native';

const isAr = I18nManager.isRTL;

const fontFamilyRegular = isAr ? 'IBMPlexSansArabic_400Regular' : 'IBMPlexSans_400Regular';
const fontFamilyMedium = isAr ? 'IBMPlexSansArabic_500Medium' : 'IBMPlexSans_500Medium';
const fontFamilySemiBold = isAr ? 'IBMPlexSansArabic_600SemiBold' : 'IBMPlexSans_600SemiBold';
const fontFamilyBold = isAr ? 'IBMPlexSansArabic_700Bold' : 'IBMPlexSans_700Bold';

export const Typography = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, fontFamily: fontFamilyBold, letterSpacing: -0.5 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const, fontFamily: fontFamilySemiBold, letterSpacing: -0.3 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const, fontFamily: fontFamilySemiBold, letterSpacing: -0.2 },
  titleLarge: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, fontFamily: fontFamilyBold, letterSpacing: -0.8 },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const, fontFamily: fontFamilyRegular },
  bodyBold: { fontSize: 16, lineHeight: 23, fontWeight: '600' as const, fontFamily: fontFamilySemiBold },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, fontFamily: fontFamilyRegular },
  captionBold: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, fontFamily: fontFamilySemiBold },
  small: { fontSize: 11, lineHeight: 15, fontWeight: '400' as const, fontFamily: fontFamilyRegular },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '500' as const, fontFamily: fontFamilyMedium, letterSpacing: 0.1 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, fontFamily: fontFamilySemiBold, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' as const, fontFamily: fontFamilySemiBold, letterSpacing: 0.3 },
  header: { fontSize: 20, lineHeight: 25, fontWeight: '600' as const, fontFamily: fontFamilySemiBold },
} as const;