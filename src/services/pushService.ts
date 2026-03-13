import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authService } from './authService';

/**
 * Configure how notifications are presented when the app is in the foreground.
 * Call this once at app startup (before any notifications arrive).
 */
export function configurePushNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Android requires an explicit notification channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E90FF',
    });
  }
}

/**
 * Request push notification permissions, obtain an Expo push token,
 * and persist it to the user's profile in Supabase.
 *
 * @returns The Expo push token string, or `null` if registration failed.
 */
export async function registerForPushNotifications(
  userId: string,
): Promise<string | null> {
  try {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
      console.warn('Push notifications require a physical device.');
      return null;
    }

    // Check / request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted.');
      return null;
    }

    // Obtain the Expo push token using the EAS project ID
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn('EAS projectId not found — cannot register for push.');
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Persist the token to Supabase
    try {
      await authService.updatePushToken(userId, token);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }

    return token;
  } catch (error) {
    // FCM not configured (missing google-services.json) or other init failure.
    // Fail gracefully — push notifications are non-critical.
    console.warn('Push notification registration failed:', error);
    return null;
  }
}

/**
 * Subscribe to notification‑tap events.
 * Returns a subscription that should be removed on unmount.
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
