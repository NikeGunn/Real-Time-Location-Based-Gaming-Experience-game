import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, setAuthToken } from './api';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserRegistrationRequest,
  UserRegistrationResponse,
  UserProfileResponse
} from '../types/user';

// Simple login function without complex dependencies
export const loginUser = async (credentials: UserLoginRequest): Promise<UserLoginResponse> => {
  const response = await apiClient.post('/auth/login/', credentials);
  return response.data;
};

// Simple register function
export const registerUser = async (userData: UserRegistrationRequest): Promise<UserLoginResponse> => {
  const response = await apiClient.post('/auth/register/', userData);
  return response.data;
};

// Simple profile fetch
export const fetchUserProfile = async (token: string): Promise<UserProfileResponse> => {
  setAuthToken(token);
  const response = await apiClient.get('/auth/profile/');
  return response.data;
};

// Simple logout function
export const logoutUser = async () => {
  setAuthToken(null);
  // Could call logout endpoint here if needed
};
