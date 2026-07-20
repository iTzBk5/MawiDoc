import api from './api';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'PATIENT' | 'DOCTOR' | 'CLINIC';
    profileComplete: boolean;
  };
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  username: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  city: string;
}

export const authService = {
  async register(data: RegisterData): Promise<{ message: string; email: string }> {
    const res = await api.post<{ success: boolean; data: { message: string; email: string } }>('/auth/register', data);
    return res.data.data;
  },

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/verify-email', { email, code });
    return res.data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });
    return res.data.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post<{ success: boolean; data: { message: string } }>('/auth/forgot-password', { email });
    return res.data.data;
  },

  async resetPassword(data: any): Promise<{ message: string }> {
    const res = await api.post<{ success: boolean; data: { message: string } }>('/auth/reset-password', data);
    return res.data.data;
  },
};
