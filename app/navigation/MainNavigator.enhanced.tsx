import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, View, Text } from 'react-native';

// Screens
import MapScreen from '../screens/MapScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen.working';
import ProfileScreen from '../screens/ProfileScreen.working';
import NotificationScreen from '../screens/NotificationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AttackHistoryScreen from '../screens/AttackHistoryScreen';
import ZoneDetailsScreen from '../screens/ZoneDetailsScreen';

// Stores
import { useNotificationStore } from '../store/notificationStore';

// Utils
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
            <View style={{ position: 'relative' }}>
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
            </View>
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
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerRight: () => (
            <MaterialIcons
              name="settings"
              size={24}
              color={COLORS.text}
              style={{ marginRight: 16 }}
              onPress={() => {
                // Navigation to settings would be handled here
                // This requires navigation ref or prop drilling
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator with Modal Support
export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
          borderBottomColor: COLORS.border,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {/* Main Tab Navigation */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Detail Screens */}
      <Stack.Screen
        name="AttackHistory"
        component={AttackHistoryScreen}
        options={{
          title: 'Attack History',
          headerBackTitleVisible: false,
        }}
      />

      <Stack.Screen
        name="ZoneDetails"
        component={ZoneDetailsScreen}
        options={{
          title: 'Zone Details',
          headerBackTitleVisible: false,
        }}
      />

      {/* Settings Screen */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackTitleVisible: false,
        }}
      />

      {/* Modal Screens */}
      <Stack.Group screenOptions={{
        presentation: 'modal',
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
      }}>
        <Stack.Screen
          name="NotificationModal"
          component={NotificationScreen}
          options={{
            title: 'Notification Details',
            headerLeft: () => (
              <MaterialIcons
                name="close"
                size={24}
                color={COLORS.text}
                style={{ marginLeft: 16 }}
              />
            ),
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
