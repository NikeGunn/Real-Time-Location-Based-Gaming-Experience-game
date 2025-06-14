import { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Platform, View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

// Stores
import { useAuthStore } from './app/store/authStore';
import { useNotificationStore } from './app/store/notificationStore';

// Services
import { FirebaseService } from './app/services/firebase';
import { useRegisterFCMToken } from './app/services/authService';

// Screens
import LoginScreen from './app/screens/LoginScreen';
import RegisterScreen from './app/screens/RegisterScreen.working';
import MapScreen from './app/screens/MapScreen';
import LeaderboardScreen from './app/screens/LeaderboardScreen.working';
import ProfileScreen from './app/screens/ProfileScreen.working';
import NotificationScreen from './app/screens/NotificationScreen';
import AttackHistoryScreen from './app/screens/AttackHistoryScreen';
import ZoneDetailsScreen from './app/screens/ZoneDetailsScreen';

// Components
import { LoadingScreen } from './app/components/ui/LoadingScreen';

// Utils
import { COLORS } from './app/utils/constants';
import { GameNotification } from './app/types/notifications';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  const { unreadCount } = useNotificationStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Map':
              iconName = 'map';
              break;
            case 'Leaderboard':
              iconName = 'leaderboard';
              break;
            case 'Notifications':
              iconName = 'notifications';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <>
              <MaterialIcons name={iconName as any} size={size} color={color} />
              {route.name === 'Notifications' && unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  right: -6,
                  top: -3,
                  backgroundColor: COLORS.error,
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 80 : 60,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
          borderBottomColor: COLORS.border,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Game Map' }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ title: 'Rankings' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          title: 'Notifications',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AttackHistory"
        component={AttackHistoryScreen}
        options={{ title: 'Attack History' }}
      />
      <Stack.Screen
        name="ZoneDetails"
        component={ZoneDetailsScreen}
        options={{ title: 'Zone Details' }}
      />
    </Stack.Navigator>
  );
}

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
        data: notification.request.content.data || {},
      };

      addNotification(gameNotification);

      // Show alert if app is in foreground
      Alert.alert(
        gameNotification.title,
        gameNotification.body,
        [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'View',
            onPress: () => {
              // Handle navigation based on notification type
              // This would be implemented with navigation ref
            }
          },
        ]
      );
    };

    const handleNotificationResponse = (response: any) => {
      console.log('Notification response:', response);

      const data = response.notification.request.content.data;
      if (data?.type && data?.zone_id) {
        // Handle navigation based on notification type
        // This would require navigation ref setup
        console.log('Navigate to:', data.type, data.zone_id);
      }
    };

    // Set up Firebase notification listeners
    FirebaseService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationResponse
    );

    // Store notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(handleNotificationReceived);
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    // Register FCM token if user is authenticated
    if (isAuthenticated && user) {
      registerFCMTokenOnAuth();
    }

    return () => {
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
          {isAuthenticated ? <MainStackNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
