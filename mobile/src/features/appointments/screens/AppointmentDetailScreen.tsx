import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius } from '../../../shared/theme/spacing';
import { formatDate } from '../../../shared/utils/formatters';
import { useTranslation } from 'react-i18next';

export function AppointmentDetailScreen({ navigation, route }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const appointment = route?.params?.appointment;
  if (!appointment) return <Header title={t('appointments.detail', 'Appointment Detail')} onBack={() => navigation.goBack()} />;

  const details = [
    { label: t('common.date', 'Date'), value: formatDate(appointment.date), icon: 'calendar-outline' as const, color: colors.primary, bg: colors.tintPrimary },
    { label: t('common.time', 'Time'), value: `${appointment.startTime} - ${appointment.endTime}`, icon: 'time-outline' as const, color: colors.accent, bg: colors.tintAccent },
    ...(appointment.doctor ? [{ label: t('patient.doctor', 'Doctor'), value: appointment.doctor.fullName, icon: 'medkit-outline' as const, color: colors.info, bg: colors.infoLight }] : []),
    ...(appointment.patient ? [{ label: t('patient.patient', 'Patient'), value: appointment.patient.fullName, icon: 'person-outline' as const, color: colors.success, bg: colors.successLight }] : []),
    ...(appointment.notes ? [{ label: t('common.notes', 'Notes'), value: appointment.notes, icon: 'document-text-outline' as const, color: colors.warning, bg: colors.warningLight }] : []),
  ];

  return (
    <View style={styles.container}>
      <Header title={t('appointments.detail', 'Appointment Detail')} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusLabel}>{t('common.status', 'Status')}</Text>
          <StatusBadge status={appointment.status} />
        </Card>

        {/* Details */}
        <Card style={styles.detailsCard}>
          {details.map((item, index) => (
            <View key={item.label}>
              <View style={styles.detailRow}>
                <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
              {index < details.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* Cancel */}
        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
          <Button title={t('appointments.cancelAppointment', 'Cancel Appointment')} variant="danger" onPress={() => {
            Alert.alert(t('common.cancel', 'Cancel'), t('common.areYouSure', 'Are you sure?'), [
              { text: t('common.no', 'No') },
              { text: t('common.yes', 'Yes'), onPress: () => navigation.goBack() },
            ]);
          }} style={styles.cancelBtn} />
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  statusCard: {
    padding: Spacing.lg,
  },
  statusLabel: {
    ...Typography.overline,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.overline,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    ...Typography.body,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
  cancelBtn: { marginTop: Spacing.md, marginBottom: Spacing.xxxl },
});
