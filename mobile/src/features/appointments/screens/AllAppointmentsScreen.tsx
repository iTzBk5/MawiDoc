import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
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
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';
import { formatDate } from '../../../shared/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export function AllAppointmentsScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadAppointments(); }, []));

  const loadAppointments = async () => {
    setLoading(true);
    try { const res = await doctorService.getAppointments(); setAppointments(res.data || []); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  const handleAction = async (id: string, action: 'accept' | 'reject' | 'cancel') => {
    try {
      if (action === 'accept') await doctorService.acceptAppointment(id);
      else if (action === 'reject') await doctorService.rejectAppointment(id);
      else await doctorService.cancelAppointment(id);
      loadAppointments();
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err?.response?.data?.error?.message || t('common.error', 'Failed'));
    }
  };

  const onRefresh = () => { setRefreshing(true); loadAppointments(); };

  if (loading) return <><Header title={t('appointments.allAppointments', 'All Appointments')} /><Loading /></>;

  return (
    <View style={styles.container}>
      <Header title={t('appointments.allAppointments', 'All Appointments')} />
      <View style={styles.body}>
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
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detail}>{formatDate(item.date)} {t('common.at', 'at')} {item.startTime}</Text>
                  </View>
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
          ListEmptyComponent={<EmptyState message={t('appointments.noAppointments', 'No appointments')} icon="📋" />}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('DoctorSlotSelection')}
        activeOpacity={0.85}>
        <LinearGradient
          colors={colors.gradientAccent}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.fabGradient}>
          <Ionicons name="add" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  detail: { ...Typography.caption, color: colors.textSecondary },
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
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    borderRadius: 30,
    ...Shadows.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
