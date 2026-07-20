import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Button } from '../../../shared/components/Button';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';
import { formatDate } from '../../../shared/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export function TodayAppointmentsScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try { const res = await doctorService.getAppointments({ date: today }); setAppointments(res.data || []); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  const handleAction = async (id: string, action: 'cancel') => {
    try {
      await doctorService.cancelAppointment(id);
      loadData();
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err?.response?.data?.error?.message || t('common.error', 'Failed'));
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) return <><Header title={t('appointments.today', 'Today')} /><Loading /></>;

  return (
    <View style={styles.container}>
      <Header title={t('doctor.viewTodayAppointments', "Today's Appointments")} />
      <View style={styles.body}>
        {/* Count pill */}
        <View style={styles.countRow}>
          <View style={styles.countPill}>
            <Ionicons name="calendar" size={14} color={colors.accent} />
            <Text style={styles.countText}>{appointments.length} {t('appointments.title', 'Appointments')}</Text>
          </View>
        </View>

        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const [hours, minutes] = (item.startTime || '00:00').split(':').map(Number);
            const dateStr = item.date.split('T')[0];
            const apptDate = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
            const isPassed = apptDate.getTime() < Date.now();
            const showCancel = !isPassed && item.status === 'ACCEPTED';

            return (
            <Card style={styles.apptCard}>
              <View style={styles.row}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>
                    {(item.patientName || item.patient?.fullName || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.patientName || item.patient?.fullName || t('common.unknown', 'Unknown')}</Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color={colors.accent} />
                    <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
                  </View>
                  {item.patient?.phone && (
                     <View style={styles.timeRow}>
                       <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                       <Text style={styles.phone}>{item.patient.phone}</Text>
                     </View>
                  )}
                </View>
                <StatusBadge status={isPassed && (item.status === 'ACCEPTED' || item.status === 'PENDING') ? 'PASSED' : item.status} />
              </View>
              {showCancel && (
                <View style={styles.actions}>
                  <Button title={t('common.cancel', 'Cancel')} variant="danger" onPress={() => handleAction(item.id, 'cancel')} style={styles.actionBtn} size="sm" />
                </View>
              )}
            </Card>
            );
          }}
          ListEmptyComponent={<EmptyState message={t('appointments.noAppointmentsToday', 'No appointments today')} icon="📋" />}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  countRow: {
    marginBottom: Spacing.md,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: colors.tintAccent,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  countText: {
    ...Typography.captionBold,
    color: colors.accent,
  },
  apptCard: {
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tintPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.h3,
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  name: { ...Typography.bodyBold, color: colors.textPrimary },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  time: { ...Typography.caption, color: colors.accent },
  phone: { ...Typography.caption, color: colors.textSecondary },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtn: { flex: 1 },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
});
