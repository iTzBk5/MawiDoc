import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { PatientTabParamList, PatientHomeStackParamList } from './types';
import { PatientHomeScreen } from '../features/patient/screens/PatientHomeScreen';
import { DoctorProfileScreen } from '../features/patient/screens/DoctorProfileScreen';
import { MapScreen } from '../features/patient/screens/MapScreen';
import { SlotSelectionScreen } from '../features/patient/screens/SlotSelectionScreen';
import { AppointmentsListScreen } from '../features/appointments/screens/AppointmentsListScreen';
import { AppointmentDetailScreen } from '../features/appointments/screens/AppointmentDetailScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { PatientProfileScreen } from '../features/profile/screens/PatientProfileScreen';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';
import { ChatBotScreen } from '../features/patient/screens/ChatBotScreen';
import { ThemeColors } from '../shared/theme/colors';
import { Shadows } from '../shared/theme/spacing';
import { useAppTheme } from '../shared/theme/useAppTheme';
import { useStyles } from '../shared/theme/useStyles';

import { ClinicProfileScreen } from '../features/patient/screens/ClinicProfileScreen';
import { SearchScreen } from '../features/patient/screens/SearchScreen';

const Tab = createBottomTabNavigator<PatientTabParamList>();
const HomeStack = createNativeStackNavigator<PatientHomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="PatientHome" component={PatientHomeScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <HomeStack.Screen name="ClinicProfile" component={ClinicProfileScreen} />
      <HomeStack.Screen name="Map" component={MapScreen} />
      <HomeStack.Screen name="SlotSelection" component={SlotSelectionScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function AppointmentsStackScreen() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppointmentsList" component={AppointmentsListScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </Stack.Navigator>
  );
}

function ChatBotStackScreen() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatBotMain" component={ChatBotScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function ProfileStackScreen() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientProfile" component={PatientProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
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

export function PatientNavigator() {
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
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: t('patient.home'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="AppointmentsTab"
        component={AppointmentsStackScreen}
        options={{
          tabBarLabel: t('appointments.title'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="ChatBotTab"
        component={ChatBotStackScreen}
        options={{
          tabBarLabel: t('chatbot.tabTitle', 'Assistant'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
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
