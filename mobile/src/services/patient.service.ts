import api from './api';

export const patientService = {
  async getProfile() {
    const res = await api.get('/patient/profile');
    return res.data.data;
  },

  async updateProfile(data: Record<string, unknown>) {
    const res = await api.put('/patient/profile', data);
    return res.data.data;
  },

  async getAppointments(params?: Record<string, string>) {
    const res = await api.get('/appointments', { params });
    return res.data;
  },

  async bookAppointment(data: {
    doctorId: string;
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) {
    const res = await api.post('/appointments', data);
    return res.data.data;
  },

  async cancelAppointment(id: string) {
    const res = await api.delete(`/appointments/${id}`);
    return res.data.data;
  },
};
