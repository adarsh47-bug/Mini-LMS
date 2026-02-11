import { useTheme } from '@/src/context';
import { useNetworkStore } from '@/src/stores';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * YouTube-style "Back Online" notification
 * Shows when connection is restored after being offline.
 * Uses react-native-reanimated for consistent animation approach.
 */
export const NetworkChangeNotification: React.FC = () => {
  const { colors } = useTheme();
  const isConnected = useNetworkStore(state => state.isConnected);
  const [showNotification, setShowNotification] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const translateY = useSharedValue(-100);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const hide = useCallback(() => {
    translateY.value = withTiming(-100, { duration: 300 });
    // Dismiss notification after animation completes
    setTimeout(() => setShowNotification(false), 300);
  }, [translateY]);

  const show = useCallback(() => {
    setShowNotification(true);
    translateY.value = withTiming(0, { duration: 300 });

    // Auto-hide after 4 seconds
    timeoutRef.current = setTimeout(hide, 4000) as unknown as NodeJS.Timeout;
  }, [translateY, hide]);

  useEffect(() => {
    if (!isConnected) {
      setWasOffline(true);
      setShowNotification(false);
    } else if (wasOffline && isConnected) {
      show();
      setWasOffline(false);
    }
  }, [isConnected, wasOffline, show]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        },
        animatedStyle,
      ]}
    >
      <SafeAreaView edges={['top']}>
        <View
          style={{ backgroundColor: colors.success }}
          className="mx-4 mt-2 rounded-lg shadow-lg"
        >
          <View
            className="px-4 py-3 flex-row items-center justify-between"
            accessible
            accessibilityRole="alert"
            accessibilityLabel="You're back online!"
            accessibilityLiveRegion="polite"
          >
            <View className="flex-row items-center flex-1">
              <MaterialIcons name="wifi" size={18} color={colors.white} />
              <Text
                style={{ color: colors.white }}
                className="text-sm font-medium ml-2"
                accessible={false}
              >
                You&apos;re back online!
              </Text>
            </View>

            <Pressable
              onPress={hide}
              className="ml-3 p-1"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              accessibilityHint="Closes the back online notification"
            >
              <MaterialIcons name="close" size={18} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};
