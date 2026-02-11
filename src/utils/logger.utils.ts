/**
 * Centralized logger - prevents console logs in production
 * @example
 * ```typescript
 * logger.debug('msg', { userId: 123 });
 * logger.error('Failed', error, { endpoint: '/api' });
 * ```
 */

import { isDevelopment } from '@/src/config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Additional context data to attach to logs */
interface LogContext {
  [key: string]: unknown;
}

/**
 * Centralized logger with environment-aware behavior
 */
class Logger {
  private isDevelopment = isDevelopment;
  private prefix = '[MLMS]';

  /** Dev-only debug logs */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`${this.prefix} [DEBUG]`, message, context || '');
    }
  }

  /**
   * Log informational messages (development only)
   * 
   * Use for general informational messages about app flow.
   * These logs are stripped in production builds.
   * 
   * @param message - Informational message
   * @param context - Optional additional context
   * 
   * @example
   * ```typescript
   * logger.info('Processing payment', { orderId: 'ORD-123' });\n * logger.info('User logged in successfully');
   * ```
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`${this.prefix} [INFO]`, message, context || '');
    }
  }

  /** Warning logs (always shown) */
  warn(message: string, context?: LogContext): void {
    console.warn(`${this.prefix} [WARN]`, message, context || '');
  }

  /** Error logs with optional Sentry integration */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    console.error(`${this.prefix} [ERROR]`, message, {
      error: errorDetails,
      ...context,
    });


  }

  /** Log API requests/responses (dev only) */
  api(method: string, url: string, data?: unknown, response?: unknown): void {
    if (this.isDevelopment) {
      console.group(`${this.prefix} [API] ${method} ${url}`);
      if (data) console.log('Request:', data);
      if (response) console.log('Response:', response);
      console.groupEnd();
    }
  }

  /** Track navigation (dev only) */
  navigation(screen: string, params?: unknown): void {
    if (this.isDevelopment) {
      console.log(`${this.prefix} [NAV] → ${screen}`, params || '');
    }
  }

  /** Log performance metrics (dev only) */
  perf(label: string, duration: number): void {
    if (this.isDevelopment) {
      console.log(`${this.prefix} [PERF] ${label}: ${duration.toFixed(2)}ms`);
    }
  }
}

export const logger = new Logger();

/** Measure sync function performance */
export function measurePerformance<T>(
  label: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  logger.perf(label, duration);
  return result;
}

/** Measure async function performance */
export async function measurePerformanceAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  logger.perf(label, duration);
  return result;
}
