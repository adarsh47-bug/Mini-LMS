/**
 * Environment Configuration
 *
 * Centralized environment variable access with type safety and validation.
 * All env vars must be prefixed with EXPO_PUBLIC_ to be accessible in the app.
 */

import Constants from 'expo-constants';

interface EnvConfig {
  // API
  apiBaseUrl: string;
  apiTimeout: number;

  // App
  env: 'development' | 'staging' | 'production';
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  const value = Constants.expoConfig?.extra?.[key] || process.env[key];
  return value !== undefined ? String(value) : defaultValue;
}

/**
 * Validated environment configuration
 */
export const env: EnvConfig = {
  // API
  apiBaseUrl: getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'https://api.freeapi.app/api/v1'),
  apiTimeout: parseInt(getEnvVar('EXPO_PUBLIC_API_TIMEOUT', '60000'), 10),

  // App
  env: (getEnvVar('EXPO_PUBLIC_ENV', 'development') as EnvConfig['env']),
};

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required: (keyof EnvConfig)[] = ['apiBaseUrl'];

  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

/**
 * Check if running in development mode
 */
export const isDevelopment = env.env === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.env === 'production';

/**
 * Check if running in staging mode
 */
export const isStaging = env.env === 'staging';
