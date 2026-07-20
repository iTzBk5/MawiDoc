import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { Typography } from '../../../shared/theme/typography';
import { useTranslation } from 'react-i18next';
import { ClinicHomeStackParamList } from '../../../navigation/types';
import { clinicApi } from '../../../shared/api/clinic.api';
import { Header } from '../../../shared/components/Header';

type Props = {
  navigation: NativeStackNavigationProp<ClinicHomeStackParamList, 'ClinicTeam'>;
};

export function ClinicTeamScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  
  const getSpecialtyName = (s: any) => {
    if (!s) return '';
    if (i18n.language === 'ar' && s.nameAr) return s.nameAr;
    if (i18n.language === 'fr' && s.nameFr) return s.nameFr;
    return s.name || '';
  };
  
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchTeam = async () => {
    try {
      const res = await clinicApi.getProfile();
      setTeam(res.data?.data?.doctors || res.data?.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await clinicApi.searchDoctors(searchQuery);
      setSearchResults(res.data?.data || res.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to search doctors');
    }
  };

  const handleAddDoctor = async (doctorId: string) => {
    try {
      await clinicApi.addDoctor(doctorId);
      Alert.alert('Success', 'Doctor added to your clinic');
      setSearchModalVisible(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchTeam();
    } catch (err) {
      Alert.alert('Error', 'Failed to add doctor');
    }
  };

  const handleRemoveDoctor = (doctorId: string) => {
    Alert.alert('Remove Doctor', 'Are you sure you want to remove this doctor from your clinic?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await clinicApi.removeDoctor(doctorId);
            fetchTeam();
          } catch (err) {
            Alert.alert('Error', 'Failed to remove doctor');
          }
        }
      }
    ]);
  };

  const renderDoctor = ({ item }: { item: any }) => (
    <View style={[styles.doctorCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name="person" size={24} color={colors.primary} />
      </View>
      <View style={styles.doctorInfo}>
        <Text style={[Typography.h3, { color: colors.textPrimary }]}>{item.fullName}</Text>
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>{getSpecialtyName(item.specialty)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveDoctor(item.id)} style={styles.iconButton}>
        <Ionicons name="trash-outline" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title={t('clinic.medicalTeam', 'Medical Team')}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={() => setSearchModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add" size={28} color={colors.white} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={team}
        renderItem={renderDoctor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textLight} />
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: 16 }]}>
                {t('clinic.noDoctors', 'No doctors in your team yet.')}
              </Text>
            </View>
          ) : null
        }
      />

      <Modal visible={searchModalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <Header 
              title={t('clinic.addDoctor', 'Add Doctor')} 
              onBack={() => setSearchModalVisible(false)} 
            />
            
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.borderLight }]}
                placeholder={t('clinic.searchDoctorsPlaceholder', 'Search by name or email...')}
                placeholderTextColor={colors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={handleSearch} style={[styles.searchButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="search" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.doctorCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <View style={styles.doctorInfo}>
                    <Text style={[Typography.h3, { color: colors.textPrimary }]}>{item.fullName}</Text>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>{getSpecialtyName(item.specialty)}</Text>
                    <Text style={[Typography.caption, { color: colors.textLight }]}>{item.user?.email}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleAddDoctor(item.id)}
                    style={[styles.addBtn, { backgroundColor: colors.primary + '20' }]}
                  >
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('clinic.add', 'Add')}</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 16 },
  addButton: { padding: 4 },
  listContent: { padding: 16, gap: 12 },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  doctorInfo: { flex: 1 },
  iconButton: { padding: 8 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
