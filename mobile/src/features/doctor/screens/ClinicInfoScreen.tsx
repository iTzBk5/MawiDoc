import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { SafeMapView } from '../../../shared/components/SafeMapView';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { doctorService } from '../../../services/doctor.service';
import { useTranslation } from 'react-i18next';

export function ClinicInfoScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [form, setForm] = useState({ 
    clinicName: '', 
    address: '', 
    description: '', 
    consultationPrice: '',
    latitude: 36.7538, // default Algiers
    longitude: 3.0588 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await doctorService.getProfile();
      setForm({
        clinicName: data.clinicName || '',
        address: data.address || '',
        description: data.description || '',
        consultationPrice: String(data.consultationPrice || ''),
        latitude: data.latitude || 36.7538,
        longitude: data.longitude || 3.0588,
      });
      if (data.latitude && data.longitude) {
        setHasLocation(true);
      }
    } catch {} finally { setLoading(false); }
  };

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    update('latitude', latitude);
    update('longitude', longitude);
    setHasLocation(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorService.updateProfile({
        clinicName: form.clinicName,
        address: form.address,
        description: form.description,
        consultationPrice: parseFloat(form.consultationPrice) || 0,
      });
      
      if (hasLocation) {
        await doctorService.updateLocation(form.latitude, form.longitude);
      }
      
      Alert.alert(t('common.ok'), t('doctor.clinicInfoUpdated', 'Clinic info updated'));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.response?.data?.error?.message || t('common.error'));
    } finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <Header title={t('doctor.clinicInfo', 'Clinic Info')} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Input label={t('auth.clinicName', 'Clinic Name')} value={form.clinicName} onChangeText={(v) => update('clinicName', v)} leftIcon="🏥" />
          <Input label={t('auth.address', 'Address')} value={form.address} onChangeText={(v) => update('address', v)} leftIcon="📍" />
          <Input label={t('common.description', 'Description')} value={form.description} onChangeText={(v) => update('description', v)} multiline numberOfLines={3} />
          <Input label={t('auth.consultationPrice', 'Consultation Price (DZD)')} value={form.consultationPrice} onChangeText={(v) => update('consultationPrice', v)} keyboardType="numeric" leftIcon="💰" />
        </Card>

        <Card style={styles.mapCard}>
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
                Location set ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})
              </Text>
            </View>
          )}
        </Card>

        <Button title={t('common.save', 'Save')} onPress={handleSave} loading={saving} style={styles.saveBtn} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  formCard: {
    padding: Spacing.xl,
  },
  mapCard: {
    padding: Spacing.lg,
  },
  mapLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  },
  map: { flex: 1 },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    backgroundColor: colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  coordText: {
    ...Typography.caption,
    color: colors.accepted,
  },
  saveBtn: { marginBottom: Spacing.xxxl },
});
