/**
 * useNotificationHandler Hook
 *
 * Handles notification tap/response events and navigation.
 * Uses the reactive useLastNotificationResponse() hook as recommended
 * by Expo docs to reliably handle cold-start notification taps.
 */

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

/**
 * Navigate based on notification data
 */
function redirect(notification: Notifications.Notification) {
  const data = notification.request.content.data;

  switch (data?.type) {
    case 'bookmark_milestone':
      router.push('/(app)/(tabs)/bookmarks' as any);
      break;

    case 'inactivity_reminder':
      router.push('/(app)/(tabs)/courses' as any);
      break;

    default:
      break;
  }
}

/**
 * Hook to handle notification responses and navigate accordingly.
 */
export function useNotificationHandler() {
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (
      lastResponse &&
      lastResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      redirect(lastResponse.notification);
    }
  }, [lastResponse]);
}
