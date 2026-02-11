/**
 * Axios API Client
 *
 * Centralized HTTP client with interceptors for auth token injection,
 * automatic token refresh on 401, retry logic with exponential backoff,
 * and request deduplication to prevent concurrent duplicate requests.
 */

import { RETRY, STORAGE_KEYS, TIMEOUTS } from '@/src/constants';
import { logger, setStorageItemAsync } from '@/src/utils';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ========================================
// Base client setup
// ========================================

import { env } from '@/src/config/env';

const BASE_URL = env.apiBaseUrl;

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
  timeout: TIMEOUTS.API_DEFAULT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================
// Request deduplication
// ==========================================================================

/** Active request cache: key = URL + method + params, value = Promise */
const activeRequests = new Map<string, Promise<AxiosResponse>>();

/**
 * Generate a unique key for request deduplication
 */
function getRequestKey(config: InternalAxiosRequestConfig): string {
  const { method = 'get', url = '', params } = config;
  const paramsStr = params ? JSON.stringify(params) : '';
  return `${method.toUpperCase()}:${url}:${paramsStr}`;
}

// ========================================
// Token helpers
// ========================================

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

// ========================================
// Request interceptor: Attach auth token
// ========================================

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}[] = [];

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
    // Attach access token
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log API request in development
    logger.api(config.method?.toUpperCase() || 'GET', config.url || '', config.data);

    // Request deduplication for GET requests only
    if (config.method?.toLowerCase() === 'get') {
      const requestKey = getRequestKey(config);
      const activeRequest = activeRequests.get(requestKey);

      if (activeRequest) {
        logger.debug('Deduplicating request', { url: config.url });
        // Return the existing request promise instead of making a new one
        throw { isDeduped: true, promise: activeRequest };
      }
    }

    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  },
);

// ========================================
// Response interceptor: Auto refresh on 401
// ========================================

apiClient.interceptors.response.use(
  (response) => {
    // Clean up deduplication cache for successful requests
    if (response.config.method?.toLowerCase() === 'get') {
      const requestKey = getRequestKey(response.config);
      activeRequests.delete(requestKey);
    }

    // Log successful response in development
    logger.api(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.config.data,
      response.data,
    );

    return response;
  },
  async (error: AxiosError) => {
    // Handle deduped requests
    if ((error as unknown as { isDeduped?: boolean; promise?: Promise<AxiosResponse> }).isDeduped) {
      const dedupedError = error as unknown as { promise: Promise<AxiosResponse> };
      return dedupedError.promise;
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Clean up deduplication cache for failed GET requests
    if (originalRequest?.method?.toLowerCase() === 'get') {
      const requestKey = getRequestKey(originalRequest);
      activeRequests.delete(requestKey);
    }

    // Log error response
    logger.error('API request failed', error, {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
    });

    // If 401 and not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        logger.debug('Queueing request while token refresh in progress');
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
        logger.info('Attempting to refresh access token');
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

          logger.info('Successfully refreshed access token');
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }

        throw new Error('Failed to refresh token');
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError as Error);
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

// ========================================
// Retry interceptor: Transient failures
// ========================================

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

    if (retryCount >= RETRY.MAX_ATTEMPTS) {
      logger.warn('Max retry attempts reached', {
        url: config.url,
        attempts: retryCount,
      });
      return Promise.reject(error);
    }

    config._retryCount = retryCount + 1;

    // Exponential backoff: BASE_DELAY * MULTIPLIER^retryCount
    const backoff = RETRY.BASE_DELAY * Math.pow(RETRY.BACKOFF_MULTIPLIER, retryCount);

    logger.info(`Retrying request (attempt ${config._retryCount}/${RETRY.MAX_ATTEMPTS})`, {
      url: config.url,
      backoff,
    });

    await delay(backoff);

    return apiClient(config);
  },
);
