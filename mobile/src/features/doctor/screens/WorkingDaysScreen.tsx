import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, ScrollView, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';
import { getDayName, getDayNameAr } from '../../../shared/utils/formatters';
import { useTranslation } from 'react-i18next';

const DAYS = [0, 1, 2, 3, 4, 5, 6];

export function WorkingDaysScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t, i18n } = useTranslation();
  const [days, setDays] = useState(
    DAYS.map((d) => ({ dayOfWeek: d, isActive: d >= 1 && d <= 5, startTime: '09:00', endTime: '17:00' }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDays(); }, []);

  const loadDays = async () => {
    try {
      const data = await doctorService.getWorkingDays();
      if (data?.length > 0) {
        setDays(DAYS.map((d) => {
          const existing = data.find((w: any) => w.dayOfWeek === d);
          return existing || { dayOfWeek: d, isActive: false, startTime: '09:00', endTime: '17:00' };
        }));
      }
    } catch {} finally { setLoading(false); }
  };

  const toggleDay = (dayOfWeek: number) => {
    setDays((prev) => prev.map((d) => d.dayOfWeek === dayOfWeek ? { ...d, isActive: !d.isActive } : d));
  };

  const updateTime = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setDays((prev) => prev.map((d) => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorService.updateWorkingDays(days);
      Alert.alert(t('common.ok'), t('doctor.workingDaysUpdated', 'Working days updated'));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.response?.data?.error?.message || t('common.error'));
    } finally { setSaving(false); }
  };

  return (
    <View style={styles.container}>
      <Header title={t('doctor.workingDays', 'Working Days')} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>{t('doctor.workingDaysHint', 'Toggle the days your clinic is open')}</Text>
        <Card style={styles.daysCard}>
          {days.map((day, index) => (
            <View key={day.dayOfWeek}>
              <View style={styles.dayRow}>
                <View style={[styles.dayIconWrap, { backgroundColor: day.isActive ? colors.tintAccent : colors.surfaceMuted }]}>
                  <Ionicons
                    name={day.isActive ? 'checkmark-circle' : 'close-circle-outline'}
                    size={20}
                    color={day.isActive ? colors.accent : colors.textLight}
                  />
                </View>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayName, !day.isActive && styles.dayNameInactive]}>
                    {i18n.language === 'ar' ? getDayNameAr(day.dayOfWeek) : getDayName(day.dayOfWeek)}
                  </Text>
                  {day.isActive && (
                    <View style={styles.timeInputsRow}>
                      <TextInput
                        style={[styles.timeInput, { color: colors.textPrimary, borderColor: colors.border }]}
                        value={day.startTime}
                        onChangeText={(t) => updateTime(day.dayOfWeek, 'startTime', t)}
                        placeholder="09:00"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                      <Text style={{ color: colors.textSecondary }}> - </Text>
                      <TextInput
                        style={[styles.timeInput, { color: colors.textPrimary, borderColor: colors.border }]}
                        value={day.endTime}
                        onChangeText={(t) => updateTime(day.dayOfWeek, 'endTime', t)}
                        placeholder="17:00"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                    </View>
                  )}
                </View>
                <Switch
                  value={day.isActive}
                  onValueChange={() => toggleDay(day.dayOfWeek)}
                  trackColor={{ false: colors.border, true: colors.accentLight }}
                  thumbColor={day.isActive ? colors.accent : colors.textLight}
                />
              </View>
              {index < days.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>
        <Button title={t('doctor.saveWorkingDays', 'Save Working Days')} onPress={handleSave} loading={saving} style={styles.saveBtn} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  hint: {
    ...Typography.body,
    color: colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  daysCard: {
    padding: 0,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dayIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
  },
  dayNameInactive: {
    color: colors.textLight,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    fontSize: 12,
    minWidth: 50,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
  saveBtn: { marginTop: Spacing.xl, marginBottom: Spacing.xxxl },
});
