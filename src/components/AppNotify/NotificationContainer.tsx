import { getTabBarHeight } from '@/src/constants';
import { useNetworkStore } from '@/src/stores';
import { NotificationItem } from '@/src/types';
import { usePathname } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationBanner } from './NotificationBanner';

interface NotificationContainerProps {
  notifications: NotificationItem[];
  dismiss: (id: string) => void;
}

/**
 * NotificationContainer - Renders notifications as banners at the top or bottom of the screen.
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, dismiss }) => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isConnected = useNetworkStore(state => state.isConnected);

  /**
   * Tab Screen Detection Logic
   * works: /, /courses, /bookmarks, /profile
   */
  const isTabScreen = useMemo(
    () => /^\/(courses|bookmarks|profile)?($|\/$)/.test(pathname ?? ''),
    [pathname],
  );

  // Calculate proper bottom offset:
  // - On tab screens: account for tab bar height (base + safe area + offline indicator)
  // - On non-tab screens: just use safe area insets
  const tabBarHeight = isTabScreen ? getTabBarHeight(insets.bottom, isConnected) : 0;

  const hasNotifications = notifications && notifications.length > 0;

  // Don't render if no notifications (performance optimization)
  if (!hasNotifications) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      {notifications.map((n) => {
        const wrappedActions = n.actions?.map((a) => ({
          ...a,
          onPress: () => {
            a.onPress?.();
            dismiss(n.id);
          },
        }));

        const position = n.position ?? 'bottom';

        // Calculate offsets based on position and screen type
        const topOffset = position === 'top' ? insets.top + 16 : undefined;
        // For bottom position on tab screens, position above the entire tab bar
        const bottomOffset = position === 'bottom'
          ? (isTabScreen ? tabBarHeight + 16 : insets.bottom + 16)
          : undefined;

        return (
          <NotificationBanner
            key={n.id}
            visible={true}
            title={n.title}
            variant={n.variant}
            position={position}
            bottomOffset={bottomOffset}
            topOffset={topOffset}
            actions={wrappedActions}
            onPress={() => {
              // fallback: dismiss if no action
              dismiss(n.id);
            }}
          />
        );
      })}
    </View>
  );
};

NotificationContainer.displayName = 'NotificationContainer';
