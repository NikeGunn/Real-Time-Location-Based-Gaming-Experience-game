import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { setAuth, setLoading, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, create a new user account
      const newUser = {
        id: Math.floor(Math.random() * 1000) + 100, // Random ID
        username: formData.username,
        email: formData.email,
        xp: 0,
        level: 1,
        zones_owned: 0,
        attack_power: 50,
        created_at: new Date().toISOString(),
      };

      // Set authentication state
      setAuth(newUser, 'demo-access-token', 'demo-refresh-token');

      Alert.alert(
        'Welcome to the Game!',
        `Account created successfully for ${formData.username}. You're now ready to start capturing zones!`,
        [{ text: 'Start Playing', onPress: () => { } }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join the Game</Text>
            <Text style={styles.subtitle}>
              Create your account and start conquering zones!
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            <Input
              label="Username"
              placeholder="Choose a unique username"
              value={formData.username}
              onChangeText={updateFormData('username')}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />

            <Input
              label="Email Address"
              placeholder="your.email@example.com"
              value={formData.email}
              onChangeText={updateFormData('email')}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChangeText={updateFormData('password')}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={updateFormData('confirmPassword')}
              error={errors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <Text style={styles.requirementText}>• At least 8 characters</Text>
              <Text style={styles.requirementText}>• One uppercase letter</Text>
              <Text style={styles.requirementText}>• One lowercase letter</Text>
              <Text style={styles.requirementText}>• One number</Text>
            </View>

            {/* Register Button */}            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
            />

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Game Features Preview */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>What you can do:</Text>
            <Text style={styles.featureText}>🗺️ Explore interactive maps</Text>
            <Text style={styles.featureText}>🏰 Claim and defend zones</Text>
            <Text style={styles.featureText}>⚔️ Battle other players</Text>
            <Text style={styles.featureText}>🏆 Climb the leaderboards</Text>
            <Text style={styles.featureText}>📱 Real-time notifications</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.LG,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
    paddingTop: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.LARGE_TITLE,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
    textAlign: 'center',
    paddingHorizontal: SPACING.MD,
  },
  form: {
    marginBottom: SPACING.LG,
  },
  requirements: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderRadius: 8,
    marginBottom: SPACING.LG,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.INFO,
  },
  requirementsTitle: {
    ...TYPOGRAPHY.CALLOUT,
    fontWeight: '600',
    color: COLORS.DARK,
    marginBottom: SPACING.SM,
  },
  requirementText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  registerButton: {
    marginBottom: SPACING.LG,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
  },
  loginLinkText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  features: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderRadius: 12,
    marginTop: SPACING.LG,
  },
  featuresTitle: {
    ...TYPOGRAPHY.HEADLINE,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  featureText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
});
