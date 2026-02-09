import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from "react-native";

// Environment type
export type Environment = 'development' | 'production';

// Get current environment
export const ENV: Environment = __DEV__ ? 'development' : 'production';

// App Configuration
export const APP_CONFIG = {
  name: Constants.expoConfig?.name,
  version: Constants.expoConfig?.version,
  bundleId: Platform.select({
    ios: Constants.expoConfig?.ios?.bundleIdentifier,
    android: Constants.expoConfig?.android?.package,
  }),
  scheme: Constants.expoConfig?.scheme,
  baseDomain: 'api.freeapi.app',
  buildNumber: Application?.nativeBuildVersion,
} as const;

// API Configuration
export const API_CONFIG = {
  timeout: 60000, // 60 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  minPasswordLength: 6,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Storage Keys (for secure store and async storage)
export const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  session: 'session',
  user: 'user_data',
  themePreference: '@app_theme_preference',
} as const;


// Export helper to check environment
export const isDevelopment = ENV === 'development';
export const isProduction = ENV === 'production';

// Platform checks
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';


export async function getLastUpdated(): Promise<string | null> {
  try {
    return (await Application.getLastUpdateTimeAsync()).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return null;
  }
}

export const LAST_UPDATED = getLastUpdated();

// Platform Constants
export const PLATFORM = Platform.OS as 'ios' | 'android' | 'web';
export const SOURCE = 'mobile' as const;

// App Name
export const NAME = Constants.expoConfig?.name || 'LMS';

// Assets
export const LOGO = require('@/assets/images/icon.png');

// Loading Indicator Timeout
export const LOADING_TIMEOUT_MS = 60 * 1000; // 60 seconds

// Email Verification Check Timeout
export const AUTO_CHECK_INTERVAL_MS = 3000; // 3 seconds
export const EMAIL_VERIFICATION_CHECK_TIMEOUT_MS = 10 * 1000; // 10 seconds
export const MAX_AUTO_CHECKS = 15;
export const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds