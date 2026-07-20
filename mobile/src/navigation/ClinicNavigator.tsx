import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { ClinicTabParamList, ClinicHomeStackParamList, ClinicProfileStackParamList } from './types';
import { ThemeColors } from '../shared/theme/colors';
import { useAppTheme } from '../shared/theme/useAppTheme';

// We'll create these screens later
import { ClinicDashboardScreen } from '../features/clinic/screens/ClinicDashboardScreen';
import { ClinicTeamScreen } from '../features/clinic/screens/ClinicTeamScreen';
import { GalleryManagerScreen } from '../features/clinic/screens/GalleryManagerScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';
import { ClinicAppointmentsScreen } from '../features/clinic/screens/ClinicAppointmentsScreen';
import { ClinicProfileScreen } from '../features/clinic/screens/ClinicProfileScreen';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';
import { Shadows } from '../shared/theme/spacing';

const Tab = createBottomTabNavigator<ClinicTabParamList>();
const HomeStack = createNativeStackNavigator<ClinicHomeStackParamList>();
const ProfileStack = createNativeStackNavigator<ClinicProfileStackParamList>();

function ClinicHomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="ClinicDashboard" component={ClinicDashboardScreen} />
      <HomeStack.Screen name="ClinicTeam" component={ClinicTeamScreen} />
      <HomeStack.Screen name="GalleryManager" component={GalleryManagerScreen} />
    </HomeStack.Navigator>
  );
}

function ClinicProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ClinicProfile" component={ClinicProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export function ClinicNavigator() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          ...Shadows.sm,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -2 },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={ClinicHomeStackNavigator}
        options={{
          tabBarLabel: t('common.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AppointmentsTab"
        component={ClinicAppointmentsScreen}
        options={{
          tabBarLabel: t('appointments.title', 'Appointments'),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ClinicProfileStackNavigator}
        options={{
          tabBarLabel: t('common.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('profile.settings', 'Settings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
