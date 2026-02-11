/**
 * Security utilities: encryption, jailbreak detection
 */

import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { logger } from './logger.utils';

// Jailbreak/root detection

export async function isDeviceCompromised(): Promise<boolean> {
  if (__DEV__) {
    // Skip check in development
    return false;
  }

  if (Platform.OS === 'ios') {
    return checkJailbreak();
  } else if (Platform.OS === 'android') {
    return checkRoot();
  }

  return false;
}

/** iOS jailbreak detection */
function checkJailbreak(): boolean {
  // Check for common jailbreak files/paths
  // Note: This is a basic check and can be bypassed
  const suspicious = [
    '/Applications/Cydia.app',
    '/Library/MobileSubstrate/MobileSubstrate.dylib',
    '/bin/bash',
    '/usr/sbin/sshd',
    '/etc/apt',
    '/private/var/lib/apt/',
  ];

  // In React Native, we can't directly check file existence
  // This would require a native module
  // For now, return false and recommend using a native module like jail-monkey
  return false;
}

/** Android root detection */
function checkRoot(): boolean {
  // Check for common root files/paths
  // Note: This is a basic check and can be bypassed
  const suspicious = [
    '/system/app/Superuser.apk',
    '/sbin/su',
    '/system/bin/su',
    '/system/xbin/su',
    '/data/local/xbin/su',
    '/data/local/bin/su',
    '/system/sd/xbin/su',
    '/system/bin/failsafe/su',
    '/data/local/su',
  ];

  // In React Native, we can't directly check file existence
  // This would require a native module
  // For now, return false and recommend using a native module like jail-monkey
  return false;
}

/**
 * Get device security info
 */
export async function getDeviceSecurityInfo() {
  return {
    isEmulator: !Device.isDevice,
    isCompromised: await isDeviceCompromised(),
    platform: Platform.OS,
    osVersion: Platform.Version,
    deviceName: Device.deviceName,
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
  };
}

// Encryption utilities

/** Generate random encryption key */
export async function generateEncryptionKey(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map((byte) => (byte as number).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a string using SHA256
 */
export async function hashString(input: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
}

/**
 * Encrypt sensitive data before storing
 * Note: For production, consider using a more robust encryption library
 */
export async function encryptData(data: string, key?: string): Promise<string> {
  // For web and basic encryption, we'll use base64 encoding combined with a simple XOR
  // For production, use a proper encryption library like crypto-js or native modules

  const encryptionKey = key || (await getOrCreateEncryptionKey());
  const hash = await hashString(encryptionKey);

  // Simple XOR encryption (NOT PRODUCTION READY - use proper encryption)
  const encrypted = xorEncrypt(data, hash);
  return Buffer.from(encrypted).toString('base64');
}

/**
 * Decrypt sensitive data
 */
export async function decryptData(encryptedData: string, key?: string): Promise<string> {
  const encryptionKey = key || (await getOrCreateEncryptionKey());
  const hash = await hashString(encryptionKey);

  const encrypted = Buffer.from(encryptedData, 'base64').toString();
  return xorEncrypt(encrypted, hash);
}

/**
 * Simple XOR encryption (for demo purposes - use proper encryption in production)
 */
function xorEncrypt(data: string, key: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Get or create app-specific encryption key
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  const KEY_NAME = 'app_encryption_key';

  try {
    let key = await SecureStore.getItemAsync(KEY_NAME);

    if (!key) {
      key = await generateEncryptionKey();
      await SecureStore.setItemAsync(KEY_NAME, key);
    }

    return key;
  } catch (error) {
    logger.error('Failed to get encryption key', error);
    // Fallback to device-specific key
    return await hashString(
      Application.applicationId || 'fallback-key'
    );
  }
}

// ============================================================================
// SECURE STORAGE HELPERS
// ============================================================================

/**
 * Securely store encrypted data
 */
export async function secureStoreData(
  key: string,
  data: string
): Promise<void> {
  const encrypted = await encryptData(data);
  await SecureStore.setItemAsync(key, encrypted);
}

/**
 * Retrieve and decrypt stored data
 */
export async function secureRetrieveData(
  key: string
): Promise<string | null> {
  const encrypted = await SecureStore.getItemAsync(key);

  if (!encrypted) {
    return null;
  }

  try {
    return await decryptData(encrypted);
  } catch (error) {
    logger.error('Failed to decrypt data', error, { key });
    return null;
  }
}

// ============================================================================
// BIOMETRIC / DEVICE AUTHENTICATION
// ============================================================================

/**
 * Check if device supports biometric authentication
 */
export async function supportsBiometrics(): Promise<boolean> {
  try {
    const result = await SecureStore.getItemAsync('_biometric_test', {
      requireAuthentication: true,
    });
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Use both uppercase and lowercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Include at least one number');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Include at least one special character');

  return { score, feedback };
}
