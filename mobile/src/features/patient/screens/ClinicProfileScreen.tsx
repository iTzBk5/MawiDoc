import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PatientHomeStackParamList } from '../../../navigation/types';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SafeMapView } from '../../../shared/components/SafeMapView';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<PatientHomeStackParamList, 'ClinicProfile'>;
  route: RouteProp<PatientHomeStackParamList, 'ClinicProfile'>;
};

export function ClinicProfileScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t, i18n } = useTranslation();
  const { clinicId } = route.params;
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);

  useEffect(() => { loadClinic(); }, [clinicId]);

  const loadClinic = async () => {
    try {
      setLoading(true);
      setError(null);
      // Wait, there's no patient endpoint to fetch clinic details?
      // I can add one or maybe I can use `/clinic/doctors`?
      // Let's create an endpoint on server if missing, or use a workaround.
      // Assuming I'll create `GET /api/v1/patient/clinics/:id` or similar.
      // Wait, in `patient.service.ts` we didn't add `getClinicById` yet.
      // We will add it next.
      const res = await api.get(`/clinic/public/${clinicId}`);
      setClinic(res.data.data);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to load clinic profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !clinic) {
    return (
      <View style={styles.container}>
        <Header title={t('profile.clinicProfile', 'Clinic Profile')} onBack={() => navigation.goBack()} />
        <View style={styles.body}>
          <EmptyState message={error || t('patient.clinicNotFound', 'Clinic not found')} icon="⚠️" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={clinic.name} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            {clinic.profilePicture ? (
              <Image source={{ uri: clinic.profilePicture }} style={styles.clinicImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.tintPrimary }]}>
                <Ionicons name="business-outline" size={32} color={colors.primary} />
              </View>
            )}
            <View style={styles.heroInfo}>
              <Text style={styles.name}>{clinic.name}</Text>
              <Text style={styles.specialty}>{clinic.address}</Text>
            </View>
          </View>
        </Card>

        {/* Address + Map */}
        {(clinic.address || (clinic.latitude && clinic.longitude)) && (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.tintAccent }]}>
                <Ionicons name="location-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('auth.address', 'Address')}</Text>
                <Text style={styles.infoValue}>{clinic.address || t('common.noData', 'No address')}</Text>
              </View>
            </View>
            {clinic.latitude && clinic.longitude && (
              <View style={styles.mapContainer}>
                <SafeMapView
                  initialRegion={{
                    latitude: clinic.latitude,
                    longitude: clinic.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  markers={[{
                    id: clinic.id,
                    latitude: clinic.latitude,
                    longitude: clinic.longitude,
                    title: clinic.name,
                  }]}
                  style={styles.map}
                />
              </View>
            )}
          </Card>
        )}

        {/* Gallery */}
        {clinic.photos?.length > 0 && (
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
              {clinic.photos.map((photo: any) => (
                <View key={photo.id} style={styles.galleryImageWrap}>
                  <Image source={{ uri: photo.url }} style={{ width: 120, height: 120, borderRadius: 12 }} />
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Doctors in Clinic */}
        {clinic.doctors?.length > 0 && (
          <View style={styles.doctorsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.h3, { color: colors.textPrimary }]}>{t('common.doctors', 'Medical Team')}</Text>
            </View>
            
            {clinic.specialties?.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesFilterScroll} contentContainerStyle={styles.specialtiesFilterContainer}>
                <TouchableOpacity
                  style={[styles.filterChip, !selectedSpecialtyId && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => setSelectedSpecialtyId(null)}
                >
                  <Text style={[styles.filterChipText, !selectedSpecialtyId && { color: colors.white }]}>{t('common.all', 'All')}</Text>
                </TouchableOpacity>
                {clinic.specialties.map((spec: any) => {
                  const specName = i18n.language === 'ar' && spec.nameAr ? spec.nameAr : 
                                  i18n.language === 'fr' && spec.nameFr ? spec.nameFr : 
                                  spec.name;
                  const isSelected = selectedSpecialtyId === spec.id;
                  return (
                    <TouchableOpacity
                      key={spec.id}
                      style={[styles.filterChip, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                      onPress={() => setSelectedSpecialtyId(spec.id)}
                    >
                      <Text style={[styles.filterChipText, isSelected && { color: colors.white }]}>{specName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <Card style={styles.infoCard}>
              <View style={styles.doctorsList}>
                {clinic.doctors
                  .filter((doctor: any) => !selectedSpecialtyId || doctor.specialtyId === selectedSpecialtyId)
                  .map((doctor: any) => {
                    const specName = i18n.language === 'ar' && doctor.specialty?.nameAr ? doctor.specialty.nameAr : 
                                    i18n.language === 'fr' && doctor.specialty?.nameFr ? doctor.specialty.nameFr : 
                                    doctor.specialty?.name || '';
                    return (
                      <TouchableOpacity
                        key={doctor.id}
                        style={styles.doctorItem}
                        onPress={() => navigation.navigate('DoctorProfile', { doctorId: doctor.id })}
                      >
                        <View style={styles.doctorAvatar}>
                          <Text style={styles.doctorAvatarText}>{(doctor.fullName || '?').charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.doctorName}>{doctor.fullName}</Text>
                          <Text style={styles.doctorSpec}>{specName}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                      </TouchableOpacity>
                    );
                  })}
                {clinic.doctors.filter((doctor: any) => !selectedSpecialtyId || doctor.specialtyId === selectedSpecialtyId).length === 0 && (
                  <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginVertical: Spacing.md }]}>
                    No doctors available for this specialty.
                  </Text>
                )}
              </View>
            </Card>
          </View>
        )}

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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  clinicImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: Spacing.lg,
  },
  heroInfo: {
    flex: 1,
  },
  name: { ...Typography.h2, color: colors.textPrimary },
  specialty: { ...Typography.body, color: colors.textSecondary, marginTop: 2 },
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
  infoValue: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
  },
  mapContainer: {
    height: 160,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  map: { flex: 1 },
  galleryScroll: {
    marginTop: 12,
  },
  galleryImageWrap: {
    marginRight: 12,
  },
  doctorsList: {
    marginTop: Spacing.md,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tintAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doctorAvatarText: {
    ...Typography.bodyBold,
    color: colors.accent,
  },
  doctorName: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
  },
  doctorSpec: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  doctorsSection: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  specialtiesFilterScroll: {
    marginBottom: Spacing.md,
  },
  specialtiesFilterContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipText: {
    ...Typography.bodyBold,
    color: colors.textSecondary,
  },
});
