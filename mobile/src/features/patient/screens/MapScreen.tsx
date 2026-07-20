import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PatientHomeStackParamList } from '../../../navigation/types';
import { Header } from '../../../shared/components/Header';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Card } from '../../../shared/components/Card';
import { SafeMapView } from '../../../shared/components/SafeMapView';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { searchService } from '../../../services/search.service';
import { useTranslation } from 'react-i18next';

type Props = { navigation: NativeStackNavigationProp<PatientHomeStackParamList, 'Map'> };

const ALGIERS = { latitude: 36.7538, longitude: 3.0588, latitudeDelta: 0.15, longitudeDelta: 0.15 };

export function MapScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t, i18n } = useTranslation();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try {
      const data = await searchService.getNearbyDoctors(ALGIERS.latitude, ALGIERS.longitude, 20);
      setDoctors(data || []);
    } catch { setDoctors([]); } finally { setLoading(false); }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <Header title={t('patient.nearbyDoctors')} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        {doctors.length === 0 ? (
          <EmptyState message={t('common.noData')} icon="🗺️" />
        ) : (
          <View style={styles.mapContainer}>
            <SafeMapView
              initialRegion={ALGIERS}
              markers={doctors.map((doc) => {
                const specName = i18n.language === 'ar' && doc.specialty?.nameAr ? doc.specialty.nameAr : 
                                 i18n.language === 'fr' && doc.specialty?.nameFr ? doc.specialty.nameFr : 
                                 doc.specialty?.name || '';
                return {
                  id: doc.id,
                  latitude: doc.latitude || ALGIERS.latitude,
                  longitude: doc.longitude || ALGIERS.longitude,
                  title: doc.fullName,
                  description: `${specName} - ${doc.consultationPrice} DZD`,
                  onPress: () => navigation.navigate('DoctorProfile', { doctorId: doc.id }),
                };
              })}
              style={styles.map}
            />
          </View>
        )}
        {doctors.length > 0 && (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="information-circle" size={24} color={colors.accent} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>{t('map.title')}</Text>
                <Text style={styles.infoDesc}>{t('map.interactiveMapDesc', 'Tap on a marker to view the doctor\'s details and book an appointment.')}</Text>
              </View>
            </View>
          </Card>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  infoCard: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.md,
    ...Shadows.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tintAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
  },
  infoDesc: {
    ...Typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
