import api from './api';

export const notificationService = {
  async getNotifications(page?: number) {
    const res = await api.get('/notifications', { params: { page } });
    return res.data;
  },

  async markAsRead(id: string) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },

  async saveFCMToken(token: string) {
    const res = await api.post('/notifications/fcm-token', {
      token,
      platform: 'android',
    });
    return res.data;
  },
};
