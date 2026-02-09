/**
 * (auth) Layout
 *
 * Stack navigator for unauthenticated screens:
 * index (Intro) → login → register
 */

import { useTheme } from '@/src/context';
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ gestureEnabled: false, title: 'Welcome' }}
      />
      <Stack.Screen
        name="login"
        options={{ gestureEnabled: true, title: 'Sign In' }}
      />
      <Stack.Screen
        name="register"
        options={{ gestureEnabled: true, title: 'Create Account' }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ gestureEnabled: true, title: 'Forgot Password' }}
      />
    </Stack>
  );
}
