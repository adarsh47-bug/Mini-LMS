/**
 * Network Store Tests
 */

import { useNetworkStore } from '../networkStore';

describe('Network Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useNetworkStore.setState({
      isConnected: true,
    });
  });

  describe('setIsConnected', () => {
    it('should update connection status to offline', () => {
      const { setIsConnected } = useNetworkStore.getState();
      setIsConnected(false);

      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(false);
    });

    it('should update connection status to online', () => {
      useNetworkStore.setState({ isConnected: false });

      const { setIsConnected } = useNetworkStore.getState();
      setIsConnected(true);

      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(true);
    });

    it('should handle multiple status changes', () => {
      const { setIsConnected } = useNetworkStore.getState();

      setIsConnected(false);
      expect(useNetworkStore.getState().isConnected).toBe(false);

      setIsConnected(true);
      expect(useNetworkStore.getState().isConnected).toBe(true);

      setIsConnected(false);
      expect(useNetworkStore.getState().isConnected).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should start with connected state', () => {
      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(true);
    });
  });
});
