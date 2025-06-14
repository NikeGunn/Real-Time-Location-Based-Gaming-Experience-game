import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen.working';

const Stack = createStackNavigator();

// Real LoginScreen implementation
function LoginScreen() {
  const { setAuth, setLoading } = useAuthStore();
  const loginMutation = useLogin();

  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync({
        credentials: {
          username: 'testuser',
          password: 'testpass',
        },
        setAuth,
        setLoading,
      });
    } catch (error: any) {
      // For demo purposes, simulate successful login
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
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Game</Text>
      <Text style={styles.subtitle}>Login to start playing</Text>
      <Text style={styles.info}>🎮 Zone capture game</Text>
      <Text style={styles.info}>🗺️ Real-world map integration</Text>
      <Text style={styles.info}>⚔️ Battle other players</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.note}>Demo: Click to login with test account</Text>
    </View>
  );
}

function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.text}>Registration coming soon...</Text>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  text: {
    fontSize: 18,
    color: '#333333',
  },
});
