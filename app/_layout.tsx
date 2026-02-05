import 'react-native-url-polyfill/auto';

import {
  registerForPushNotifications,
  setupNotificationListeners,
  setupNotificationTapHandler
} from '@/utils/notifications';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import Sidebar from '../components/Sidebar';
import { LayoutProvider, useLayout } from '../context/LayoutContext';
import '../global.css';
import { useAuthStore } from '../store/useAuthStore';

function MainLayout() {
  const { setSidebarVisible, isSidebarVisible } = useLayout();
  const segments = useSegments();
  const router = useRouter();
  const filteredSegments = segments.filter(s => s !== "(home)"); // normalize segments
  const inAuthGroup = filteredSegments[0] === 'auth';
 const [pushToken, setPushToken] = useState('');
  
  const { isAuthenticated, isLoading, initialize } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    initialize: state.initialize
  }));

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications()
      .then(token => {
        if (token) {
          setPushToken(token);
          console.log('Push token received:', token);
          // TODO: Send token to your backend server
          // Example: sendTokenToBackend(token);
        }
      })
      .catch(error => {
        console.error('Error registering for notifications:', error);
      });

    // Setup notification listeners
    const unsubscribe = setupNotificationListeners();

    // Handle notification taps
    const tapSubscription = setupNotificationTapHandler((data) => {
      console.log('User tapped notification with data:', data);
      
      // Navigate based on notification data
      if (data.screen) {
        router.push(data.screen);
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
      tapSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(home)');
    }
  }, [isAuthenticated, inAuthGroup, isLoading]);

  if (isLoading) {
    return (
        <View className="flex-1 bg-black items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
        </View>
    );
  }

  if (inAuthGroup) {
    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <Slot />
        </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 flex-row bg-black" edges={['top']}>
      <StatusBar style="light" />
      <Sidebar />
      <View className="flex-1 flex-col h-full">
        <View className="flex-1">
            <Slot />
        </View>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LayoutProvider>
        <MainLayout />
      </LayoutProvider>
    </GestureHandlerRootView>
  );
}
