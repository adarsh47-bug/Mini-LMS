import { getThemeColors, STORAGE_KEYS, type ColorTheme, type ThemeMode } from '@/src/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName, Platform } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

/** Theme preference types - what user selected */
type ThemePreference = 'light' | 'dark' | 'system';

/** Theme context value */
interface ThemeContextType {
  /** Current theme colors based on active mode */
  colors: ColorTheme;
  /** Active theme mode (light or dark) */
  mode: ThemeMode;
  /** User's theme preference (light, dark, or system) */
  preference: ThemePreference;
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
  /** Set specific theme mode (updates preference) */
  setThemeMode: (mode: ThemeMode) => void;
  /** Set theme preference (light, dark, or system) */
  setThemePreference: (preference: ThemePreference) => void;
  /** Whether user is using system theme */
  isSystemTheme: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // State
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Memoized colors based on current mode
  const colors = useMemo(() => getThemeColors(mode), [mode]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  /** Get system color scheme */
  const getSystemTheme = useCallback((): ThemeMode => {
    const colorScheme: ColorSchemeName = Appearance.getColorScheme();
    return colorScheme === 'dark' ? 'dark' : 'light';
  }, []);

  /** Save theme preference to AsyncStorage */
  const saveThemePreference = useCallback(async (pref: ThemePreference) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.themePreference, pref);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Non-critical error - app continues to function
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /** Load saved theme preference on mount */
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(STORAGE_KEYS.themePreference);
        if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
          const pref = savedPreference as ThemePreference;
          setPreference(pref);
          setMode(pref === 'system' ? getSystemTheme() : pref);
        } else {
          // Default to system theme
          setMode(getSystemTheme());
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setMode(getSystemTheme());
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, [getSystemTheme]);

  /** Listen to system theme changes when preference is 'system' */
  useEffect(() => {
    if (preference !== 'system') return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const newMode = colorScheme === 'dark' ? 'dark' : 'light';
      setMode(newMode);
    });

    return () => subscription.remove();
  }, [preference]);

  /** Update navigation bar styling (Android only) */
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('visible');
      NavigationBar.setButtonStyleAsync(mode === 'light' ? 'dark' : 'light');
    }
  }, [mode]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /** Toggle between light and dark mode */
  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    setPreference(newMode);
    saveThemePreference(newMode);
  }, [mode, saveThemePreference]);

  /** Set specific theme mode */
  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    setPreference(newMode);
    saveThemePreference(newMode);
  }, [saveThemePreference]);

  /** Set theme preference (light, dark, or system) */
  const setThemePreferenceHandler = useCallback((pref: ThemePreference) => {
    setPreference(pref);
    saveThemePreference(pref);
    setMode(pref === 'system' ? getSystemTheme() : pref);
  }, [getSystemTheme, saveThemePreference]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo<ThemeContextType>(
    () => ({
      colors,
      mode,
      preference,
      toggleTheme,
      setThemeMode,
      setThemePreference: setThemePreferenceHandler,
      isSystemTheme: preference === 'system',
    }),
    [colors, mode, preference, toggleTheme, setThemeMode, setThemePreferenceHandler]
  );

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} translucent />
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access theme context
 * @throws {Error} If used outside ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
