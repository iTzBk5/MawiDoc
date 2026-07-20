import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ImageBackground, TouchableOpacity, I18nManager } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../../navigation/types';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, Shadows, BorderRadius } from '../../../shared/theme/spacing';

// @ts-ignore
import LogoImg from '../../../assets/logo-removebg-preview.png';
// @ts-ignore
import BgImg from '../../../assets/background.png';
// @ts-ignore
import DarkBgImg from '../../../assets/derkmodebg.png';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'RoleSelection'> };

const LANGUAGES = [
  { code: 'en', icon: '🇺🇸' },
  { code: 'fr', icon: '🇫🇷' },
  { code: 'ar', icon: '🇩🇿' },
];

export function RoleSelectionScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t, i18n } = useTranslation();

  const changeLanguage = async (langCode: string) => {
    if (langCode === i18n.language) return;
    
    await AsyncStorage.setItem('@app_language', langCode);
    i18n.changeLanguage(langCode);

    const isRTL = langCode === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  };

  const isDarkMode = colors.background === '#0F172A';

  return (
    <ImageBackground source={isDarkMode ? DarkBgImg : BgImg} style={styles.bgContainer}>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradientHero} style={styles.hero}>
          <View style={styles.langSelector}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity key={lang.code} onPress={() => changeLanguage(lang.code)} style={[styles.langBtn, i18n.language === lang.code && styles.langBtnActive]}>
                <Text style={styles.langIcon}>{lang.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.logoCard}>
            <Image source={LogoImg} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.prompt}>{t('auth.roleSelection')}</Text>
          <Text style={styles.subPrompt}>{t('auth.roleSelectionSubtitle')}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <Card style={styles.roleCard}>
            <View style={[styles.roleIconWrap, { backgroundColor: colors.tintAccent }]}>
              <Text style={styles.roleIcon}>{"\uD83D\uDC64"}</Text>
            </View>
            <Text style={styles.roleTitle}>{t('auth.patient')}</Text>
            <Text style={styles.roleDesc}>{t('patient.searchDoctors')}</Text>
            <Button
              title={t('auth.patient')}
              variant="secondary"
              onPress={() => navigation.navigate('Login', { role: 'PATIENT' })}
              style={styles.button}
            />
          </Card>

          <Card style={styles.roleCard}>
            <View style={[styles.roleIconWrap, { backgroundColor: colors.tintPrimary }]}>
              <Text style={styles.roleIcon}>{"\uD83E\uDE7A"}</Text>
            </View>
            <Text style={styles.roleTitle}>{t('auth.doctor')}</Text>
            <Text style={styles.roleDesc}>{t('doctor.dashboard')}</Text>
            <Button
              title={t('auth.doctor')}
              variant="secondary"
              onPress={() => navigation.navigate('Login', { role: 'DOCTOR' })}
              style={styles.button}
            />
          </Card>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  bgContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Shadows.xl,
  },
  logoCard: {
    width: 108,
    height: 108,
    borderRadius: BorderRadius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.xl,
  },
  logo: {
    width: 80,
    height: 80,
  },
  langSelector: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  langBtn: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  langBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  langIcon: {
    fontSize: 20,
  },
  prompt: { ...Typography.h2, color: colors.white, textAlign: 'center', marginBottom: Spacing.xs },
  subPrompt: { ...Typography.body, color: colors.accentLight, textAlign: 'center' },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  roleCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  roleIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  roleIcon: {
    fontSize: 40,
  },
  roleTitle: {
    ...Typography.h3,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  roleDesc: {
    ...Typography.body,
    color: colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});
