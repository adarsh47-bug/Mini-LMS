import { OFFLINE_INDICATOR_HEIGHT } from '@/src/constants';
import { useTheme } from '@/src/context';
import { useNetworkStore } from '@/src/stores';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Offline indicator - YouTube style
 * Shows persistent banner when network is disconnected
 * 
 * Height: 40px (includes padding and icon)
 * Only renders when offline (returns null when connected)
 */
export function OfflineIndicator() {
  const { colors } = useTheme();
  const isConnected = useNetworkStore(state => state.isConnected);

  if (isConnected) {
    return null;
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 z-50">
      <SafeAreaView edges={['bottom']}>
        <View
          style={{ backgroundColor: colors.error, height: OFFLINE_INDICATOR_HEIGHT }}
          className="px-4 flex-row items-center justify-center"
        >
          <MaterialIcons name="wifi-off" size={18} color={colors.white} />
          <Text
            style={{ color: colors.white }}
            className="text-sm font-semibold ml-2"
          >
            No internet connection
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}