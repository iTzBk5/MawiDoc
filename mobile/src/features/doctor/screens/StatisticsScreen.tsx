import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';
import { useTranslation } from 'react-i18next';

export function StatisticsScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try { setStats(await doctorService.getStatistics()); }
    catch {} finally { setLoading(false); }
  };

  if (loading || !stats) return <><Header title={t('doctor.statistics', 'Statistics')} /><Loading /></>;

  const items = [
    { label: t('appointments.total', 'Total Appointments'), value: stats.totalAppointments, icon: 'calendar' as const, color: colors.primary, bg: colors.tintPrimary },
    { label: t('appointments.today', 'Today'), value: stats.todayAppointments, icon: 'today' as const, color: colors.accent, bg: colors.tintAccent },
    { label: t('appointments.monthly', 'This Month'), value: stats.monthlyAppointments, icon: 'trending-up' as const, color: colors.info, bg: colors.infoLight },
    { label: t('appointments.cancelled', 'Cancelled'), value: stats.cancelledAppointments, icon: 'close-circle' as const, color: colors.error, bg: colors.errorLight },
    { label: t('doctor.passedPatients', 'Passed Patients'), value: stats.passedPatients, icon: 'people' as const, color: colors.success, bg: colors.successLight },
  ];

  return (
    <View style={styles.container}>
      <Header title={t('doctor.statistics', 'Statistics')} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <Card key={item.label} style={styles.statCard}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.info}>
                <Text style={styles.label}>{item.label}</Text>
              </View>
              <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  statCard: {
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  label: { ...Typography.bodyBold, color: colors.textPrimary },
  value: { ...Typography.h2 },
});
