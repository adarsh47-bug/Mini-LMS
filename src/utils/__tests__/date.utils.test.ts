/**
 * Date Utils Tests
 */

import {
  formatDate,
  formatDateTime,
  getRelativeTime,
} from '../date.utils';

describe('Date Utils', () => {
  beforeEach(() => {
    // Mock current date to 2024-01-15 12:00:00
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{2}-\d{2}-\d{4}/);
    });

    it('should handle string input', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toBeTruthy();
    });

    it('should handle null/undefined', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const formatted = formatDateTime(date);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle string input', () => {
      const formatted = formatDateTime('2024-01-15T14:30:00Z');
      expect(formatted).toBeTruthy();
    });

    it('should handle null/undefined', () => {
      expect(formatDateTime(null)).toBe('-');
      expect(formatDateTime(undefined)).toBe('-');
    });
  });

  describe('getRelativeTime', () => {
    it('should format relative time', () => {
      const date = new Date('2024-01-15');
      const result = getRelativeTime(date);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should show "Just now" for very recent dates', () => {
      const now = new Date();
      const result = getRelativeTime(now);
      expect(result).toBe('Just now');
    });

    it('should handle string input', () => {
      const result = getRelativeTime('2024-01-15');
      expect(result).toBeTruthy();
    });

    it('should handle null/undefined', () => {
      expect(getRelativeTime(null)).toBe('-');
      expect(getRelativeTime(undefined)).toBe('-');
    });
  });


});
