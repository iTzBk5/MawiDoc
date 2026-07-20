import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { Button } from '../../../shared/components/Button';
import { ThemeColors } from '../../../shared/theme/colors';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../../../store/notification.store';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';

type Props = { navigation: NativeStackNavigationProp<any> };

export function DashboardScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { unreadCount } = useNotificationStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsData, profileData] = await Promise.all([
        doctorService.getStatistics(),
        doctorService.getProfile(),
      ]);
      setStats(statsData);
      setIsOpen(profileData.isOpen);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  };

  const toggleStatus = async () => {
    try {
      await doctorService.updateStatus(!isOpen);
      setIsOpen(!isOpen);
    } catch {}
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading || !stats) return <><Header title={t('doctor.dashboard')} /><Loading /></>;

  const statItems = [
    { label: t('appointments.total', 'Total'), value: stats.totalAppointments, icon: 'calendar' as const, color: colors.primary, bg: colors.tintPrimary },
    { label: t('appointments.today', 'Today'), value: stats.todayAppointments, icon: 'today' as const, color: colors.accent, bg: colors.tintAccent },
    { label: t('appointments.monthly', 'Monthly'), value: stats.monthlyAppointments, icon: 'trending-up' as const, color: colors.info, bg: colors.infoLight },
    { label: t('appointments.cancelled', 'Cancelled'), value: stats.cancelledAppointments, icon: 'close-circle' as const, color: colors.error, bg: colors.errorLight },
  ];

  return (
    <View style={styles.container}>
      <Header title={t('doctor.dashboard')} rightElement={
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.overlayWhite, alignItems: 'center', justifyContent: 'center' }}
          activeOpacity={0.75}>
          <Ionicons name="notifications-outline" size={20} color={colors.textOnPrimary} />
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', top: -2, right: -2, backgroundColor: colors.error, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
              <Text style={{ color: colors.textOnPrimary, fontSize: 10, fontWeight: '700' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      } />
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}>

        {/* Clinic Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>{t('doctor.clinicStatus', 'Clinic Status')}</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: isOpen ? colors.accepted : colors.cancelled }]} />
                <Text style={[styles.statusText, { color: isOpen ? colors.accepted : colors.cancelled }]}>
                  {isOpen ? t('common.open', 'Open') : t('common.closed', 'Closed')}
                </Text>
              </View>
            </View>
            <Button
              title={isOpen ? t('common.close', 'Close') : t('common.open', 'Open')}
              variant={isOpen ? 'danger' : 'secondary'}
              onPress={toggleStatus}
              size="sm"
              style={styles.statusBtn}
              icon={isOpen ? '🔴' : '🟢'}
            />
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.grid}>
          {statItems.map((item) => (
            <Card key={item.label} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[styles.statNumber, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

        {/* Passed Patients */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Appointments', { screen: 'AppointmentsList', params: { tab: 'past' } })}>
          <Card style={styles.patientsCard}>
            <View style={styles.patientsRow}>
              <View style={[styles.statIconWrap, { backgroundColor: colors.tintAccent }]}>
                <Ionicons name="people" size={20} color={colors.accent} />
              </View>
              <View style={styles.patientsInfo}>
                <Text style={styles.patientsNumber}>{stats.passedPatients}</Text>
                <Text style={styles.patientsLabel}>{t('doctor.passedPatients', 'Passed Patients')}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Today Button */}
        <TouchableOpacity
          style={styles.todayBtn}
          onPress={() => navigation.navigate('TodayAppointments')}
          activeOpacity={0.85}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.todayGradient}>
            <Ionicons name="calendar-outline" size={22} color={colors.textOnPrimary} />
            <Text style={styles.todayBtnText}>{t('doctor.viewTodayAppointments', 'View Today\'s Appointments')}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textOnPrimary} style={{ opacity: 0.7 }} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  statusCard: { padding: Spacing.xl },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    ...Typography.overline,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    ...Typography.bodyBold,
  },
  statusBtn: { minWidth: 100 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    flexGrow: 1,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statNumber: {
    ...Typography.h1,
  },
  statLabel: {
    ...Typography.caption,
    color: colors.textSecondary,
    marginTop: Spacing.xs,
  },
  patientsCard: {
    padding: Spacing.xl,
  },
  patientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientsInfo: {
    marginLeft: Spacing.lg,
  },
  patientsNumber: {
    ...Typography.h1,
    color: colors.primary,
  },
  patientsLabel: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  todayBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
    ...Shadows.md,
  },
  todayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  todayBtnText: {
    ...Typography.bodyBold,
    color: colors.textOnPrimary,
    flex: 1,
  },
});
