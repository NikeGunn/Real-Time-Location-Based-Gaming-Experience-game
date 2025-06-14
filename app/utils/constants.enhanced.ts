// Game Configuration Constants
export const GAME_CONFIG = {
  ZONE_CAPTURE_RADIUS_METERS: 20,
  ZONE_INTERACTION_RADIUS: 20,
  ZONE_EXPIRY_HOURS: 24,
  ATTACK_COOLDOWN_MINUTES: 30,
  MAX_NEARBY_ZONES: 50,
  DEFAULT_ZONE_XP_VALUE: 10,
  DEFENDER_ADVANTAGE: 20, // Added to defense power
  GRID_SIZE: 0.001, // Degrees for zone grid
  MAX_USER_LEVEL: 100,
  XP_PER_LEVEL: 1000,
};

// Zone size constants
export const ZONE_SIZE = 100; // meters
export const CAPTURE_RADIUS = 50; // meters

// Zone Status Constants
export const ZONE_STATUS = {
  UNCLAIMED: 'unclaimed',
  OWNED: 'owned',
  ENEMY: 'enemy',
} as const;

export const ZONE_COLORS = {
  unclaimed: '#9E9E9E', // Gray
  owned: '#2196F3',     // Blue
  enemy: '#F44336',     // Red
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1', // Development
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ZONE_ATTACK: 'zone_attack',
  BATTLE_RESULT: 'battle_result',
  ZONE_CAPTURED: 'zone_captured',
  LEVEL_UP: 'level_up',
} as const;

// Screen Names
export const SCREEN_NAMES = {
  LOGIN: 'login',
  REGISTER: 'register',
  MAP: 'map',
  PROFILE: 'profile',
  LEADERBOARD: 'leaderboard',
  ATTACK_HISTORY: 'attack-history',
  ZONE_DETAILS: 'zone-details',
} as const;

// Enhanced Colors with UI semantic names
export const COLORS = {
  // Brand colors
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  SUCCESS: '#34C759',
  DANGER: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#5AC8FA',

  // Base colors
  LIGHT: '#F2F2F7',
  DARK: '#1C1C1E',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#8E8E93',
  LIGHT_GRAY: '#F5F5F5',

  // UI semantic colors (aliases for consistency)
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',
  error: '#FF3B30',

  // Background colors
  background: '#FFFFFF',
  surface: '#F8F9FA',

  // Text colors
  text: '#000000',
  textPrimary: '#000000',
  textSecondary: '#6C757D',
  textDisabled: '#ADB5BD',

  // Border colors
  border: '#E9ECEF',
  borderLight: '#F8F9FA',
  borderDark: '#DEE2E6',

  // Status colors
  online: '#34C759',
  offline: '#8E8E93',
  away: '#FF9500',

  // Zone colors
  unclaimed: '#9E9E9E', // Gray
  owned: '#2196F3',     // Blue
  enemy: '#F44336',     // Red

  // Text on colored backgrounds
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  textOnSuccess: '#FFFFFF',
  textOnError: '#FFFFFF',
  textOnWarning: '#000000',
  textOnInfo: '#000000',
};

// Enhanced Typography with common aliases
export const TYPOGRAPHY = {
  // iOS-style typography
  LARGE_TITLE: {
    fontSize: 34,
    fontWeight: 'bold' as const,
  },
  TITLE: {
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  HEADLINE: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  BODY: {
    fontSize: 17,
    fontWeight: 'normal' as const,
  },
  CALLOUT: {
    fontSize: 16,
    fontWeight: 'normal' as const,
  },
  SUBHEAD: {
    fontSize: 15,
    fontWeight: 'normal' as const,
  },
  FOOTNOTE: {
    fontSize: 13,
    fontWeight: 'normal' as const,
  },
  CAPTION: {
    fontSize: 12,
    fontWeight: 'normal' as const,
  },

  // Common aliases for easier use
  h1: {
    fontSize: 34,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 17,
    fontWeight: 'normal' as const,
  },
  bodySmall: {
    fontSize: 15,
    fontWeight: 'normal' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

// Enhanced Spacing with more granular options
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,

  // Aliases for easier use
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Component-specific spacing
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 16,
};

// Border Radius
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  ROUND: 999,

  // Aliases
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 16,
  round: 999,
};

// Shadow configurations
export const SHADOW = {
  SMALL: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  MEDIUM: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  LARGE: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// Z-Index values
export const Z_INDEX = {
  MODAL: 1000,
  OVERLAY: 900,
  DROPDOWN: 800,
  HEADER: 700,
  FIXED: 600,
  DEFAULT: 1,
};

// Device breakpoints (for responsive design)
export const BREAKPOINTS = {
  SMALL: 320,
  MEDIUM: 768,
  LARGE: 1024,
  EXTRA_LARGE: 1200,
};

// Game-specific constants
export const GAME_CONSTANTS = {
  MIN_ATTACK_POWER: 10,
  MAX_ATTACK_POWER: 100,
  MIN_DEFENSE_POWER: 5,
  MAX_DEFENSE_POWER: 80,
  XP_MULTIPLIER: 1.5,
  LEVEL_UP_BONUS_XP: 100,
  ZONE_OWNERSHIP_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  ATTACK_COOLDOWN_MS: 30 * 60 * 1000, // 30 minutes
};
