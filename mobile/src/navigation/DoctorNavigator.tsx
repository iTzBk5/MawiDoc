import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { DoctorTabParamList } from './types';
import { DashboardScreen } from '../features/doctor/screens/DashboardScreen';
import { TodayAppointmentsScreen } from '../features/doctor/screens/TodayAppointmentsScreen';
import { StatisticsScreen } from '../features/doctor/screens/StatisticsScreen';
import { AllAppointmentsScreen } from '../features/appointments/screens/AllAppointmentsScreen';
import { AppointmentDetailScreen } from '../features/appointments/screens/AppointmentDetailScreen';
import { DoctorProfileScreen } from '../features/profile/screens/DoctorProfileScreen';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';
import { WorkingDaysScreen } from '../features/doctor/screens/WorkingDaysScreen';
import { ClinicInfoScreen } from '../features/doctor/screens/ClinicInfoScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';
import { GalleryManagerScreen } from '../features/clinic/screens/GalleryManagerScreen';
import { ThemeColors } from '../shared/theme/colors';
import { Shadows } from '../shared/theme/spacing';
import { useAppTheme } from '../shared/theme/useAppTheme';

const Tab = createBottomTabNavigator<DoctorTabParamList>();

function DashboardStackScreen() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="TodayAppointments" component={TodayAppointmentsScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

import { CreateManualAppointmentScreen } from '../features/appointments/screens/CreateManualAppointmentScreen';
import { DoctorSlotSelectionScreen } from '../features/appointments/screens/DoctorSlotSelectionScreen';

function DoctorAppointmentsStackScreen() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AllAppointments" component={AllAppointmentsScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="DoctorSlotSelection" component={DoctorSlotSelectionScreen} />
      <Stack.Screen name="CreateManualAppointment" component={CreateManualAppointmentScreen} />
    </Stack.Navigator>
  );
}

function DoctorProfileStackScreen() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="WorkingDays" component={WorkingDaysScreen} />
      <Stack.Screen name="ClinicInfo" component={ClinicInfoScreen} />
      <Stack.Screen name="GalleryManager" component={GalleryManagerScreen} />
    </Stack.Navigator>
  );
}

function TabIcon({ name, color, focused, colors }: { name: string; color: string; focused: boolean; colors: ThemeColors }) {
  return (
    <View style={[tabIconStyles.wrap, focused && { backgroundColor: colors.tintAccent }]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function DoctorNavigator() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          ...Shadows.sm,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -2 },
      }}>
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackScreen}
        options={{
          tabBarLabel: t('doctor.dashboard'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'grid' : 'grid-outline'} color={color} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="AppointmentsTab"
        component={DoctorAppointmentsStackScreen}
        options={{
          tabBarLabel: t('appointments.title'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={DoctorProfileStackScreen}
        options={{
          tabBarLabel: t('profile.title'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('profile.settings'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} focused={focused} colors={colors} />,
        }}
      />
    </Tab.Navigator>
  );
}