/**
 * Axios API Client
 *
 * Centralized HTTP client with interceptors for auth token injection,
 * automatic token refresh on 401, and retry logic.
 */

import { API_CONFIG, STORAGE_KEYS } from '@/src/constants';
import { setStorageItemAsync } from '@/src/utils';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ============================================================================
// BASE CLIENT
// ============================================================================

const BASE_URL = 'https://api.freeapi.app/api/v1';

/** Status codes that should trigger a retry */
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

/** Check if an error is retryable (network error or server error) */
function isRetryableError(error: AxiosError): boolean {
  // Network errors (no response)
  if (!error.response) return true;
  // Server errors
  return RETRYABLE_STATUS_CODES.has(error.response.status);
}

/** Delay helper for retry backoff */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// TOKEN HELPERS (reads use SecureStore directly, writes use shared utility)
// ============================================================================

async function getToken(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function getAccessToken(): Promise<string | null> {
  return getToken(STORAGE_KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return getToken(STORAGE_KEYS.refreshToken);
}

export async function setAccessToken(token: string | null): Promise<void> {
  return setStorageItemAsync(STORAGE_KEYS.accessToken, token);
}

export async function setRefreshToken(token: string | null): Promise<void> {
  return setStorageItemAsync(STORAGE_KEYS.refreshToken, token);
}

export async function clearTokens(): Promise<void> {
  await setStorageItemAsync(STORAGE_KEYS.accessToken, null);
  await setStorageItemAsync(STORAGE_KEYS.refreshToken, null);
  await setStorageItemAsync(STORAGE_KEYS.user, null);
  await setStorageItemAsync(STORAGE_KEYS.session, null);
}

// ============================================================================
// REQUEST INTERCEPTOR — Attach access token
// ============================================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================================
// RESPONSE INTERCEPTOR — Auto refresh on 401
// ============================================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(`${BASE_URL}/users/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = data?.data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken;

        if (newAccessToken) {
          await setAccessToken(newAccessToken);
          if (newRefreshToken) {
            await setRefreshToken(newRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }

        throw new Error('Failed to refresh token');
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens — user must re-login
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ============================================================================
// RESPONSE INTERCEPTOR — Retry on transient failures (5xx / network errors)
// ============================================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _retryCount?: number;
      _retry?: boolean;
    };

    // Skip retry for auth refresh failures or non-retryable errors
    if (!config || config._retry || !isRetryableError(error)) {
      return Promise.reject(error);
    }

    const retryCount = config._retryCount ?? 0;

    if (retryCount >= API_CONFIG.retryAttempts) {
      return Promise.reject(error);
    }

    config._retryCount = retryCount + 1;

    // Exponential backoff: retryDelay * 2^retryCount
    const backoff = API_CONFIG.retryDelay * Math.pow(2, retryCount);
    await delay(backoff);

    return apiClient(config);
  },
);
