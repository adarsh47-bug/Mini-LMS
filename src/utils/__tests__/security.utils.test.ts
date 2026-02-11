/**
 * Security Utils Tests
 */

import * as Crypto from 'expo-crypto';
import {
  checkPasswordStrength,
  decryptData,
  encryptData,
  generateEncryptionKey,
  getDeviceSecurityInfo,
  hashString,
  isDeviceCompromised,
  isValidEmail,
  sanitizeInput,
} from '../security.utils';

describe('Security Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isDeviceCompromised', () => {
    it('should return false in development mode', async () => {
      const result = await isDeviceCompromised();
      expect(result).toBe(false);
    });
  });

  describe('getDeviceSecurityInfo', () => {
    it('should return device security information', async () => {
      const info = await getDeviceSecurityInfo();

      expect(info).toHaveProperty('isEmulator');
      expect(info).toHaveProperty('isCompromised');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('osVersion');
      expect(info).toHaveProperty('deviceName');
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a 64-character hex key', async () => {
      (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValueOnce(
        new Uint8Array(32).fill(255)
      );

      const key = await generateEncryptionKey();

      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('hashString', () => {
    it('should hash a string using SHA256', async () => {
      const input = 'test-string';
      const hash = await hashString(input);

      expect(hash).toBe('mocked-hash');
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
        Crypto.CryptoDigestAlgorithm.SHA256,
        input
      );
    });
  });

  describe('encryptData and decryptData', () => {
    it('should encrypt and decrypt data', async () => {
      const originalData = 'sensitive-data';

      const encrypted = await encryptData(originalData);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(originalData);

      const decrypted = await decryptData(encrypted);
      expect(decrypted).toBe(originalData);
    });

    it('should handle encryption with custom key', async () => {
      const data = 'test-data';
      const customKey = 'custom-key-123';

      const encrypted = await encryptData(data, customKey);
      const decrypted = await decryptData(encrypted, customKey);

      expect(decrypted).toBe(data);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).toContain('Hello');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const sanitized = sanitizeInput(input);

      expect(sanitized).toBe('test');
    });

    it('should handle empty string', () => {
      const sanitized = sanitizeInput('');
      expect(sanitized).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should score strong password highly', () => {
      const result = checkPasswordStrength('StrongP@ssw0rd123');

      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.feedback).toHaveLength(0);
    });

    it('should provide feedback for weak password', () => {
      const result = checkPasswordStrength('weak');

      expect(result.score).toBeLessThan(3);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should check password length', () => {
      const result = checkPasswordStrength('short');

      expect(result.feedback).toContain('Password should be at least 8 characters');
    });

    it('should check for uppercase and lowercase', () => {
      const result = checkPasswordStrength('alllowercase123!');

      expect(result.feedback).toContain('Use both uppercase and lowercase letters');
    });

    it('should check for numbers', () => {
      const result = checkPasswordStrength('NoNumbers!');

      expect(result.feedback).toContain('Include at least one number');
    });

    it('should check for special characters', () => {
      const result = checkPasswordStrength('NoSpecialChars123');

      expect(result.feedback).toContain('Include at least one special character');
    });

    it('should give max score for excellent password', () => {
      const result = checkPasswordStrength('ExcellentP@ssw0rd123!');

      expect(result.score).toBe(5);
      expect(result.feedback).toHaveLength(0);
    });
  });
});
