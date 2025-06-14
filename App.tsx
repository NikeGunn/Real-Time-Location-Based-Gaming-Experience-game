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
import Constants from 'expo-constants';

// Navigation
import AuthNavigator from './app/navigation/AuthNavigator';
import GameNavigator from './app/navigation/GameNavigator';

// Components
import { LoadingScreen } from './app/components/ui/LoadingScreen';
import { NotificationModal } from './app/components/ui/NotificationModal';

// Types
import { UINotification, GameNotification } from './app/types/notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
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

function AppContent() {
  const { isAuthenticated, user, loading, initializeAuth } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { setUserLocation } = useGameStore();
  const registerFCMToken = useRegisterFCMToken();
  const [appReady, setAppReady] = useState(false);
  const [notification, setNotification] = useState<UINotification | null>(null);

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);
  // Set up notification listeners
  useEffect(() => {
    if (!appReady) return;

    // Skip notification setup in Expo Go to avoid errors
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      console.log('Skipping notification listeners setup in Expo Go');
      return;
    }

    const handleNotificationReceived = (notification: any) => {
      console.log('📱 Notification received:', notification);

      const gameNotification: GameNotification = {
        type: notification.request.content.data?.type || 'zone_attack',
        title: notification.request.content.title || 'Game Update',
        body: notification.request.content.body || '',
        data: notification.request.content.data || {},
      };

      addNotification(gameNotification);

      // Create UI notification for modal display
      const uiNotification: UINotification = {
        id: notification.request.identifier,
        type: notification.request.content.data?.type || 'game_update',
        title: notification.request.content.title || 'Game Update',
        message: notification.request.content.body || '',
        data: notification.request.content.data || {},
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotification(uiNotification);
    };

    const handleNotificationResponse = (response: any) => {
      console.log('🎯 Notification response:', response);
      // Handle notification tap
      const data = response.notification.request.content.data;
      if (data?.action === 'view_zone' && data?.zoneId) {
        // Navigate to zone details or map
      }
    };

    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(
        handleNotificationReceived
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );
    } catch (error) {
      console.warn('Failed to set up notification listeners:', error);
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [appReady, addNotification]);// Register FCM token when user logs in
  useEffect(() => {
    const registerFCMTokenOnAuth = async () => {
      if (isAuthenticated && user) {
        try {
          // Skip FCM registration if running in Expo Go
          const isExpoGo = Constants.appOwnership === 'expo';
          if (isExpoGo) {
            console.log('Skipping FCM token registration in Expo Go');
            return;
          }

          const pushToken = await FirebaseService.requestPermissions();
          if (pushToken) {
            await registerFCMToken.mutateAsync({
              push_token: pushToken,
              device_type: Platform.OS as 'ios' | 'android',
            });
            console.log('FCM token registered successfully');
          }
        } catch (error) {
          console.error('Failed to register FCM token:', error);
        }
      }
    };

    registerFCMTokenOnAuth();
  }, [isAuthenticated, user]);
  const initializeApp = async () => {
    try {
      // Check if running in Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';

      if (isExpoGo) {
        console.warn('⚠️ Running in Expo Go - Push notifications are limited');
        Alert.alert(
          'Development Mode',
          'You are running in Expo Go. Push notifications are limited in this environment. For full notification functionality, use a development build.',
          [{ text: 'OK' }]
        );
      } else {
        // Initialize Firebase only if not in Expo Go
        await FirebaseService.initialize();
      }

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

      // Request notification permissions (still works for local notifications)
      if (!isExpoGo) {
        await Notifications.requestPermissionsAsync();
      }

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
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
