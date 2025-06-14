import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleAPIError } from './api.real';
import { useAuthStore } from '../store/authStore';
import { FirebaseService } from './firebase';
import { Platform } from 'react-native';

// API Types
export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  push_token?: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
  push_token?: string;
}

export interface UserAuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    level: number;
    xp: number;
    zones_owned: number;
    attack_power: number;
    created_at: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface FCMTokenRequest {
  push_token: string;
  device_type?: 'ios' | 'android' | 'web';
}

// Login Hook
export const useLogin = () => {
  const { setAuth, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: UserLoginRequest): Promise<UserAuthResponse> => {
      setLoading(true);

      // Get FCM token
      let pushToken: string | null = null;
      try {
        pushToken = await FirebaseService.requestPermissions();
      } catch (error) {
        console.warn('Failed to get FCM token:', error);
      }

      // Only include push_token if we have one
      const loginData: any = {
        username: credentials.username,
        password: credentials.password,
      };

      if (pushToken) {
        loginData.push_token = pushToken;
      }

      const response = await apiClient.post<UserAuthResponse>('/auth/login/', loginData);

      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      queryClient.clear(); // Clear all cached data
    },
    onError: (error) => {
      console.error('Login failed:', error);
      setLoading(false);
    },
  });
};

// Register Hook
export const useRegister = () => {
  const { setAuth, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (userData: UserRegistrationRequest): Promise<UserAuthResponse> => {
      setLoading(true);

      // Get FCM token
      let pushToken: string | null = null;
      try {
        pushToken = await FirebaseService.requestPermissions();
      } catch (error) {
        console.warn('Failed to get FCM token:', error);
      }

      // Only include push_token if we have one
      const registerData: any = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password_confirm,
        first_name: userData.first_name,
        last_name: userData.last_name,
      };

      if (pushToken) {
        registerData.push_token = pushToken;
      }

      const response = await apiClient.post<UserAuthResponse>('/auth/register/', registerData);

      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      setLoading(false);
    },
  });
};

// Logout Hook
export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        // Optional: Call logout endpoint if backend supports it
        await apiClient.post('/auth/logout/');
      } catch (error) {
        // Ignore logout endpoint errors
        console.warn('Logout endpoint failed:', error);
      }
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      // Still clear auth even if logout endpoint fails
      clearAuth();
      queryClient.clear();
    },
  });
};

// Register FCM Token Hook
export const useRegisterFCMToken = () => {
  return useMutation({
    mutationFn: async (tokenData: FCMTokenRequest) => {
      const response = await apiClient.post('/auth/push-token/', tokenData);
      return response.data;
    },
    onError: (error) => {
      console.error('Failed to register FCM token:', error);
    },
  });
};

// Get User Profile Hook
export const useUserProfile = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.get('/auth/profile/');
      return response.data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().updateUser(data);
    },
  });
};

// Auth Helper Functions
export const getAuthError = (error: any): string => {
  if (error.response?.data?.field_errors) {
    const fieldErrors = error.response.data.field_errors;
    const firstError = Object.values(fieldErrors)[0] as string[];
    return firstError[0] || 'Validation error';
  }
  return handleAPIError(error);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const { accessToken, user } = useAuthStore.getState();
  return !!(accessToken && user);
};

// Get current user
export const getCurrentUser = () => {
  return useAuthStore.getState().user;
};
