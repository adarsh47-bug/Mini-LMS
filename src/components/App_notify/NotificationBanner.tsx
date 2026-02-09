import { useTheme } from '@/src/context';
import { NotificationItem } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface NotificationBannerProps extends Partial<NotificationItem> {
  visible: boolean;
  onPress?: () => void; // optional default action
  bottomOffset?: number;
  topOffset?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ visible, title, variant = 'custom', actions = [], onPress, bottomOffset, topOffset, position = 'top' }) => {
  const { colors } = useTheme();

  const bannerAnimatedStyle = useAnimatedStyle(() => {
    const isEntering = visible;
    const easing = isEntering ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic);

    return {
      opacity: withTiming(visible ? 1 : 0, {
        duration: 300,
        easing
      }),
      transform: [
        {
          translateY: withTiming(
            visible ? 0 : (position === 'top' ? -24 : 24),
            {
              duration: 300,
              easing
            }
          ),
        },
      ],
    };
  });

  // Map variants to appropriate icons for visual clarity
  const iconMap: Record<string, string> = {
    save: 'bookmark',
    archive: 'archive',
    delete: 'trash-outline',
    success: 'checkmark-circle',
    error: 'alert-circle',
    warning: 'warning-outline',
    info: 'information-circle-outline',
    custom: 'notifications-outline',
  };
  const iconName = iconMap[variant] || 'notifications-outline';

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          ...(position === 'bottom' ? { bottom: bottomOffset ?? 8 } : { top: topOffset ?? 8 }),
          left: 8,
          right: 8,
          zIndex: 100,
        },
        bannerAnimatedStyle,
      ]}
      // Allow pointer events only on the banner itself, not the container
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: colors.backgroundSecondary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Ionicons name={iconName as any} size={18} color={colors.text} />
        <Text
          accessible
          accessibilityRole="text"
          style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8, flexShrink: 1 }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {actions?.length > 0 && actions.map((a, i) => (
          <TouchableOpacity
            key={i}
            onPress={a.onPress ?? onPress}
            activeOpacity={0.6}
            style={{ marginLeft: 6, paddingHorizontal: 10, flexShrink: 0 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={a.label}
          >
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

NotificationBanner.displayName = 'NotificationBanner';
