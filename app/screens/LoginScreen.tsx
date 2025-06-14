import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useLogin } from '../services/authService.real';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { setAuth, setLoading } = useAuthStore();
  const loginMutation = useLogin();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }; const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await loginMutation.mutateAsync({
        username: username.trim(),
        password,
      });
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || 'Invalid username or password'
      );
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  if (loginMutation.isPending) {
    return <LoadingScreen message="Logging in..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Location Game</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.username}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.LG,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XXL,
  },
  title: {
    ...TYPOGRAPHY.LARGE_TITLE,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.GRAY,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: SPACING.LG,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.LG,
  },
  registerText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY,
  },
  registerLink: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});
