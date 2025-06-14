import { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Stores
import { useAuthStore } from './app/store/authStore';
import { useNotificationStore } from './app/store/notificationStore';

// Services
import { FirebaseService } from './app/services/firebase';
import { useRegisterFCMToken } from './app/services/authService';

// Navigation
import AuthNavigator from './app/navigation/AuthNavigator.clean';
import MainNavigator from './app/navigation/MainNavigator.enhanced';

// Components
import { LoadingScreen } from './app/components/ui/LoadingScreen';

// Types
import { GameNotification } from './app/types/notifications';

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
  const { isAuthenticated, user, loading } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const registerFCMToken = useRegisterFCMToken();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Set up notification listeners
    const handleNotificationReceived = (notification: any) => {
      console.log('Notification received:', notification);

      // Add notification to store for display in NotificationScreen
      const gameNotification: GameNotification = {
        type: notification.request.content.data?.type || 'zone_attack',
        title: notification.request.content.title || 'New Notification',
        body: notification.request.content.body || '',
        data: {
          ...notification.request.content.data,
          timestamp: new Date().toISOString(),
        },
      };

      addNotification(gameNotification);

      // Show alert if app is in foreground (optional)
      if (Platform.OS !== 'web') {
        Alert.alert(
          gameNotification.title,
          gameNotification.body,
          [
            { text: 'Dismiss', style: 'cancel' },
            {
              text: 'View',
              onPress: () => {
                // Navigation would be handled here with proper navigation ref
                console.log('Navigate to notification details');
              }
            },
          ]
        );
      }
    };

    const handleNotificationResponse = (response: any) => {
      console.log('Notification response:', response);

      const data = response.notification.request.content.data;
      if (data?.type && data?.zone_id) {
        // Handle navigation based on notification type
        // This would require navigation ref setup for deep linking
        console.log('Should navigate to:', data.type, data.zone_id);
      }
    };

    // Set up Firebase notification listeners
    FirebaseService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationResponse
    );

    // Store notification listeners for cleanup
    notificationListener.current = Notifications.addNotificationReceivedListener(handleNotificationReceived);
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    // Register FCM token if user is authenticated
    if (isAuthenticated && user) {
      registerFCMTokenOnAuth();
    }

    return () => {
      // Cleanup notification listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated, user, addNotification]);

  const registerFCMTokenOnAuth = async () => {
    try {
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
      // Don't show user-facing error for FCM registration failures
    }
  };

  // Show loading screen while auth is being checked
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
