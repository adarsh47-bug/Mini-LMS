import Constants from 'expo-constants';

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  timeout: 60000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  session: 'session',
  user: 'user_data',
  themePreference: '@app_theme_preference',
  optimisticAvatar: '@optimistic_avatar',
} as const;

// ============================================================================
// APP IDENTITY
// ============================================================================

export const NAME = Constants.expoConfig?.name || 'LMS';
export const LOGO = require('@/assets/images/icon.png');