/**
 * Network Monitor Hook
 *
 * Monitors network connectivity and updates the global network store
 */

import { useNetworkStore } from '@/src/stores';
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
        console.warn('Failed to check network status:', error);
        // Assume connected on error to avoid false negatives
        setIsConnected(true);
      }
    };

    // Check immediately
    checkNetworkStatus();

    // Poll every 3 seconds
    intervalId = setInterval(checkNetworkStatus, 3000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [setIsConnected]);
}
