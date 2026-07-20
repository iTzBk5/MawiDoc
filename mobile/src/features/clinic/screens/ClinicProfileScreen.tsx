import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { clinicApi } from '../../../shared/api/clinic.api';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

export function ClinicProfileScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t, i18n } = useTranslation();
  
  const getSpecialtyName = (s: any) => {
    if (i18n.language === 'ar' && s.nameAr) return s.nameAr;
    if (i18n.language === 'fr' && s.nameFr) return s.nameFr;
    return s.name;
  };
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Specialties Modal
  const [specialtiesModalVisible, setSpecialtiesModalVisible] = useState(false);
  const [allSpecialties, setAllSpecialties] = useState<any[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [savingSpecialties, setSavingSpecialties] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const [profileRes, specRes] = await Promise.all([
        clinicApi.getProfile(),
        clinicApi.getSpecialtiesList()
      ]);
      const p = profileRes.data?.data || profileRes.data;
      setProfile(p);
      setSelectedSpecialties(p?.specialties?.map((s: any) => s.id) || []);
      setAllSpecialties(specRes.data?.data || specRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSpecialties = async () => {
    setSavingSpecialties(true);
    try {
      await clinicApi.updateSpecialties(selectedSpecialties);
      Alert.alert(t('common.success', 'Success'), t('common.saved', 'Specialties updated successfully'));
      setSpecialtiesModalVisible(false);
      loadProfile();
    } catch (err) {
      Alert.alert(t('common.error', 'Error'), t('common.error', 'Failed to update specialties'));
    } finally {
      setSavingSpecialties(false);
    }
  };

  const toggleSpecialty = (id: string) => {
    if (selectedSpecialties.includes(id)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== id));
    } else {
      setSelectedSpecialties([...selectedSpecialties, id]);
    }
  };

  if (loading || !profile) return <><Header title={t('common.profile', 'Profile')} /><Loading /></>;

  const menuItems = [
    { 
      title: t('profile.editPersonalInfo', 'Edit Clinic Info'), 
      icon: 'create-outline' as const, 
      color: colors.primary, 
      bg: colors.tintPrimary, 
      onPress: () => navigation.navigate('EditProfile', { profile }) 
    },
    { 
      title: t('clinic.medicalTeam', 'Manage Medical Team'), 
      icon: 'people-outline' as const, 
      color: colors.warning, 
      bg: colors.warningLight, 
      onPress: () => navigation.navigate('HomeTab', { screen: 'ClinicTeam' }) 
    },
  ];

  return (
    <View style={styles.container}>
      <Header title={t('common.profile', 'Profile')} />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <LinearGradient colors={colors.gradientHero} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>
                {(profile.name || '?').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.detail}>{profile.address || t('common.noData', 'No address')}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.detail} numberOfLines={1}>{profile.description || t('common.noData', 'No description')}</Text>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Menu Items */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={item.title}>
              <Card onPress={item.onPress} style={styles.menuItem}>
                <View style={styles.menuRow}>
                  <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                </View>
              </Card>
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* Specialties Section */}
        <View style={styles.sectionHeader}>
          <Text style={[Typography.h3, { color: colors.textPrimary }]}>{t('doctor.specialties', 'Clinic Specialties')}</Text>
          <TouchableOpacity onPress={() => setSpecialtiesModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {profile.specialties?.length > 0 ? (
          <View style={styles.specialtiesWrapper}>
            {profile.specialties.map((spec: any) => (
              <View key={spec.id} style={[styles.specialtyChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                {spec.icon && <Text style={{ marginRight: 8 }}>{spec.icon}</Text>}
                <Text style={[Typography.caption, { color: colors.textPrimary }]}>{getSpecialtyName(spec)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: Spacing.xl }]}>
            {t('common.noData', 'No specialties added yet.')}
          </Text>
        )}
      </ScrollView>

      {/* Specialties Picker Modal */}
      <Modal visible={specialtiesModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <Header 
            title={t('doctor.specialties', 'Select Specialties')} 
            onBack={() => setSpecialtiesModalVisible(false)} 
            rightElement={
              <TouchableOpacity onPress={handleSaveSpecialties} disabled={savingSpecialties}>
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>{t('common.save', 'Save')}</Text>
              </TouchableOpacity>
            }
          />
          
          <FlatList
            data={allSpecialties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedSpecialties.includes(item.id);
              return (
                <TouchableOpacity 
                  style={[
                    styles.specialtyItem, 
                    { backgroundColor: colors.surface, borderColor: colors.borderLight },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.tintPrimary }
                  ]}
                  onPress={() => toggleSpecialty(item.id)}
                >
                  <Text style={[Typography.bodyBold, { color: isSelected ? colors.primary : colors.textPrimary }]}>
                    {getSpecialtyName(item)}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          />
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  profileCard: {
    padding: Spacing.xl,
  },
  profileRow: {
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
  profileInfo: {
    flex: 1,
  },
  name: { ...Typography.h2, color: colors.primary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  detail: { ...Typography.caption, color: colors.textSecondary },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
    marginTop: Spacing.xl,
  },
  menuItem: {
    marginBottom: 0,
    borderWidth: 0,
    borderRadius: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuTitle: {
    ...Typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  specialtyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  addButton: {
    padding: 4,
  },
  specialtiesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  }
});
