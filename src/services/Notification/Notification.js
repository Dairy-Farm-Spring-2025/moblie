import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert, AppState, AppStateStatus } from 'react-native';
import apiClient from '@config/axios/axios';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show notification when app is in foreground
    shouldPlaySound: true, // Play sound for notification
    shouldSetBadge: false, // Don't set badge count
  }),
});

// Function to request notification permissions and get the push token
export async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    Alert.alert('Error', 'Must use a physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Error', 'Failed to get push token for push notification!');
    return null;
  }

  token = (await Notifications.getDevicePushTokenAsync()).data;
  console.log('Push Token retrieved:', token); // Debug log

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// Function to update the push token on the backend
async function updateFCMToken(fcmToken) {
  try {
    const response = await apiClient.put('/users/update/fcmToken', {
      fcmTokenMobile: fcmToken,
      fcmTokenWeb: '',
    });

    console.log('Update FCM token response:', response);

    if (response.code !== 200) {
      throw new Error(`HTTP error! Status: ${response.code}`);
    }

    const result = response.message;
    console.log('FCM token updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error updating FCM token:', error);
    Alert.alert('Error', 'Failed to update FCM token. Please try again.');
    return null;
  }
}

// Function to mark a notification as read
async function markNotificationAsRead(notificationId, userId) {
  try {
    const response = await apiClient.put(
      `/notifications/${notificationId}/mark-read/${userId}`,
      {}
    );
    console.log('Notification marked as read:', response.data);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Custom hook to handle notification initialization
export function useNotifications({ navigation } = {}) {
  // Get userId from Redux store
  const userId = useSelector((state) => state.auth.userId);

  useEffect(() => {
    console.log('useNotifications hook called with userId:', userId); // Debug log

    if (!userId) {
      console.log('Skipping notification setup: userId missing');
      return;
    }

    let notificationListener = null;
    let responseListener = null;
    let appStateListener = null;

    // Register for push notifications and get the push token
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        console.log('Push Token:', token);
        updateFCMToken(token);
      } else {
        console.log('Failed to retrieve push token');
      }
    });

    // Handle notifications received while the app is in the foreground
    notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
      Alert.alert(
        notification.request.content.title || 'New Notification',
        notification.request.content.body || 'You have a new notification'
      );
    });

    // Handle notification interactions (e.g., when the user taps the notification)
    responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      if (data.link) {
        console.log('Navigating to link:', data.link);
        if (navigation) {
          navigation.navigate('Home', {
            screen: 'CowDetails',
            params: { link: data.link },
          });
        } else {
          console.log('Navigation object is missing');
        }
      }
      if (data.notificationId && userId) {
        console.log('Marking notification as read, ID:', data.notificationId);
        markNotificationAsRead(data.notificationId, userId);
      }
    });

    // Handle background/killed state notifications
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active') {
        const initialNotification = await Notifications.getLastNotificationResponseAsync();
        if (initialNotification) {
          console.log('Initial notification on app open:', initialNotification);
          const data = initialNotification.notification.request.content.data;
          if (data.link) {
            console.log('Navigating to link from initial notification:', data.link);
            if (navigation) {
              navigation.navigate('Home', {
                screen: 'CowDetails',
                params: { link: data.link },
              });
            } else {
              console.log('Navigation object is missing');
            }
          }
          if (data.notificationId && userId) {
            console.log('Marking notification as read, ID:', data.notificationId);
            markNotificationAsRead(data.notificationId, userId);
          }
        }
      }
    };

    appStateListener = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
      if (responseListener) {
        Notifications.removeNotificationSubscription(responseListener);
      }
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, [navigation, userId]); // Dependencies for the effect
}
