// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  level: number;
  xp: number;
  zones_owned: number;
  attack_power: number;
  push_token?: string;
  created_at: string;
  updated_at?: string;
}

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

export interface UserRegistrationResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface UserLoginResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

export interface UserProfileResponse extends User {}

export interface FCMTokenRequest {
  push_token: string;
  device_type?: 'ios' | 'android' | 'web';
}

export interface FCMTokenResponse {
  success: boolean;
  message: string;
}
