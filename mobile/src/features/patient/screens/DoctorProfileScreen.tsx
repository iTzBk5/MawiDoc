import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { PatientHomeStackParamList } from '../../../navigation/types';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SafeMapView } from '../../../shared/components/SafeMapView';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { searchService } from '../../../services/search.service';
import { getDayName, getDayNameAr, formatPrice } from '../../../shared/utils/formatters';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation: NativeStackNavigationProp<PatientHomeStackParamList, 'DoctorProfile'>;
  route: RouteProp<PatientHomeStackParamList, 'DoctorProfile'>;
};

export function DoctorProfileScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t, i18n } = useTranslation();
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadDoctor(); }, [doctorId]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchService.getDoctorById(doctorId);
      setDoctor(data);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to load doctor profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !doctor) {
    return (
      <View style={styles.container}>
        <Header title={t('profile.doctorProfile', 'Doctor Profile')} onBack={() => navigation.goBack()} />
        <View style={styles.body}>
          <EmptyState message={error || t('patient.doctorNotFound', 'Doctor not found')} icon="⚠️" />
          <Button title={t('common.retry', 'Retry')} onPress={loadDoctor} variant="outline" style={styles.retryBtn} />
        </View>
      </View>
    );
  }

  const specName = i18n.language === 'ar' && doctor.specialty?.nameAr ? doctor.specialty.nameAr : 
                   i18n.language === 'fr' && doctor.specialty?.nameFr ? doctor.specialty.nameFr : 
                   doctor.specialty?.name || '';

  const photosToDisplay = doctor.photos?.length > 0 ? doctor.photos : doctor.clinic?.photos || [];

  return (
    <View style={styles.container}>
      <Header title={doctor.fullName} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <LinearGradient colors={colors.gradientHero} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>
                {(doctor.fullName || '?').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.heroInfo}>
              <Text style={styles.name}>{doctor.fullName}</Text>
              <Text style={styles.specialty}>{specName}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: doctor.isOpen ? colors.accepted : colors.cancelled }]} />
                <Text style={[styles.statusLabel, { color: doctor.isOpen ? colors.accepted : colors.cancelled }]}>
                  {doctor.isOpen ? t('common.open', 'Open') : t('common.closed', 'Closed')}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.priceRow}>
            <View style={styles.priceChip}>
              <Ionicons name="cash-outline" size={16} color={colors.accent} />
              <Text style={styles.price}>{formatPrice(doctor.consultationPrice)}</Text>
            </View>
          </View>
        </Card>

        {/* Clinic Info */}
        {(doctor.clinicName || doctor.clinic?.name) && (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.tintPrimary }]}>
                <Ionicons name="business-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('auth.clinicName', 'Clinic Name')}</Text>
                <Text style={styles.infoValue}>{doctor.clinic?.name || doctor.clinicName}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Address + Map */}
        {doctor.address && (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.tintAccent }]}>
                <Ionicons name="location-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('auth.address', 'Address')}</Text>
                <Text style={styles.infoValue}>{doctor.address}</Text>
              </View>
            </View>
            {doctor.latitude && doctor.longitude && (
              <View style={styles.mapContainer}>
                <SafeMapView
                  initialRegion={{
                    latitude: doctor.latitude,
                    longitude: doctor.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  markers={[{
                    id: doctor.id,
                    latitude: doctor.latitude,
                    longitude: doctor.longitude,
                    title: doctor.clinic?.name || doctor.clinicName || doctor.fullName,
                  }]}
                  style={styles.map}
                />
              </View>
            )}
          </Card>
        )}

        {/* About */}
        {doctor.description && (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="information-circle-outline" size={18} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('common.about', 'About')}</Text>
                <Text style={styles.infoValue}>{doctor.description}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Gallery */}
        {photosToDisplay.length > 0 && (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.tintPrimary }]}>
                <Ionicons name="images-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gallery</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll} contentContainerStyle={{ gap: 12 }}>
              {photosToDisplay.map((photo: any) => (
                <View key={photo.id} style={styles.galleryImageWrap}>
                  <Image source={{ uri: photo.url }} style={{ width: 120, height: 120, borderRadius: 12 }} />
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Working Days */}
        {doctor.workingDays?.length > 0 && (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="time-outline" size={18} color={colors.warning} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('doctor.workingDays', 'Working Days')}</Text>
                {doctor.workingDays.map((day: any) => (
                  <View key={day.id} style={styles.dayRow}>
                    <Text style={styles.dayName}>{i18n.language === 'ar' ? getDayNameAr(day.dayOfWeek) : getDayName(day.dayOfWeek)}</Text>
                    <Text style={styles.dayTime}>{day.startTime} - {day.endTime}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        )}

        {/* Book Button */}
        <Button
          title={t('patient.bookAppointment', 'Book Appointment')}
          onPress={() => navigation.navigate('SlotSelection', { doctorId })}
          style={styles.bookBtn}
          icon="📅"
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  heroCard: {
    padding: Spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    ...Typography.h1,
    color: colors.white,
  },
  heroInfo: {
    flex: 1,
  },
  name: { ...Typography.h2, color: colors.textPrimary },
  specialty: { ...Typography.body, color: colors.textSecondary, marginTop: 2 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    ...Typography.captionBold,
  },
  priceRow: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  priceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: colors.tintAccent,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  price: { ...Typography.bodyBold, color: colors.accent },
  infoCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.overline,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  infoValue: { ...Typography.body, color: colors.textPrimary },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayName: { ...Typography.label, color: colors.textPrimary },
  dayTime: { ...Typography.caption, color: colors.textSecondary },
  mapContainer: {
    height: 200,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  map: { flex: 1 },
  galleryScroll: {
    marginTop: 12,
  },
  galleryImageWrap: {
    marginRight: 12,
  },
  bookBtn: { marginTop: Spacing.lg, marginBottom: Spacing.xxxl },
  retryBtn: { marginTop: Spacing.lg, alignSelf: 'center' },
});
