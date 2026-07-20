import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { Typography } from '../../../shared/theme/typography';
import { useTranslation } from 'react-i18next';
import { Header } from '../../../shared/components/Header';
import { ClinicHomeStackParamList, DoctorHomeStackParamList } from '../../../navigation/types';
import { clinicApi } from '../../../shared/api/clinic.api';
import { doctorService } from '../../../services/doctor.service';
import { useAuthStore } from '../../../store/auth.store';

type Props = {
  navigation: any;
};

export function GalleryManagerScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    try {
      if (isDoctor) {
        const profile = await doctorService.getProfile();
        setPhotos(profile?.photos || []);
      } else {
        const res = await clinicApi.getProfile();
        setPhotos(res.data?.data?.photos || res.data?.photos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleAddPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.uri) return;

      const photoInfo = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `upload_${Date.now()}.jpg`,
      };

      setLoading(true);
      if (isDoctor) {
        await doctorService.addGalleryPhoto(photoInfo);
      } else {
        await clinicApi.addGalleryPhoto(photoInfo);
      }
      fetchPhotos();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to upload photo');
      setLoading(false);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    Alert.alert(t('clinic.deletePhoto', 'Delete Photo'), t('clinic.deletePhotoConfirm', 'Are you sure you want to delete this photo?'), [
      { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      {
        text: t('common.delete', 'Delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            if (isDoctor) {
              await doctorService.removeGalleryPhoto(photoId);
            } else {
              await clinicApi.removeGalleryPhoto(photoId);
            }
            fetchPhotos();
          } catch (err) {
            Alert.alert('Error', 'Failed to remove photo');
          }
        }
      }
    ]);
  };

  const renderPhoto = ({ item }: { item: any }) => (
    <View style={[styles.photoCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <Image source={{ uri: item.url }} style={styles.image} />
      <TouchableOpacity 
        style={[styles.deleteButton, { backgroundColor: colors.error }]} 
        onPress={() => handleRemovePhoto(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('clinic.gallery', 'Gallery')}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={handleAddPhoto} style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color={colors.textLight} />
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: 16, marginBottom: 24 }]}>
                {t('clinic.noPhotos', 'No photos added yet.')}
              </Text>
              <TouchableOpacity 
                style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
                onPress={handleAddPhoto}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
                <Text style={{ color: colors.white, ...Typography.bodyBold, marginLeft: 8 }}>{t('clinic.uploadPhoto', 'Upload Photo')}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
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
  listContent: { padding: 16 },
  row: { gap: 16, marginBottom: 16 },
  photoCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
