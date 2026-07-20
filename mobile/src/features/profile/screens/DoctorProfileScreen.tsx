import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Loading } from '../../../shared/components/Loading';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';
import { useTranslation } from 'react-i18next';

type Props = { navigation: NativeStackNavigationProp<any> };

export function DoctorProfileScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try { setProfile(await doctorService.getProfile()); }
    catch {} finally { setLoading(false); }
  };

  if (loading || !profile) return <><Header title={t('profile.title', 'Profile')} /><Loading /></>;

  const menuItems = [
    { title: t('profile.editPersonalInfo', 'Edit Personal Info'), icon: 'create-outline' as const, color: colors.primary, bg: colors.tintPrimary, onPress: () => navigation.navigate('EditProfile', { profile }) },
    { title: t('profile.clinicInfoLocation', 'Clinic Info & Location'), icon: 'business-outline' as const, color: colors.accent, bg: colors.tintAccent, onPress: () => navigation.navigate('ClinicInfo') },
    { title: t('doctor.manageWorkingDays', 'Manage Working Days'), icon: 'calendar-outline' as const, color: colors.warning, bg: colors.warningLight, onPress: () => navigation.navigate('WorkingDays') },
    { title: t('profile.settings', 'Settings'), icon: 'settings-outline' as const, color: colors.textSecondary, bg: colors.tintPrimary, onPress: () => navigation.navigate('SettingsTab') },
  ];

  return (
    <View style={styles.container}>
      <Header title={t('profile.doctorProfile', 'Doctor Profile')} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <LinearGradient colors={colors.gradientHero} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>
                {(profile.fullName || '?').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.fullName}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="at" size={14} color={colors.textSecondary} />
                <Text style={styles.detail}>{profile.username}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.detail}>{profile.user?.email}</Text>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Menu Items */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={item.title}>
              <Card onPress={item.onPress} style={styles.menuItem}>
                <View style={styles.menuRow}>
                  <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                </View>
              </Card>
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  profileCard: {
    padding: Spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    ...Typography.h1,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  name: { ...Typography.h2, color: colors.primary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  detail: { ...Typography.caption, color: colors.textSecondary },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    marginBottom: 0,
    borderWidth: 0,
    borderRadius: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuTitle: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
});
