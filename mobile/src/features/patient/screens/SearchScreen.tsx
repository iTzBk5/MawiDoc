import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PatientHomeStackParamList } from '../../../navigation/types';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { searchService } from '../../../services/search.service';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation: NativeStackNavigationProp<PatientHomeStackParamList, 'Search'>;
  route: RouteProp<PatientHomeStackParamList, 'Search'>;
};

export function SearchScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t, i18n } = useTranslation();
  const specialtyId = route.params?.specialtyId;
  const specialtyName = route.params?.specialtyName;

  const [activeTab, setActiveTab] = useState<'doctors' | 'clinics'>('doctors');
  const [query, setQuery] = useState('');
  const [doctorResults, setDoctorResults] = useState<any[]>([]);
  const [clinicResults, setClinicResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const initialSearchDone = useRef(false);

  useEffect(() => {
    if (specialtyId && !initialSearchDone.current) {
      initialSearchDone.current = true;
      doSearch('', specialtyId);
    }
  }, [specialtyId]);

  const doSearch = async (name: string, specId?: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const params: { name?: string; specialtyId?: string } = {};
      if (name.trim()) params.name = name;
      if (specId) params.specialtyId = specId;

      if (activeTab === 'doctors') {
        const data = await searchService.searchDoctors(params);
        setDoctorResults(data.data || []);
      } else {
        const data = await searchService.searchClinics(params);
        setClinicResults(data.data || []);
      }
    } catch {
      if (activeTab === 'doctors') setDoctorResults([]);
      else setClinicResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searched) {
      doSearch(query, specialtyId);
    }
  }, [activeTab]); // re-search when tab switches if they have searched before

  const renderTab = (id: 'doctors' | 'clinics', label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === id && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
      ]}
      onPress={() => setActiveTab(id)}
    >
      <Ionicons name={icon} size={20} color={activeTab === id ? colors.primary : colors.textLight} />
      <Text style={[styles.tabText, { color: activeTab === id ? colors.primary : colors.textLight }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title={specialtyName ? `${t('common.search')} ${specialtyName}` : t('patient.searchDoctors')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <Ionicons name="search" size={18} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('patient.searchPlaceholder')}
              placeholderTextColor={colors.textLight}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => doSearch(query, specialtyId)}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => doSearch(query, specialtyId)} activeOpacity={0.85}>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabsRow}>
          {renderTab('doctors', 'Doctors', 'people-outline')}
          {renderTab('clinics', 'Clinics', 'business-outline')}
        </View>

        {loading ? <Loading fullScreen={false} /> : (
          <FlatList
            data={activeTab === 'doctors' ? doctorResults : clinicResults}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              if (activeTab === 'doctors') {
                const specName = i18n.language === 'ar' && item.specialty?.nameAr ? item.specialty.nameAr : 
                                 i18n.language === 'fr' && item.specialty?.nameFr ? item.specialty.nameFr : 
                                 item.specialty?.name || '';
                return (
                  <Card
                    onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}
                    style={styles.doctorCard}>
                    <View style={styles.cardRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {(item.fullName || '?').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.name} numberOfLines={1}>{item.fullName}</Text>
                        <Text style={styles.specialty} numberOfLines={1}>{specName}</Text>
                        <View style={styles.metaRow}>
                          <Text style={styles.price}>{item.consultationPrice} DZD</Text>
                          <View style={[styles.statusDot, { backgroundColor: item.isOpen ? colors.accepted : colors.cancelled }]} />
                          <Text style={[styles.statusText, { color: item.isOpen ? colors.accepted : colors.cancelled }]}>
                            {item.isOpen ? t('common.open', 'Open') : t('common.closed', 'Closed')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </View>
                  </Card>
                );
              } else {
                return (
                  <Card
                    onPress={() => navigation.navigate('ClinicProfile', { clinicId: item.id })}
                    style={styles.doctorCard}>
                    <View style={styles.cardRow}>
                      {item.profilePicture || (item.photos && item.photos[0]?.url) ? (
                        <Image source={{ uri: item.profilePicture || item.photos[0].url }} style={styles.clinicImage} />
                      ) : (
                        <View style={[styles.avatar, { backgroundColor: colors.tintPrimary }]}>
                          <Ionicons name="business-outline" size={24} color={colors.primary} />
                        </View>
                      )}
                      <View style={styles.cardInfo}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.specialty} numberOfLines={1}>{item.address}</Text>
                        <View style={styles.metaRow}>
                          <Text style={[styles.specialty, { color: colors.primary }]}>
                            {item.specialties?.length || 0} {t('doctor.specialties', 'Specialties')}
                          </Text>
                          <View style={[styles.statusDot, { backgroundColor: item.isOpen ? colors.accepted : colors.cancelled }]} />
                          <Text style={[styles.statusText, { color: item.isOpen ? colors.accepted : colors.cancelled }]}>
                            {item.isOpen ? t('common.open', 'Open') : t('common.closed', 'Closed')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </View>
                  </Card>
                );
              }
            }}
            ListEmptyComponent={searched ? <EmptyState message={t('common.noData')} icon="🔍" /> : null}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  searchRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    ...Typography.bodyBold,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    ...Typography.body,
    color: colors.textPrimary,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.accentGlow,
  },
  doctorCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.tintPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.h2,
    color: colors.primary,
  },
  clinicImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  name: { ...Typography.bodyBold, color: colors.textPrimary },
  specialty: { ...Typography.caption, color: colors.textSecondary, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  price: { ...Typography.captionBold, color: colors.accent },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
});
