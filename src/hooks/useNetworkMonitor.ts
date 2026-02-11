/**
 * Network Monitor Hook
 *
 * Monitors network connectivity and updates the global network store
 */

import { useNetworkStore } from '@/src/stores';
import { logger } from '@/src/utils';
import * as Network from 'expo-network';
import { useEffect } from 'react';

export function useNetworkMonitor() {
  const setIsConnected = useNetworkStore(state => state.setIsConnected);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsConnected(networkState.isConnected ?? true);
      } catch (error) {
        logger.warn('Failed to check network status', { error });
        // Assume connected on error to avoid false negatives
        setIsConnected(true);
      }
    };

    // Check immediately
    checkNetworkStatus();

    intervalId = setInterval(checkNetworkStatus, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [setIsConnected]);
}
