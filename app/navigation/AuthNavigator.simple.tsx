import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';

const Stack = createStackNavigator();

// Temporary placeholder components
function LoginScreen() {
  const { setAuth } = useAuthStore();

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Game</Text>
      <Text style={styles.subtitle}>Login to start playing</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Test Login</Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Register Screen</Text>
    </View>
  );
}

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  text: {
    fontSize: 18,
    color: '#333333',
  },
});
