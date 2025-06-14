import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert, Platform, View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

// Stores
import { useAuthStore } from './app/store/authStore';
import { useNotificationStore } from './app/store/notificationStore';
import { useGameStore } from './app/store/gameStore';

// Services
import { FirebaseService } from './app/services/firebase';
import { useRegisterFCMToken } from './app/services/authService.real';

// Navigation
import AuthNavigator from './app/navigation/AuthNavigator';
import GameNavigator from './app/navigation/GameNavigator';

// Components
import { LoadingScreen } from './app/components/ui/LoadingScreen';
import { NotificationModal } from './app/components/ui/NotificationModal';

// Types
import { GameNotification } from './app/types/notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const { isAuthenticated, user, loading, initializeAuth } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { setUserLocation } = useGameStore();
  const registerFCMToken = useRegisterFCMToken();

  const [appReady, setAppReady] = useState(false);
  const [notification, setNotification] = useState<GameNotification | null>(null);

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    if (!appReady) return;

    const handleNotificationReceived = (notification: any) => {
      console.log('📱 Notification received:', notification);

      const gameNotification: GameNotification = {
        id: notification.request.identifier,
        type: notification.request.content.data?.type || 'game_update',
        title: notification.request.content.title || 'Game Update',
        message: notification.request.content.body || '',
        data: notification.request.content.data || {},
        timestamp: new Date().toISOString(),
        read: false,
      };

      addNotification(gameNotification);
      setNotification(gameNotification);
    };

    const handleNotificationResponse = (response: any) => {
      console.log('🎯 Notification response:', response);
      // Handle notification tap
      const data = response.notification.request.content.data;
      if (data?.action === 'view_zone' && data?.zoneId) {
        // Navigate to zone details or map
      }
    };

    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [appReady, addNotification]);

  // Register FCM token when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      registerFCMToken.mutate();
    }
  }, [isAuthenticated, user]);

  const initializeApp = async () => {
    try {
      // Initialize Firebase
      await FirebaseService.initialize();

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to function properly.',
          [{ text: 'OK' }]
        );
      } else {
        // Get initial location
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }

      // Request notification permissions
      await Notifications.requestPermissionsAsync();

      // Initialize auth state from storage
      await initializeAuth();

    } catch (error) {
      console.error('❌ App initialization error:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart.',
        [{ text: 'OK' }]
      );
    } finally {
      setAppReady(true);
    }
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Show loading screen during initialization
  if (loading || !appReady) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <LoadingScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          {isAuthenticated && user ? (
            <GameNavigator />
          ) : (
            <AuthNavigator />
          )}
        </NavigationContainer>

        {/* Global notification modal */}
        {notification && (
          <NotificationModal
            notification={notification}
            visible={!!notification}
            onClose={handleNotificationClose}
          />
        )}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
