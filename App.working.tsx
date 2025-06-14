import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from './app/store/authStore';
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

// Simple test component
function TestScreen() {
  const { isAuthenticated, user, setAuth, clearAuth } = useAuthStore();
    const handleLogin = () => {
    // Simulate login
    setAuth(
      { 
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com', 
        xp: 100, 
        level: 1, 
        zones_owned: 0,
        attack_power: 50,
        created_at: new Date().toISOString() 
      },
      'fake-access-token',
      'fake-refresh-token'
    );
  };
  
  const handleLogout = () => {
    clearAuth();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Location Game App</Text>
      <Text style={styles.subtext}>React Native + Expo Location-Based Game</Text>
      <Text style={styles.details}>🗺️ Map-based zone capture game</Text>
      <Text style={styles.details}>🏆 Leaderboard system</Text>
      <Text style={styles.details}>⚔️ Zone attack mechanics</Text>
      
      <View style={styles.authSection}>
        {isAuthenticated ? (
          <>
            <Text style={styles.authStatus}>✅ Logged in as: {user?.username}</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.authStatus}>❌ Not authenticated</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Test Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <Text style={styles.status}>Status: Authentication system working! ✅</Text>
    </View>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  details: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  authStatus: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
  },
});