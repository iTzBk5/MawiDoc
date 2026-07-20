import { useAuthStore } from '../../store/auth.store';

export function useAuth() {
  const { token, user, isAuthenticated, isLoading, setAuth, logout } = useAuthStore();
  return { token, user, isAuthenticated, isLoading, setAuth, logout, isDoctor: user?.role === 'DOCTOR', isPatient: user?.role === 'PATIENT', isClinic: user?.role === 'CLINIC' };
}
