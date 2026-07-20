import api from './api';

export const searchService = {
  async searchDoctors(params: { name?: string; specialty?: string; specialtyId?: string; city?: string; page?: number; limit?: number }) {
    const res = await api.get('/search/doctors', { params });
    return res.data;
  },

  async searchClinics(params: { name?: string; specialty?: string; specialtyId?: string; city?: string; page?: number; limit?: number }) {
    const res = await api.get('/search/clinics', { params });
    return res.data;
  },

  async getNearbyDoctors(lat: number, lng: number, radius?: number) {
    const res = await api.get('/search/doctors/nearby', {
      params: { lat, lng, radius: radius || 10 },
    });
    return res.data.data;
  },

  async getSpecialties() {
    const res = await api.get('/search/specialties');
    return res.data.data;
  },

  async getDoctorById(id: string) {
    const res = await api.get(`/doctor/public/${id}`);
    return res.data.data;
  },

  async getDoctorSlots(doctorId: string, date?: string) {
    const params = date ? { date } : {};
    const res = await api.get(`/doctor/public/${doctorId}/slots`, { params });
    return res.data.data;
  }
};
