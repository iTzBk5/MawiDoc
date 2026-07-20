import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export function CreateManualAppointmentScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { slotId, date: initialDate, startTime: initialStart, endTime: initialEnd } = route.params || {};

  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialStart || '09:00');
  const [endTime, setEndTime] = useState(initialEnd || '09:30');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!patientName || !date || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await doctorService.createAppointment({
        patientName,
        slotId,
        date,
        startTime,
        endTime,
        notes: notes || undefined,
      });
      Alert.alert('Success', 'Walk-in appointment created successfully', [
        { text: 'OK', onPress: () => navigation.navigate('AllAppointments') }
      ]);
    } catch (err: any) {
      let errorMessage = err?.response?.data?.error?.message || 'Failed to create appointment';
      const details = err?.response?.data?.error?.details;
      if (Array.isArray(details) && details.length > 0) {
        errorMessage += ':\n' + details.join('\n');
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Add Appointment" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card style={styles.hintCard}>
          <View style={styles.hintRow}>
            <View style={styles.hintIconWrap}>
              <Ionicons name="person-add" size={20} color={colors.accent} />
            </View>
            <Text style={styles.hint}>Enter the patient's name for this walk-in appointment.</Text>
          </View>
        </Card>
        
        <Card style={styles.formCard}>
          <Input
            label="Patient Name"
            placeholder="e.g. John Doe (Walk-in)"
            value={patientName}
            onChangeText={setPatientName}
            leftIcon="👤"
          />

          {slotId ? (
            <View style={styles.slotInfoBox}>
              <View style={styles.slotInfoRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                <View style={styles.slotInfoContent}>
                  <Text style={styles.slotInfoLabel}>Selected Slot</Text>
                  <Text style={styles.slotInfoText}>{date} at {startTime} - {endTime}</Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              <Input
                label="Date (YYYY-MM-DD)"
                placeholder="2026-07-12"
                value={date}
                onChangeText={setDate}
                leftIcon="📅"
              />
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Input
                    label="Start Time (HH:MM)"
                    placeholder="09:00"
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                <View style={{ width: Spacing.md }} />
                <View style={styles.flex}>
                  <Input
                    label="End Time (HH:MM)"
                    placeholder="09:30"
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>
            </>
          )}

          <Input
            label="Notes (Optional)"
            placeholder="Any additional details"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Button
            title="Create Appointment"
            onPress={handleCreate}
            loading={loading}
            style={styles.submitBtn}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { padding: Spacing.lg },
  hintCard: {
    padding: Spacing.lg,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tintAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  hint: {
    ...Typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  formCard: {
    padding: Spacing.xl,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flex: { flex: 1 },
  submitBtn: { marginTop: Spacing.md },
  slotInfoBox: {
    backgroundColor: colors.tintAccent,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  slotInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotInfoContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  slotInfoLabel: {
    ...Typography.overline,
    color: colors.accentDark,
    marginBottom: 2,
  },
  slotInfoText: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
  },
});
