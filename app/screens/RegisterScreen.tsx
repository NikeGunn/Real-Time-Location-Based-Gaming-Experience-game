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
import { useRegister } from '../services/authService.real';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useRegister();
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await registerMutation.mutateAsync({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const updateFormData = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (registerMutation.isPending) {
    return <LoadingScreen message="Creating account..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Join the Game</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>        <View style={styles.form}>
          <Input
            label="First Name"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
            placeholder="Enter your first name"
            autoCapitalize="words"
            error={errors.firstName}
          />

          <Input
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
            placeholder="Enter your last name"
            autoCapitalize="words"
            error={errors.lastName}
          />

          <Input
            label="Username"
            value={formData.username}
            onChangeText={(value) => updateFormData('username', value)}
            placeholder="Choose a username"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.username}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign in</Text>
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
  registerButton: {
    marginTop: SPACING.LG,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.LG,
  },
  loginText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY,
  },
  loginLink: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});
