import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { SafeMapView } from '../../../shared/components/SafeMapView';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { patientService } from '../../../services/patient.service';
import { doctorService } from '../../../services/doctor.service';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function EditProfileScreen({ navigation, route }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const { isDoctor, isClinic } = useAuth();
  const existingProfile = route?.params?.profile;
  const [form, setForm] = useState({
    fullName: existingProfile?.fullName || '',
    username: existingProfile?.username || '',
    age: String(existingProfile?.age || ''),
    gender: existingProfile?.gender || 'MALE',
    city: existingProfile?.city || '',
    clinicName: existingProfile?.name || existingProfile?.clinicName || '', // name comes from Clinic Profile
    address: existingProfile?.address || '',
    description: existingProfile?.description || '',
    consultationPrice: String(existingProfile?.consultationPrice || ''),
    latitude: existingProfile?.latitude || 36.7538,
    longitude: existingProfile?.longitude || 3.0588,
  });
  const [loading, setLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(!!(existingProfile?.latitude && existingProfile?.longitude));

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    update('latitude', latitude);
    update('longitude', longitude);
    setHasLocation(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isDoctor) {
        await doctorService.updateProfile({
          fullName: form.fullName,
          clinicName: form.clinicName,
          address: form.address,
          description: form.description,
          consultationPrice: parseFloat(form.consultationPrice) || 0,
        });
      } else if (isClinic) {
        // Clinic edit
        const { clinicApi } = require('../../../shared/api/clinic.api');
        await clinicApi.updateProfile({
          name: form.clinicName, // reusing this field for Clinic name
          address: form.address,
          description: form.description,
          latitude: hasLocation ? form.latitude : undefined,
          longitude: hasLocation ? form.longitude : undefined,
        });
      } else {
        await patientService.updateProfile({
          fullName: form.fullName,
          age: parseInt(form.age, 10) || undefined,
          gender: form.gender as 'MALE' | 'FEMALE',
          city: form.city,
        });
      }
      Alert.alert(t('common.ok'), t('profile.profileUpdated', 'Profile updated'));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.response?.data?.error?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={t('profile.editProfile', 'Edit Profile')} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Input
            label={isClinic ? t('auth.clinicName', 'Clinic Name') : t('auth.fullName', 'Full Name')}
            value={isClinic ? form.clinicName : form.fullName}
            onChangeText={(v) => isClinic ? update('clinicName', v) : update('fullName', v)}
            leftIcon={<Ionicons name={isClinic ? "business-outline" : "person-outline"} size={20} color={colors.textSecondary} />}
          />
          {!isDoctor && !isClinic && (
            <>
              <Input label={t('common.age', 'Age')} value={form.age} onChangeText={(v) => update('age', v)} keyboardType="numeric" />

              <Text style={styles.label}>{t('common.gender', 'Gender')}</Text>
              <View style={styles.segmented}>
                <TouchableOpacity
                  style={[styles.segment, form.gender === 'MALE' && styles.segmentActive]}
                  onPress={() => update('gender', 'MALE')}
                  activeOpacity={0.8}>
                  <Ionicons name="male" size={18} color={form.gender === 'MALE' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.segmentText, form.gender === 'MALE' && styles.segmentTextActive]}>{t('auth.male', 'Male')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, form.gender === 'FEMALE' && styles.segmentActive]}
                  onPress={() => update('gender', 'FEMALE')}
                  activeOpacity={0.8}>
                  <Ionicons name="female" size={18} color={form.gender === 'FEMALE' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.segmentText, form.gender === 'FEMALE' && styles.segmentTextActive]}>{t('auth.female', 'Female')}</Text>
                </TouchableOpacity>
              </View>

              <Input
                label={t('auth.city', 'City')}
                value={form.city}
                onChangeText={(v) => update('city', v)}
                leftIcon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />}
              />
            </>
          )}
          {isDoctor && (
            <>
              <Input
                label={t('auth.clinicName', 'Clinic Name')}
                value={form.clinicName}
                onChangeText={(v) => update('clinicName', v)}
                leftIcon={<Ionicons name="business-outline" size={20} color={colors.textSecondary} />}
              />
              <Input
                label={t('auth.address', 'Address')}
                value={form.address}
                onChangeText={(v) => update('address', v)}
                leftIcon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />}
              />
              <Input label={t('common.description', 'Description')} value={form.description} onChangeText={(v) => update('description', v)} multiline numberOfLines={3} />
              <Input
                label={t('auth.consultationPrice', 'Consultation Price (DZD)')}
                value={form.consultationPrice}
                onChangeText={(v) => update('consultationPrice', v)}
                keyboardType="numeric"
                leftIcon={<Ionicons name="cash-outline" size={20} color={colors.textSecondary} />}
              />
              
              <TouchableOpacity 
                style={styles.galleryManageBtn}
                onPress={() => navigation.navigate('GalleryManager')}
              >
                <Ionicons name="images-outline" size={20} color={colors.primary} />
                <Text style={styles.galleryManageText}>{t('profile.manageGallery', 'Manage Gallery')}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </>
          )}
          {isClinic && (
            <>
              <Input
                label={t('auth.address', 'Address')}
                value={form.address}
                onChangeText={(v) => update('address', v)}
                leftIcon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />}
              />
              <Input label={t('common.description', 'Description')} value={form.description} onChangeText={(v) => update('description', v)} multiline numberOfLines={3} />
              
              <View style={styles.mapLabelRow}>
                <View style={[styles.mapIconWrap, { backgroundColor: colors.tintAccent }]}>
                  <Ionicons name="location" size={18} color={colors.accent} />
                </View>
                <View>
                  <Text style={styles.mapLabel}>{t('map.locationOnMap', 'Location on Map')}</Text>
                  <Text style={styles.mapHint}>{t('map.tapMapHint', 'Tap the map to set your clinic location')}</Text>
                </View>
              </View>
              <View style={styles.mapContainer}>
                <SafeMapView 
                  style={styles.map}
                  initialRegion={{ 
                    latitude: form.latitude, 
                    longitude: form.longitude, 
                    latitudeDelta: 0.1, 
                    longitudeDelta: 0.1 
                  }}
                  onPress={handleMapPress}
                  onLongPress={handleMapPress}
                  markers={hasLocation ? [{
                    id: 'clinic-location',
                    latitude: form.latitude,
                    longitude: form.longitude,
                    title: form.clinicName || 'Clinic Location',
                  }] : []}
                />
              </View>
              {hasLocation && (
                <View style={styles.coordRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accepted} />
                  <Text style={styles.coordText}>
                    {t('map.locationSet', 'Location set')} ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})
                  </Text>
                </View>
              )}
            </>
          )}
          <Button title={t('common.save', 'Save')} onPress={handleSave} loading={loading} style={styles.saveBtn} />
        </Card>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  formCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  label: {
    ...Typography.label,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 12,
    borderRadius: BorderRadius.md - 4,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...Shadows.sm,
  },
  segmentText: {
    ...Typography.label,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: Spacing.md,
  },
  galleryManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  galleryManageText: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  mapLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  mapIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  mapLabel: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
  },
  mapHint: {
    ...Typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mapContainer: {
    height: 250,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.md,
  },
  map: { flex: 1 },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    backgroundColor: colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  coordText: {
    ...Typography.caption,
    color: colors.accepted,
  },
});
