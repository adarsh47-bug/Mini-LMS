/**
 * Storage Utilities
 *
 * Cross-platform storage helpers that work with SecureStore on native
 * and localStorage on web. For sensitive data, use SecureStore functions.
 * For non-sensitive data, use AsyncStorage functions.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Store a value securely (native) or in localStorage (web)
 * @param key - Storage key
 * @param value - Value to store, or null to remove the item
 */
export async function setStorageItemAsync(key: string, value: string | null): Promise<void> {
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

/**
 * Retrieve a value from secure storage (native) or localStorage (web)
 * @param key - Storage key
 * @returns The stored value or null if not found
 */
export async function getStorageItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

/**
 * Remove a value from storage
 * @param key - Storage key
 */
export async function removeStorageItemAsync(key: string): Promise<void> {
  return setStorageItemAsync(key, null);
}

// ============================================================================
// ASYNC STORAGE (Non-sensitive data)
// ============================================================================

/**
 * Store a value in AsyncStorage (for non-sensitive data like cache)
 * @param key - Storage key
 * @param value - Value to store, or null to remove the item
 */
export async function setAsyncStorageItem(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) {
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error('Failed to set AsyncStorage item:', error);
  }
}

/**
 * Retrieve a value from AsyncStorage
 * @param key - Storage key
 * @returns The stored value or null if not found
 */
export async function getAsyncStorageItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Failed to get AsyncStorage item:', error);
    return null;
  }
}

/**
 * Remove a value from AsyncStorage
 * @param key - Storage key
 */
export async function removeAsyncStorageItem(key: string): Promise<void> {
  return setAsyncStorageItem(key, null);
}
