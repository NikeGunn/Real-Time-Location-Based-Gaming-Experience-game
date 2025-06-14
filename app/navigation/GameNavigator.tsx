import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Game Screens
import MapScreen from '../screens/MapScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ZoneDetailScreen from '../screens/ZoneDetailScreen';
import AttackScreen from '../screens/AttackScreen';
import AttackHistoryScreen from '../screens/AttackHistoryScreen'; // Add this import

// Stores
import { useNotificationStore } from '../store/notificationStore';

// Constants
import { COLORS } from '../utils/constants.enhanced';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Map Stack Navigator
function MapStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapMain"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ZoneDetail"
        component={ZoneDetailScreen}
        options={{
          title: 'Zone Details',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textOnPrimary,
        }}
      />
      <Stack.Screen
        name="Attack"
        component={AttackScreen}
        options={{
          title: 'Attack Zone',
          headerStyle: {
            backgroundColor: COLORS.error,
          },
          headerTintColor: COLORS.textOnError,
        }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AttackHistory"
        component={AttackHistoryScreen}
        options={{
          title: 'Attack History',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textOnPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          title: 'Notifications',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textOnPrimary,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textOnPrimary,
        }}
      />
    </Stack.Navigator>
  );
}

// Custom Tab Bar Badge
function TabBarBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
}

export default function GameNavigator() {
  const { unreadCount } = useNotificationStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Leaderboard':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          const IconComponent = (
            <Ionicons name={iconName} size={size} color={color} />
          );

          // Add badge for notifications on Profile tab
          if (route.name === 'Profile' && unreadCount > 0) {
            return (
              <View>
                {IconComponent}
                <TabBarBadge count={unreadCount} />
              </View>
            );
          }

          return IconComponent;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Map"
        component={MapStackNavigator}
        options={{
          title: 'Map',
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          title: 'Leaderboard',
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textOnPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.textOnError,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
