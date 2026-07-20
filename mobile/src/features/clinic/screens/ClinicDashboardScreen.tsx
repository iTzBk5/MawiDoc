import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { Typography } from '../../../shared/theme/typography';
import { ClinicHomeStackParamList, ClinicTabParamList } from '../../../navigation/types';
import { clinicApi } from '../../../shared/api/clinic.api';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type Props = {
  navigation: NativeStackNavigationProp<ClinicHomeStackParamList, 'ClinicDashboard'> & BottomTabNavigationProp<ClinicTabParamList, 'HomeTab'>;
};

export function ClinicDashboardScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        clinicApi.getProfile(),
        clinicApi.getStatistics()
      ]);
      setProfile(profileRes.data?.data || profileRes.data);
      setStats(statsRes.data?.data || statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleStatus = async (val: boolean) => {
    setStatusUpdating(true);
    try {
      await clinicApi.updateStatus(val);
      setProfile({ ...profile, isOpen: val });
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const renderCard = (title: string, icon: string, value: string, onPress: () => void, fullWidth = false) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }, fullWidth && { minWidth: '100%' }]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.cardValue, Typography.h2, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.cardTitle, Typography.caption, { color: colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textPrimary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[Typography.h2, { color: colors.white }]}>{profile?.name || t('clinic.dashboard', 'Clinic Dashboard')}</Text>
            <Text style={[Typography.body, { color: colors.white, opacity: 0.8 }]}>{profile?.address}</Text>
          </View>
          <View style={styles.statusToggle}>
            <Text style={[Typography.captionBold, { color: colors.white, marginRight: 8 }]}>
              {profile?.isOpen ? t('doctor.status.open', 'OPEN') : t('doctor.status.closed', 'CLOSED')}
            </Text>
            <Switch
              value={profile?.isOpen || false}
              onValueChange={handleToggleStatus}
              disabled={statusUpdating}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: colors.accent }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        
        {/* Today's Appointments Button */}
        <TouchableOpacity 
          style={[styles.todayButton, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('AppointmentsTab', { filter: 'today' })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="calendar" size={24} color={colors.white} />
            <Text style={[Typography.bodyBold, { color: colors.white }]}>
              {t('clinic.viewTodayAppointments', 'View Today\'s Appointments')}
            </Text>
          </View>
          <View style={[styles.todayBadge, { backgroundColor: colors.white }]}>
            <Text style={[Typography.captionBold, { color: colors.accent }]}>
              {stats?.todayAppointments || 0}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={[Typography.h3, { color: colors.textPrimary, marginBottom: 16 }]}>{t('clinic.aggregatedStatistics', 'Aggregated Statistics')}</Text>
        
        <View style={styles.grid}>
          {renderCard(
            t('doctor.totalAppointments', 'Total Appointments'),
            'calendar-outline',
            stats?.totalAppointments?.toString() || '0',
            () => {}
          )}
          {renderCard(
            t('doctor.passedPatients', 'Passed Patients'),
            'checkmark-done-outline',
            stats?.passedPatients?.toString() || '0',
            () => {}
          )}
          {renderCard(
            t('doctor.monthlyAppointments', 'Monthly'),
            'bar-chart-outline',
            stats?.monthlyAppointments?.toString() || '0',
            () => {}
          )}
          {renderCard(
            t('doctor.cancelledAppointments', 'Cancelled'),
            'close-circle-outline',
            stats?.cancelledAppointments?.toString() || '0',
            () => {}
          )}
        </View>

        <Text style={[Typography.h3, { color: colors.textPrimary, marginTop: 16, marginBottom: 16 }]}>{t('clinic.clinicManagement', 'Clinic Management')}</Text>
        <View style={styles.grid}>
          {renderCard(
            t('clinic.medicalTeam', 'Medical Team'),
            'people-outline',
            profile?.doctors?.length?.toString() || '0',
            () => navigation.navigate('ClinicTeam'),
            true
          )}
          {renderCard(
            t('clinic.galleryPhotos', 'Gallery Photos'),
            'images-outline',
            profile?.photos?.length?.toString() || '0',
            () => navigation.navigate('GalleryManager'),
            true
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  content: {
    padding: 24,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  todayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardValue: {
    fontWeight: 'bold',
  },
  cardTitle: {
    textAlign: 'center',
  },
});
