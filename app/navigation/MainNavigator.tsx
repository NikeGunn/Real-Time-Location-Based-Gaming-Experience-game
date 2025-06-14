import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

// Import screens
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen.working';
import LeaderboardScreen from '../screens/LeaderboardScreen.working';
import AttackHistoryScreen from '../screens/AttackHistoryScreen.simple';
import ZoneDetailsScreen from '../screens/ZoneDetailsScreen.simple';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapMain"
        component={MapScreen}
        options={{ headerShown: false }}
      />      <Stack.Screen
        name="ZoneDetails"
        component={ZoneDetailsScreen}
        options={{
          title: 'Zone Details'
        }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
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
          title: 'Attack History'
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Map') {
          iconName = focused ? 'map' : 'map-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'Leaderboard') {
          iconName = focused ? 'trophy' : 'trophy-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.PRIMARY,
      tabBarInactiveTintColor: COLORS.GRAY,
      headerShown: false,
    })}
    >
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />        <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
