import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

interface NetworkState {
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
}

export const useNetworkStore = create<NetworkState>()(
  devtools(
    subscribeWithSelector((set) => ({
      isConnected: true,
      setIsConnected: (isConnected) => {
        // if (__DEV__) {
        //   console.log(`🔄 Network: ${isConnected ? 'ONLINE' : 'OFFLINE'}`);
        // }
        set({ isConnected });
      },
    })),
    {
      name: 'network-store',
    }
  )
);
