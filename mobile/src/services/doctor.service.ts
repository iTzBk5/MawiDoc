import api from './api';

export const doctorService = {
  async getProfile() {
    const res = await api.get('/doctor/profile');
    return res.data.data;
  },

  async updateProfile(data: Record<string, unknown>) {
    const res = await api.put('/doctor/profile', data);
    return res.data.data;
  },

  async updateLocation(latitude: number, longitude: number) {
    const res = await api.put('/doctor/location', { latitude, longitude });
    return res.data.data;
  },

  async updateStatus(isOpen: boolean) {
    const res = await api.put('/doctor/status', { isOpen });
    return res.data.data;
  },

  async getWorkingDays() {
    const res = await api.get('/doctor/working-days');
    return res.data.data;
  },

  async updateWorkingDays(days: { dayOfWeek: number; isActive: boolean; startTime: string; endTime: string }[]) {
    const res = await api.put('/doctor/working-days', { days });
    return res.data.data;
  },

  async getStatistics() {
    const res = await api.get('/doctor/statistics');
    return res.data.data;
  },

  async getAppointments(params?: Record<string, string>) {
    const res = await api.get('/appointments/doctor', { params });
    return res.data;
  },

  async acceptAppointment(id: string) {
    const res = await api.put(`/appointments/doctor/${id}/accept`);
    return res.data.data;
  },

  async rejectAppointment(id: string) {
    const res = await api.put(`/appointments/doctor/${id}/reject`);
    return res.data.data;
  },

  async cancelAppointment(id: string) {
    const res = await api.put(`/appointments/doctor/${id}/cancel`);
    return res.data.data;
  },

  async createAppointment(data: Record<string, unknown>) {
    const res = await api.post('/appointments/doctor', data);
    return res.data.data;
  },

  async getSlots(date: string) {
    const res = await api.get('/doctor/slots', { params: { date } });
    return res.data.data;
  },

  async addGalleryPhoto(photoInfo: { uri: string; type: string; name: string } | string) {
    if (typeof photoInfo === 'string') {
      const res = await api.post('/doctor/gallery', { url: photoInfo });
      return res.data.data;
    }
    const formData = new FormData();
    formData.append('photo', {
      uri: photoInfo.uri,
      type: photoInfo.type || 'image/jpeg',
      name: photoInfo.name || 'upload.jpg',
    } as any);
    const res = await api.post('/doctor/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async removeGalleryPhoto(photoId: string) {
    const res = await api.delete(`/doctor/gallery/${photoId}`);
    return res.data.data;
  },
};
