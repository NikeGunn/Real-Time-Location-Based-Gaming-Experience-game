import axios, { AxiosResponse } from 'axios';
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

// Function to set auth token (called from outside)
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Simple response interceptor for now
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors by redirecting to login
    if (error.response?.status === 401) {
      // The auth store will handle clearing auth state
      console.log('401 Unauthorized - need to login');
    }
    return Promise.reject(error);
  }
);

// Export API configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Helper function to get auth headers
export const getAuthHeaders = (token: string) => ({
  ...API_CONFIG.HEADERS,
  'Authorization': `Bearer ${token}`
});
