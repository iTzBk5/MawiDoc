import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Colors, ThemeColors } from '../../../shared/theme/colors';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius } from '../../../shared/theme/spacing';
import { useAuthStore } from '../../../store/auth.store';
import { useThemeStore, ThemeMode } from '../../../store/theme.store';
import { useStyles } from '../../../shared/theme/useStyles';
import { useAppTheme } from '../../../shared/theme/useAppTheme';

const LANGUAGES = [
  { code: 'en', label: 'English', iconName: 'globe-outline' },
  { code: 'fr', label: 'Français', iconName: 'globe-outline' },
  { code: 'ar', label: 'العربية', iconName: 'globe-outline' },
];

const THEMES: { code: ThemeMode; label: string; iconName: string }[] = [
  { code: 'light', label: 'Light', iconName: 'sunny-outline' },
  { code: 'dark', label: 'Dark', iconName: 'moon-outline' },
  { code: 'system', label: 'System Default', iconName: 'phone-portrait-outline' },
];

type Props = { navigation: NativeStackNavigationProp<any> };

export function SettingsScreen({ navigation }: Props) {
  const { i18n } = useTranslation();
  const { logout } = useAuthStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const styles = useStyles(createStyles);
  const { colors } = useAppTheme();
  
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  const changeLanguage = async (langCode: string) => {
    if (langCode === currentLang) return;

    await AsyncStorage.setItem('@app_language', langCode);
    setCurrentLang(langCode);

    i18n.changeLanguage(langCode);

    const isRTL = langCode === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout(), style: 'destructive' },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.card}>
          {THEMES.map((theme, index) => {
            const isSelected = themeMode === theme.code;
            return (
              <View key={theme.code}>
                <TouchableOpacity
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => setThemeMode(theme.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={theme.iconName} size={20} color={isSelected ? colors.accentDark : colors.textSecondary} />
                  </View>
                  <Text style={[styles.label, isSelected && styles.labelSelected]}>
                    {theme.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                </TouchableOpacity>
                {index < THEMES.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </Card>

        <View style={styles.spacerSmall} />

        <Text style={styles.sectionTitle}>Language</Text>
        <Card style={styles.card}>
          {LANGUAGES.map((lang, index) => {
            const isSelected = currentLang === lang.code;
            return (
              <View key={lang.code}>
                <TouchableOpacity
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => changeLanguage(lang.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={lang.iconName} size={20} color={isSelected ? colors.accentDark : colors.textSecondary} />
                  </View>
                  <Text style={[styles.label, isSelected && styles.labelSelected]}>
                    {lang.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                </TouchableOpacity>
                {index < LANGUAGES.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </Card>

        <View style={styles.spacer} />

        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={20} color={colors.white} />}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  sectionTitle: {
    ...Typography.overline,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  rowSelected: {
    backgroundColor: colors.tintAccent,
  },
  iconWrap: {
    marginRight: Spacing.md,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...Typography.bodyBold, color: colors.textPrimary, flex: 1 },
  labelSelected: { color: colors.accentDark },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
  spacerSmall: { height: Spacing.lg },
  spacer: { height: Spacing.xxxl * 2 },
  logoutBtn: { marginBottom: Spacing.xxxl },
});
