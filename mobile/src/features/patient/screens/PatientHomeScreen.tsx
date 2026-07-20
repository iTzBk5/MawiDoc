import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PatientHomeStackParamList } from '../../../navigation/types';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../../shared/theme/colors';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { searchService } from '../../../services/search.service';
import { useNotificationStore } from '../../../store/notification.store';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';

type Props = { navigation: NativeStackNavigationProp<PatientHomeStackParamList, 'PatientHome'> };

const SPECIALTY_ICONS: Record<string, string> = {
  'Cardiology': '❤️', 'Dermatology': '🧴', 'Pediatrics': '👶',
  'Ophthalmology': '👁️', 'Dentistry': '🦷', 'Neurology': '🧠',
  'Orthopedics': '🦴', 'General': '🩺', 'Gynecology': '🤰',
};

export function PatientHomeScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { unreadCount } = useNotificationStore();
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);
  const [featuredClinics, setFeaturedClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);

  useEffect(() => { loadHomeData(); }, []);

  const loadHomeData = async () => {
    try {
      const specs = await searchService.getSpecialties().catch(() => []);
      const docsRes = await searchService.searchDoctors({ limit: 10 }).catch(() => ({ data: [] }));
      const clinicsRes = await searchService.searchClinics({ limit: 10 }).catch(() => ({ data: [] }));

      setSpecialties(specs);
      setFeaturedDoctors(docsRes.data || []);
      setFeaturedClinics(clinicsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadHomeData(); };

  const getSpecialtyName = (s: any) => {
    if (!s) return '';
    if (i18n.language === 'ar' && s.nameAr) return s.nameAr;
    if (i18n.language === 'fr' && s.nameFr) return s.nameFr;
    return s.name || '';
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <LinearGradient colors={colors.gradientHero} style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.greeting}>{t('auth.roleSelection').replace(' MawiDOC', '')}</Text>
          <Text style={styles.brandName}>MawiDOC</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications' as any)}
          style={styles.bellBtn}
          activeOpacity={0.75}>
          <Ionicons name="notifications-outline" size={20} color={colors.textOnPrimary} />
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.body}>
        <FlatList
          data={specialties}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Search Bar */}
              <TouchableOpacity
                style={styles.searchBar}
                onPress={() => navigation.navigate('Search')}
                activeOpacity={0.8}>
                <View style={styles.searchIconWrap}>
                  <Ionicons name="search" size={18} color={colors.accent} />
                </View>
                <Text style={styles.searchPlaceholder}>{t('patient.searchPlaceholder')}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>

              {/* Map Button */}
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => navigation.navigate('Map')}
                activeOpacity={0.85}>
                <LinearGradient
                  colors={colors.gradientAccent}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.mapGradient}>
                  <Ionicons name="location" size={20} color={colors.textOnAccent} />
                  <Text style={styles.mapButtonText}>{t('patient.nearbyDoctors')}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textOnAccent} style={{ opacity: 0.7 }} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Clinics Slider */}
              {featuredClinics.length > 0 && (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderTitle}>{t('clinic.clinicList', 'Clinics')}</Text>
                  <FlatList
                    horizontal
                    data={featuredClinics}
                    keyExtractor={(item) => `clinic-${item.id}`}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sliderList}
                    renderItem={({ item }) => (
                      <ClinicSlideCard 
                        item={item} 
                        colors={colors} 
                        styles={styles} 
                        navigation={navigation}
                        t={t}
                      />
                    )}
                  />
                </View>
              )}

              {/* Doctors Slider */}
              {featuredDoctors.length > 0 && (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderTitle}>{t('common.doctors', 'Doctors')}</Text>
                  <FlatList
                    horizontal
                    data={featuredDoctors}
                    keyExtractor={(item) => `doctor-${item.id}`}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sliderList}
                    renderItem={({ item }) => (
                      <DoctorSlideCard 
                        item={item} 
                        colors={colors} 
                        styles={styles} 
                        navigation={navigation}
                        getSpecialtyName={getSpecialtyName}
                      />
                    )}
                  />
                </View>
              )}

              {/* Specialties Title */}
              <Text style={styles.sectionTitle}>{t('patient.allSpecialties')}</Text>
            </>
          }
          renderItem={({ item }) => {
            const localizedName = i18n.language === 'ar' && item.nameAr ? item.nameAr : 
                                  i18n.language === 'fr' && item.nameFr ? item.nameFr : item.name;
            return (
              <Card
                onPress={() => navigation.navigate('Search', { specialtyId: item.id, specialtyName: localizedName })}
                style={styles.specialtyCard}>
                <View style={styles.specialtyRow}>
                  <View style={styles.specialtyIconWrap}>
                    <Text style={styles.specialtyIcon}>
                      {SPECIALTY_ICONS[item.name] || '🏥'}
                    </Text>
                  </View>
                  <View style={styles.specialtyInfo}>
                    <Text style={styles.name}>{localizedName}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={<EmptyState message={t('common.noData')} icon="🏥" />}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

function ClinicSlideCard({ item, colors, styles, navigation, t }: any) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = item.photos?.[0]?.url || item.profilePicture || null;
  const showImage = imageUrl && !imageError;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ClinicProfile', { clinicId: item.id })}
      activeOpacity={0.9}
      style={styles.slideCard}>
      {showImage ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.slideCardImage} 
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.slideCardImagePlaceholder, { backgroundColor: colors.tintPrimary }]}>
          <Ionicons name="business-outline" size={32} color={colors.primary} />
        </View>
      )}
      <View style={styles.slideCardInfo}>
        <Text style={styles.slideCardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.slideCardSub} numberOfLines={1}>
          {item.isOpen ? t('common.open', 'Open') : t('common.closed', 'Closed')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function DoctorSlideCard({ item, colors, styles, navigation, getSpecialtyName }: any) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = item.photos?.[0]?.url || null;
  const showImage = imageUrl && !imageError;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}
      activeOpacity={0.9}
      style={styles.slideCard}>
      {showImage ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.slideCardImage} 
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.slideCardImagePlaceholder, { backgroundColor: colors.tintAccent }]}>
          <Ionicons name="person-outline" size={32} color={colors.accent} />
        </View>
      )}
      <View style={styles.slideCardInfo}>
        <Text style={styles.slideCardName} numberOfLines={1}>{item.fullName}</Text>
        <Text style={styles.slideCardSub} numberOfLines={1}>{getSpecialtyName(item.specialty)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...Shadows.xl,
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
  },
  bellBtn: {
    position: 'absolute',
    top: Spacing.xxxl,
    right: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.overlayWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    ...Typography.body,
    color: colors.accentLight,
    marginBottom: Spacing.xs,
  },
  brandName: {
    ...Typography.titleLarge,
    color: colors.textOnPrimary,
    letterSpacing: -1,
  },
  brandAr: {
    ...Typography.body,
    color: colors.overlayWhite,
    marginTop: Spacing.xs,
    fontSize: 18,
  },
  body: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  searchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tintAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  searchPlaceholder: { ...Typography.body, color: colors.textLight, flex: 1 },
  mapButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.accentGlow,
  },
  mapGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  mapButtonText: { ...Typography.bodyBold, color: colors.textOnAccent, flex: 1 },
  sectionTitle: {
    ...Typography.overline,
    color: colors.textSecondary,
    marginBottom: Spacing.md,
  },
  specialtyCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialtyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tintAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  specialtyIcon: {
    fontSize: 22,
  },
  specialtyInfo: {
    flex: 1,
  },
  name: { ...Typography.bodyBold, color: colors.textPrimary },
  nameAr: { ...Typography.caption, color: colors.textSecondary, marginTop: 2 },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  sliderContainer: {
    marginBottom: Spacing.xl,
  },
  sliderTitle: {
    ...Typography.overline,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  sliderList: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
    paddingVertical: 4, // allow shadow to render
  },
  slideCard: {
    width: 140,
    height: 180,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  slideCardImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  slideCardImagePlaceholder: {
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideCardInfo: {
    padding: Spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  slideCardName: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  slideCardSub: {
    ...Typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
