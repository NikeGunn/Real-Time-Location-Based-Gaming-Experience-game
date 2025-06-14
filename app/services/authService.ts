import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, setAuthToken } from './api';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserRegistrationRequest,
  UserRegistrationResponse,
  FCMTokenRequest,
  FCMTokenResponse,
  UserProfileResponse
} from '../types/user';
import { FirebaseService } from './firebase';

// Login mutation - receives setAuth and setLoading as parameters
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: { credentials: UserLoginRequest, setAuth: any, setLoading: any }): Promise<UserLoginResponse> => {
      const { credentials, setAuth, setLoading } = data;
      setLoading(true);

      try {
        // Get FCM token if available
        const pushToken = await FirebaseService.requestPermissions();

        const requestData = {
          ...credentials,
          push_token: pushToken || undefined,
        };

        const response = await apiClient.post('/auth/login/', requestData);
        const result = response.data;

        // Set auth token for subsequent requests
        setAuthToken(result.access);

        // Update auth store
        setAuth(result.user, result.access, result.refresh);

        return result;
      } finally {
        setLoading(false);
      }
    },
  });
};

// Registration mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: { userData: UserRegistrationRequest, setAuth: any, setLoading: any }): Promise<UserLoginResponse> => {
      const { userData, setAuth, setLoading } = data;
      setLoading(true);

      try {
        // Get FCM token if available
        const pushToken = await FirebaseService.requestPermissions();

        const requestData = {
          ...userData,
          push_token: pushToken || undefined,
        };

        const response = await apiClient.post('/auth/register/', requestData);
        const result = response.data;

        // Set auth token for subsequent requests
        setAuthToken(result.access);

        // Update auth store
        setAuth(result.user, result.access, result.refresh);

        return result;
      } finally {
        setLoading(false);
      }
    },
  });
};

// User profile query
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<UserProfileResponse> => {
      const response = await apiClient.get('/auth/profile/');
      return response.data;
    },
    enabled: false, // Only fetch when explicitly enabled
  });
};

// FCM Token registration
export const useRegisterFCMToken = () => {
  return useMutation({
    mutationFn: async (request: FCMTokenRequest): Promise<FCMTokenResponse> => {
      const response = await apiClient.post('/auth/fcm-token/', request);
      return response.data;
    },
  });
};

// Simple logout function
export const logout = () => {
  setAuthToken(null);
  // Clear any local data if needed
};