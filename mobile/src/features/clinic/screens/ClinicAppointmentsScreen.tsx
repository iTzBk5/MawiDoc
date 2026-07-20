import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing } from '../../../shared/theme/spacing';
import { clinicApi } from '../../../shared/api/clinic.api';
import { formatDate } from '../../../shared/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export function ClinicAppointmentsScreen({ route }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today'>(route?.params?.filter || 'all');

  useEffect(() => {
    if (route?.params?.filter) {
      setFilter(route.params.filter);
    }
  }, [route?.params?.filter]);

  useFocusEffect(useCallback(() => { loadAppointments(); }, []));

  const loadAppointments = async () => {
    setLoading(true);
    try { 
      const res = await clinicApi.getAppointments(); 
      setAppointments(res.data?.data || res.data || []); 
    }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadAppointments(); };

  if (loading) return <><Header title={t('appointments.title', 'Appointments')} /><Loading /></>;

  const todayStr = new Date().toISOString().split('T')[0];
  const filteredAppointments = appointments.filter(a => {
    if (filter === 'today') return a.date.startsWith(todayStr);
    return true;
  });

  return (
    <View style={styles.container}>
      <Header title={t('appointments.title', 'Appointments')} />
      <View style={styles.body}>
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segment, filter === 'today' && styles.segmentActive]}
            onPress={() => setFilter('today')}
            activeOpacity={0.8}>
            <Text style={[styles.segmentText, filter === 'today' && styles.segmentTextActive]}>
              {t('appointments.today', 'Today')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, filter === 'all' && styles.segmentActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}>
            <Text style={[styles.segmentText, filter === 'all' && styles.segmentTextActive]}>
              {t('appointments.all', 'All Appointments')}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const [hours, minutes] = (item.startTime || '00:00').split(':').map(Number);
            const dateStr = item.date.split('T')[0];
            const apptDate = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
            const isPassed = apptDate.getTime() < Date.now();

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
                  
                  {/* Doctor Info */}
                  <View style={styles.detailRow}>
                    <Ionicons name="medkit-outline" size={14} color={colors.primary} />
                    <Text style={styles.doctorName}>{item.doctor?.fullName}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detail}>{formatDate(item.date)} {t('common.at', 'at')} {item.startTime}</Text>
                  </View>
                </View>
                <StatusBadge status={isPassed && (item.status === 'ACCEPTED' || item.status === 'PENDING') ? 'PASSED' : item.status} />
              </View>
            </Card>
            );
          }}
          ListEmptyComponent={<EmptyState message={t('appointments.noAppointments', 'No appointments')} icon="📋" />}
          contentContainerStyle={styles.listContent}
        />
      </View>
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
  doctorName: { ...Typography.caption, color: colors.primary, fontWeight: '600' },
  detail: { ...Typography.caption, color: colors.textSecondary },
  listContent: {
    paddingBottom: 100,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted || '#f4f4f5',
    borderRadius: 8,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    ...Typography.bodyBold,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
  },
});
