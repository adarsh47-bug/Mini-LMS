/**
 * Axios API Client
 *
 * Centralized HTTP client with interceptors for auth token injection,
 * automatic token refresh on 401, and retry logic.
 */

import { STORAGE_KEYS, API_CONFIG } from '@/src/constants';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ============================================================================
// BASE CLIENT
// ============================================================================

const BASE_URL = 'https://api.freeapi.app/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// TOKEN HELPERS
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

async function setToken(key: string, value: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return;
  }
  if (value === null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return getToken(STORAGE_KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return getToken(STORAGE_KEYS.refreshToken);
}

export async function setAccessToken(token: string | null): Promise<void> {
  return setToken(STORAGE_KEYS.accessToken, token);
}

export async function setRefreshToken(token: string | null): Promise<void> {
  return setToken(STORAGE_KEYS.refreshToken, token);
}

export async function clearTokens(): Promise<void> {
  await setToken(STORAGE_KEYS.accessToken, null);
  await setToken(STORAGE_KEYS.refreshToken, null);
  await setToken(STORAGE_KEYS.user, null);
  await setToken(STORAGE_KEYS.session, null);
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
