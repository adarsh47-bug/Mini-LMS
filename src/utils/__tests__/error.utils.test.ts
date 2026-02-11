/**
 * Error Utils Tests
 */

import { AxiosError } from 'axios';
import { extractErrorMessage } from '../error.utils';

describe('Error Utils', () => {
  describe('extractErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      const message = extractErrorMessage(error, 'Fallback');

      expect(message).toBe('Test error message');
    });

    it('should extract message from AxiosError with response data', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            message: 'API error message',
          },
        },
      } as AxiosError;

      const message = extractErrorMessage(axiosError, 'Fallback');
      expect(message).toBe('API error message');
    });

    it('should use fallback message when no error info available', () => {
      const message = extractErrorMessage(null, 'Fallback message');
      expect(message).toBe('Fallback message');
    });

    it('should handle string errors', () => {
      const message = extractErrorMessage('String error', 'Fallback');
      expect(message).toBe('Fallback');
    });

    it('should handle object with message property', () => {
      const error = { message: 'Object error message' };
      const message = extractErrorMessage(error, 'Fallback');
      expect(message).toBe('Fallback');
    });
  });
});
