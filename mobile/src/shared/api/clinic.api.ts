import api from '../../services/api';

export const clinicApi = {
  getProfile: () => api.get('/clinic/profile'),
  updateProfile: (data: any) => api.put('/clinic/profile', data),
  
  getStatistics: () => api.get('/clinic/statistics'),
  updateStatus: (isOpen: boolean) => api.put('/clinic/status', { isOpen }),
  getAppointments: (params?: { date?: string }) => api.get('/clinic/appointments', { params }),
  getSpecialtiesList: () => api.get('/clinic/specialties-list'),
  updateSpecialties: (specialtyIds: string[]) => api.post('/clinic/specialties/update', { specialtyIds }),
  
  // Specialties
  addSpecialty: (specialtyId: string) => api.post('/clinic/specialties', { specialtyId }),
  removeSpecialty: (specialtyId: string) => api.delete(`/clinic/specialties/${specialtyId}`),
  
  // Team
  searchDoctors: (q: string) => api.get('/clinic/doctors/search', { params: { q } }),
  addDoctor: (doctorId: string) => api.post('/clinic/doctors', { doctorId }),
  removeDoctor: (doctorId: string) => api.delete(`/clinic/doctors/${doctorId}`),
  
  // Gallery
  addGalleryPhoto: (photoInfo: { uri: string; type: string; name: string } | string) => {
    if (typeof photoInfo === 'string') {
      return api.post('/clinic/gallery', { url: photoInfo });
    }
    const formData = new FormData();
    formData.append('photo', {
      uri: photoInfo.uri,
      type: photoInfo.type || 'image/jpeg',
      name: photoInfo.name || 'upload.jpg',
    } as any);
    return api.post('/clinic/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeGalleryPhoto: (photoId: string) => api.delete(`/clinic/gallery/${photoId}`),
};
