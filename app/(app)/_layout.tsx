/**
 * (app) Layout
 *
 * Stack navigator for authenticated screens.
 * Contains tabs group and stack-pushed screens (course detail, webview, etc.)
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="course/[id]" options={{ title: 'Course Detail' }} />
      <Stack.Screen name="enrolled" options={{ title: 'My Courses' }} />
      <Stack.Screen name="webview" options={{ title: 'Course Content' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
    </Stack>
  );
}
