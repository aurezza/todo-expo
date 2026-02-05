import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    if (Platform.OS === 'web') {
      console.log('Push notifications on web require VAPID key configuration. Skipping.');
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
      if (!projectId) {
        console.error('Project ID not found');
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for push notifications');
  }

  return token;
}

// Setup notification listeners
export function setupNotificationListeners() {
  // Handle foreground notifications
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Received notification:', notification);
    // You can handle inner-app notification logic here if needed
  });

  // Return a cleanup function that matches the expected interface
  return () => {
    subscription.remove();
  };
}

// Handle when user taps a notification
export function setupNotificationTapHandler(callback: (data: any) => void) {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response.notification.request.content.data);
    callback(response.notification.request.content.data);
  });

  return subscription;
}