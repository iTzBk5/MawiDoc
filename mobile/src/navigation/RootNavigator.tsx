import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { PatientNavigator } from './PatientNavigator';
import { DoctorNavigator } from './DoctorNavigator';
import { ClinicNavigator } from './ClinicNavigator';
import { useAuthStore } from '../store/auth.store';
import { SplashScreen } from '../shared/components/SplashScreen';
import { useAppTheme } from '../shared/theme/useAppTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading, user, loadStoredAuth } = useAuthStore();
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  const navTheme = {
    ...(isDark ? NavDarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? NavDarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.borderLight,
      notification: colors.error,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user?.role === 'CLINIC' ? (
          <Stack.Screen name="ClinicTabs" component={ClinicNavigator} />
        ) : user?.role === 'DOCTOR' ? (
          <Stack.Screen name="DoctorTabs" component={DoctorNavigator} />
        ) : (
          <Stack.Screen name="PatientTabs" component={PatientNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
