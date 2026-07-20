import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  RoleSelection: undefined;
  Login: { role: 'PATIENT' | 'DOCTOR' };
  Register: undefined;
  OTPVerification: { email: string };
  ForgotPassword: undefined;
  OTPReset: { email: string };
  NewPassword: { email: string, code: string };
};

export type PatientHomeStackParamList = {
  PatientHome: undefined;
  Search: { specialtyId?: string; specialtyName?: string } | undefined;
  DoctorProfile: { doctorId: string };
  ClinicProfile: { clinicId: string };
  Map: undefined;
  SlotSelection: { doctorId: string };
  Notifications: undefined;
};

export type PatientTabParamList = {
  HomeTab: NavigatorScreenParams<PatientHomeStackParamList>;
  AppointmentsTab: undefined;
  ChatBotTab: undefined;
  ProfileTab: undefined;
  SettingsTab: undefined;
};

export type DoctorTabParamList = {
  DashboardTab: undefined;
  AppointmentsTab: undefined;
  ProfileTab: undefined;
  SettingsTab: undefined;
};

export type DoctorHomeStackParamList = {
  Dashboard: undefined;
  DoctorProfile: undefined;
  EditProfile: undefined;
  WorkingDays: undefined;
  ClinicInfo: undefined;
  GalleryManager: undefined;
  Appointments: undefined;
  Notifications: undefined;
};

export type ClinicTabParamList = {
  HomeTab: undefined;
  AppointmentsTab: { filter?: 'today' | 'all' } | undefined;
  ProfileTab: undefined;
  SettingsTab: undefined;
};

export type ClinicHomeStackParamList = {
  ClinicDashboard: undefined;
  ClinicTeam: undefined;
  GalleryManager: undefined;
  Notifications: undefined;
};

export type ClinicProfileStackParamList = {
  ClinicProfile: undefined;
  EditProfile: { profile: any };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  PatientTabs: NavigatorScreenParams<PatientTabParamList>;
  DoctorTabs: NavigatorScreenParams<DoctorTabParamList>;
  ClinicTabs: NavigatorScreenParams<ClinicTabParamList>;
};
