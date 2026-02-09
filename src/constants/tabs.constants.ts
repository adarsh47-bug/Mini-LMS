/**
 * Offline indicator height constant
 * Used for dynamic padding calculations in components that need to accommodate the indicator
 */
export const OFFLINE_INDICATOR_HEIGHT = 25;

/**
 * Base tab bar height (without safe area or offline indicator)
 */
export const BASE_TAB_BAR_HEIGHT = 50;

/**
 * Get dynamic tab indicator inset based on connection state
 * Call this inside your component where you have access to hooks
 */
export const getTabIndicatorInset = (isConnected: boolean): number => {
  return !isConnected ? OFFLINE_INDICATOR_HEIGHT : 0;
};

/**
 * Calculate total tab bar height including safe area and offline indicator
 * Call this inside your component where you have access to hooks
 * 
 * @param bottomInset - Safe area bottom inset from useSafeAreaInsets()
 * @param isConnected - Network connection state
 */
export const getTabBarHeight = (bottomInset: number, isConnected: boolean): number => {
  const indicatorInset = getTabIndicatorInset(isConnected);
  return BASE_TAB_BAR_HEIGHT + bottomInset + indicatorInset;
};