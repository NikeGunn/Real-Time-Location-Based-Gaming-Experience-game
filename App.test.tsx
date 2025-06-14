import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useAuthStore } from './app/store/authStore';
import { useNotificationStore } from './app/store/notificationStore';
import { FirebaseService } from './app/services/firebase';
import AuthNavigator from './app/navigation/AuthNavigator.simple';
import MainNavigator from './app/navigation/MainNavigator.simple';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Set up notification listeners
    const handleNotificationReceived = (notification: any) => {
      console.log('Notification received:', notification);
      addNotification(notification.request.content);
    };

    const handleNotificationResponse = (response: any) => {
      console.log('Notification response:', response);
      // Handle navigation based on notification type
      const data = response.notification.request.content.data;
      if (data?.type === 'zone_attack' && data?.zone_id) {
        // Navigate to specific zone or map
      }
    };

    FirebaseService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationResponse
    );

    // Register FCM token if user is authenticated
    if (isAuthenticated && user) {
      registerFCMTokenOnAuth();
    }
  }, [isAuthenticated, user]);

  const registerFCMTokenOnAuth = async () => {
    try {
      const token = await FirebaseService.requestPermissions();
      if (token) {
        // Here we would call the API to register the token
        // For now, just log it
        console.log('FCM Token:', token);
      }
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
