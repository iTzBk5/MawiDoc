import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';
import { format } from 'date-fns';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function DoctorSlotSelectionScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => { 
    if (selectedDate) loadSlots(selectedDate); 
  }, [selectedDate]);

  const loadSlots = async (date: string) => {
    setLoading(true);
    setSelectedSlot(null);
    try { 
      const data = await doctorService.getSlots(date); 
      setSlots(data); 
    }
    catch (err) {
      console.warn('Failed to load slots', err);
    } 
    finally { setLoading(false); }
  };

  const handleNext = () => {
    if (!selectedSlot) return;
    // Go to manual appointment screen with pre-filled slot data
    navigation.navigate('CreateManualAppointment', {
      slotId: selectedSlot.id,
      date: selectedSlot.date.split('T')[0],
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Select Time Slot" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={styles.calendarWrap}>
          <Calendar
            current={selectedDate}
            minDate={format(new Date(), 'yyyy-MM-dd')}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: colors.primary }
            }}
            theme={{
              selectedDayBackgroundColor: colors.primary,
              todayTextColor: colors.accent,
              arrowColor: colors.primary,
              textDayFontFamily: Typography.body.fontFamily as string,
              textMonthFontFamily: Typography.h3.fontFamily as string,
              textDayHeaderFontFamily: Typography.caption.fontFamily as string,
              calendarBackground: colors.surface,
            }}
            style={styles.calendar}
          />
        </View>

        <View style={styles.dateTitleRow}>
          <Ionicons name="time-outline" size={18} color={colors.primary} />
          <Text style={styles.dateTitle}>
            Available slots for {selectedDate}
          </Text>
        </View>

        {loading ? (
          <Loading fullScreen={false} />
        ) : (
          <FlatList
            data={slots}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => {
              const isSelected = selectedSlot?.id === item.id;
              const isBooked = item.isBooked;

              return (
                <TouchableOpacity
                  disabled={isBooked}
                  style={[
                    styles.slot,
                    isBooked && styles.slotBooked,
                    isSelected && styles.slotSelected
                  ]}
                  onPress={() => setSelectedSlot(item)}
                  activeOpacity={0.8}>
                  <Text style={[
                    styles.slotTime,
                    isBooked && styles.slotTimeBooked,
                    isSelected && styles.slotTimeSelected
                  ]}>
                    {item.startTime}
                  </Text>
                  {isBooked && <Ionicons name="close-circle" size={12} color={colors.error} style={{ marginTop: 2 }} />}
                  {isSelected && <Ionicons name="checkmark-circle" size={12} color={colors.accent} style={{ marginTop: 2 }} />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<EmptyState message="No available slots for this date" icon="📅" />}
            contentContainerStyle={styles.listContent}
          />
        )}

        {selectedSlot && (
          <View style={styles.selectBar}>
            <View style={styles.selectInfo}>
              <Ionicons name="time" size={18} color={colors.accent} />
              <Text style={styles.selectTime}>{selectedSlot.startTime} - {selectedSlot.endTime}</Text>
            </View>
            <Button 
              title="Next" 
              onPress={handleNext} 
              style={styles.selectBtn}
              size="sm"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.md },
  calendarWrap: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
  },
  dateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  dateTitle: {
    ...Typography.label,
    color: colors.primary,
  },
  row: {
    justifyContent: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  slot: { 
    flex: 1,
    backgroundColor: colors.surface, 
    borderRadius: BorderRadius.md, 
    paddingVertical: Spacing.md, 
    alignItems: 'center',
    borderWidth: 1.5, 
    borderColor: colors.borderLight,
    minWidth: '30%',
    maxWidth: '31%',
    ...Shadows.sm,
  },
  slotSelected: { 
    borderColor: colors.accent, 
    backgroundColor: colors.tintAccent,
  },
  slotBooked: {
    backgroundColor: colors.slotBooked,
    borderColor: colors.slotBookedBorder,
    opacity: 0.6,
  },
  slotTime: { 
    ...Typography.bodyBold, 
    color: colors.textPrimary 
  },
  slotTimeSelected: {
    color: colors.accentDark,
  },
  slotTimeBooked: {
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  selectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    margin: Spacing.sm,
    ...Shadows.md,
  },
  selectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectTime: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
  },
  selectBtn: { 
    minWidth: 100,
  },
});
