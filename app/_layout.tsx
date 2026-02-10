/**
 * Root Layout
 *
 * Wraps the entire app in SessionProvider (auth), ThemeProvider (theming),
 * NotificationProvider (unified notifications), and ErrorBoundary for error handling.
 * Uses Stack.Protected to redirect based on auth state per Expo Router pattern.
 */

import { ErrorBoundary, NetworkChangeNotification, NotificationContainer, OfflineIndicator } from '@/src/components';
import { NotificationProvider, SessionProvider, ThemeProvider, useNotification, useSession, useTheme } from '@/src/context';
import { useNetworkMonitor } from '@/src/hooks';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

// Keep splash screen visible until auth state is loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider>
            <NotificationProvider>
              <SessionProvider>
                <SplashScreenController />
                <RootNavigator />
                <GlobalUIComponents />
              </SessionProvider>
            </NotificationProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

/** 
 * Hides splash screen once auth loading completes with a small delay
 * to prevent flash of wrong screen during navigation
 */
function SplashScreenController() {
  const { isLoading, session } = useSession();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure navigation has completed before hiding splash
      const timeout = setTimeout(() => {
        setIsReady(true);
        SplashScreen.hideAsync();
      }, 150);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, session]);

  return null;
}

/** Protected route navigator — redirects based on auth state */
function RootNavigator() {
  const { session, isLoading } = useSession();
  const { colors } = useTheme();

  // Prevent rendering routes until auth state is determined
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

/** 
 * Global UI Components
 * Renders app-wide UI elements like notifications and network status indicators
 */
function GlobalUIComponents() {
  const { notifications, dismiss } = useNotification();

  // Monitor network connectivity
  useNetworkMonitor();

  return (
    <>
      {/* App-wide notifications */}
      <NotificationContainer notifications={notifications} dismiss={dismiss} />

      {/* Network status indicators */}
      <NetworkChangeNotification />
      <OfflineIndicator />
    </>
  );
}
