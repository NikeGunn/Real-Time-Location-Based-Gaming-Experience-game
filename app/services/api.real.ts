import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8000/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      data: config.data,
      headers: config.headers
    });

    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user!,
            access,
            refreshToken
          );

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        // Navigate to login screen would be handled by navigation
      }
    }

    return Promise.reject(error);
  }
);

// API Error Types
export interface APIErrorResponse {
  error: string;
  details?: string;
  field_errors?: Record<string, string[]>;
  status_code: number;
}

// Utility function to handle API errors
export const handleAPIError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.details) {
    return error.response.data.details;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
