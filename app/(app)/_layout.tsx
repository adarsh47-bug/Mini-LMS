/**
 * (app) Layout
 *
 * Stack navigator for authenticated screens.
 * All children require a valid session.
 */

import { useTheme } from '@/src/context';
import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
    </Stack>
  );
}
