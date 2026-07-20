import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { notificationService } from '../../services/notification.service';
import { storage } from './storage';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    await getFCMToken();
  }
}

export async function getFCMToken() {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      // Check if user is logged in before sending token to backend
      const token = await storage.getToken();
      if (token) {
        await notificationService.saveFCMToken(fcmToken);
      }
    }
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
}

export function setupForegroundHandler() {
  return messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
    Alert.alert(
      remoteMessage.notification?.title || 'New Notification', 
      remoteMessage.notification?.body || ''
    );
  });
}
