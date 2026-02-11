/**
 * Storage Utils Tests
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  getStorageItemAsync,
  removeStorageItemAsync,
  setStorageItemAsync,
} from '../storage.utils';

describe('Storage Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setStorageItemAsync', () => {
    it('should set item in SecureStore on native', async () => {
      Platform.OS = 'ios';

      await setStorageItemAsync('test-key', 'test-value');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should delete item when value is null', async () => {
      Platform.OS = 'ios';

      await setStorageItemAsync('test-key', null);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('test-key');
    });

    it('should use localStorage on web', async () => {
      Platform.OS = 'web';
      const mockLocalStorage = {
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      global.localStorage = mockLocalStorage as any;

      await setStorageItemAsync('test-key', 'test-value');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });
  });

  describe('getStorageItemAsync', () => {
    it('should get item from SecureStore on native', async () => {
      Platform.OS = 'ios';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-value');

      const value = await getStorageItemAsync('test-key');

      expect(value).toBe('stored-value');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('test-key');
    });

    it('should get item from localStorage on web', async () => {
      Platform.OS = 'web';
      const mockLocalStorage = {
        getItem: jest.fn(() => 'web-value'),
      };
      global.localStorage = mockLocalStorage as any;

      const value = await getStorageItemAsync('test-key');

      expect(value).toBe('web-value');
    });
  });

  describe('removeStorageItemAsync', () => {
    it('should remove item from SecureStore on native', async () => {
      Platform.OS = 'ios';

      await removeStorageItemAsync('test-key');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('test-key');
    });

    it('should remove item from localStorage on web', async () => {
      Platform.OS = 'web';
      const mockLocalStorage = {
        removeItem: jest.fn(),
      };
      global.localStorage = mockLocalStorage as any;

      await removeStorageItemAsync('test-key');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });
});
