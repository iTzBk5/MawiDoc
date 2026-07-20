import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
import { Spacing, BorderRadius } from '../../../shared/theme/spacing';
import { patientService } from '../../../services/patient.service';
import { useAuth } from '../../../shared/hooks/useAuth';
import { formatDate } from '../../../shared/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export function AppointmentsListScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const { isDoctor } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<any, any>>();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>(route.params?.tab || 'upcoming');

  useFocusEffect(
    useCallback(() => { loadAppointments(); }, [])
  );

  const loadAppointments = async () => {
    setLoading(true);
    try {
      if (isDoctor) {
        const { doctorService } = await import('../../../services/doctor.service');
        const res = await doctorService.getAppointments();
        setAppointments(res.data || []);
      } else {
        const res = await patientService.getAppointments();
        setAppointments(res.data || []);
      }
    } catch {} finally { setLoading(false); setRefreshing(false); }
  };

  const handleCancel = async (id: string) => {
    try {
      if (isDoctor) {
        const { doctorService } = await import('../../../services/doctor.service');
        await doctorService.cancelAppointment(id);
      } else {
        await patientService.cancelAppointment(id);
      }
      loadAppointments();
    } catch (err) {
      console.warn('Failed to cancel appointment', err);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadAppointments(); };

  if (loading) return <><Header title={t('appointments.title', 'Appointments')} /><Loading /></>;

  const filteredAppointments = appointments.filter(item => {
    const [hours, minutes] = (item.startTime || '00:00').split(':').map(Number);
    const apptDate = new Date(item.date);
    apptDate.setHours(hours, minutes, 0, 0);
    const isPassed = apptDate.getTime() < Date.now();
    return activeTab === 'upcoming' ? !isPassed : isPassed;
  });

  return (
    <View style={styles.container}>
      <Header title={t('appointments.myAppointments', 'My Appointments')} />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}>
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            {t('appointments.upcoming', 'Upcoming')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.8}>
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            {t('appointments.past', 'Past')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const [hours, minutes] = (item.startTime || '00:00').split(':').map(Number);
            const apptDate = new Date(item.date);
            apptDate.setHours(hours, minutes, 0, 0);
            const isPassed = apptDate.getTime() < Date.now();
            const showCancel = !isPassed && (item.status === 'PENDING' || item.status === 'ACCEPTED');

            return (
            <Card style={styles.apptCard}>
              <TouchableOpacity 
                disabled={isDoctor}
                onPress={() => {
                  if (!isDoctor) {
                    (navigation as any).navigate('HomeTab', { 
                      screen: 'DoctorProfile', 
                      params: { doctorId: item.doctorId } 
                    });
                  }
                }}
                activeOpacity={0.85}>
                <View style={styles.row}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                      {(item.doctor?.fullName || item.patient?.fullName || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.doctor?.fullName || item.patient?.fullName || t('common.unknown', 'Unknown')}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.detail}>{formatDate(item.date)} {t('common.at', 'at')} {item.startTime}</Text>
                    </View>
                    {item.notes && (
                      <View style={styles.metaRow}>
                        <Ionicons name="document-text-outline" size={14} color={colors.textLight} />
                        <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
                      </View>
                    )}
                  </View>
                  <StatusBadge status={isPassed && (item.status === 'ACCEPTED' || item.status === 'PENDING') ? 'PASSED' : item.status} />
                </View>
              </TouchableOpacity>
              
              {showCancel && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => handleCancel(item.id)}
                    activeOpacity={0.8}>
                    <Ionicons name="close-circle-outline" size={16} color={colors.error} />
                    <Text style={styles.cancelBtnText}>{t('common.cancel', 'Cancel')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
            );
          }}
          ListEmptyComponent={<EmptyState message={t('appointments.noAppointments', 'No appointments yet')} icon="📅" />}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: colors.overlayWhite,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...Typography.bodyBold,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.textOnPrimary,
  },
  apptCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  detail: { ...Typography.caption, color: colors.textSecondary },
  notes: { ...Typography.caption, color: colors.textLight, flex: 1 },
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: colors.errorLight,
    borderRadius: BorderRadius.full,
  },
  cancelBtnText: {
    ...Typography.captionBold,
    color: colors.error,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
});
