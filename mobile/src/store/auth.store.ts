import { create } from 'zustand';
import { storage } from '../shared/utils/storage';

interface User {
  id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'CLINIC';
  profileComplete: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (token: string, user: User) => {
    await storage.setToken(token);
    await storage.setUserData(JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await storage.clearAll();
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  loadStoredAuth: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const token = await storage.getToken();
      const userData = await storage.getUserData();
      if (token && userData) {
        const user = JSON.parse(userData) as User;
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
