/**
 * Notification Context
 *
 * Unified global notification system for app-wide notifications.
 * Provides both persistent actionable notifications and quick toast-style feedback.
 * Replaces the separate toast system with a single, consistent API.
 */

import { NotificationItem, NotificationPayload, NotificationVariant } from '@/src/types';
import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface NotificationContextType {
  /** Current active notifications */
  notifications: NotificationItem[];
  /** Show a notification with full configuration */
  showNotification: (payload: NotificationPayload) => void;
  /** Dismiss a specific notification by id */
  dismiss: (id: string) => void;
  /** Dismiss all active notifications */
  dismissAll: () => void;
  /** Convenience: show a success notification */
  success: (title: string, duration?: number) => void;
  /** Convenience: show an error notification */
  error: (title: string, duration?: number) => void;
  /** Convenience: show a warning notification */
  warning: (title: string, duration?: number) => void;
  /** Convenience: show an info notification */
  info: (title: string, duration?: number) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ============================================================================
// HOOK
// ============================================================================

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Clear any pending auto-dismiss timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    // Clear all pending timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setNotifications([]);
  }, []);

  const showNotification = useCallback((payload: NotificationPayload) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const duration = payload.duration ?? 4000;
    const notification: NotificationItem = {
      id,
      title: payload.title,
      variant: payload.variant || 'custom',
      duration,
      position: payload.position || 'top',
      actions: payload.actions || [],
      meta: payload.meta || {},
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-dismiss after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);
      timersRef.current.set(id, timer);
    }
  }, [dismiss]);

  // Convenience methods for common notification types
  const showQuick = useCallback(
    (variant: NotificationVariant, title: string, duration?: number) => {
      showNotification({
        title,
        variant,
        duration: duration ?? (variant === 'error' ? 5000 : 3500),
        position: 'top',
      });
    },
    [showNotification],
  );

  const success = useCallback(
    (title: string, duration?: number) => showQuick('success', title, duration),
    [showQuick],
  );

  const error = useCallback(
    (title: string, duration?: number) => showQuick('error', title, duration),
    [showQuick],
  );

  const warning = useCallback(
    (title: string, duration?: number) => showQuick('warning', title, duration),
    [showQuick],
  );

  const info = useCallback(
    (title: string, duration?: number) => showQuick('info', title, duration),
    [showQuick],
  );

  const value = useMemo(
    () => ({
      notifications,
      showNotification,
      dismiss,
      dismissAll,
      success,
      error,
      warning,
      info,
    }),
    [notifications, showNotification, dismiss, dismissAll, success, error, warning, info]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
