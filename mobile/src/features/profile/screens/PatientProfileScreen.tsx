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
import { patientService } from '../../../services/patient.service';
import { useTranslation } from 'react-i18next';

type Props = { navigation: NativeStackNavigationProp<any> };

export function PatientProfileScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try { setProfile(await patientService.getProfile()); }
    catch {} finally { setLoading(false); }
  };

  if (loading || !profile) return <><Header title={t('profile.title', 'Profile')} /><Loading /></>;

  const infoItems = [
    { label: t('common.gender', 'Gender'), value: t(`auth.${profile.gender?.toLowerCase()}`, profile.gender), icon: profile.gender === 'FEMALE' ? 'female' as const : 'male' as const, color: colors.primary, bg: colors.tintPrimary },
    { label: t('common.age', 'Age'), value: `${profile.age} ${t('common.years', 'years')}`, icon: 'calendar-outline' as const, color: colors.accent, bg: colors.tintAccent },
    { label: t('auth.city', 'City'), value: profile.city, icon: 'location-outline' as const, color: colors.info, bg: colors.infoLight },
  ];

  return (
    <View style={styles.container}>
      <Header title={t('profile.title', 'Profile')} />
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

        {/* Info Items */}
        <Card style={styles.infoCard}>
          {infoItems.map((item, index) => (
            <View key={item.label}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
              {index < infoItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <View style={styles.actionRow}>
          <Button
            title={t('profile.editProfile', 'Edit Profile')}
            variant="outline"
            onPress={() => navigation.navigate('EditProfile', { profile })}
            style={styles.actionBtn}
            icon={<Ionicons name="create-outline" size={18} color={colors.primary} />}
          />
          <Button
            title={t('profile.settings', 'Settings')}
            variant="secondary"
            onPress={() => navigation.navigate('SettingsTab')}
            style={styles.actionBtn}
            icon={<Ionicons name="settings-outline" size={18} color={colors.white} />}
          />
        </View>
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
  infoCard: {
    padding: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.overline,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.body,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  actionBtn: {
    flex: 1,
  },
});
