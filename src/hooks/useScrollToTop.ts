/**
 * useScrollToTop Hook
 *
 * Enables automatic scroll-to-top behavior when the current tab is pressed.
 * Works with ScrollView, FlatList, and other scrollable components.
 */

import { useScrollToTop as useExpoScrollToTop } from '@react-navigation/native';
import { useRef } from 'react';

export function useScrollToTop<T = any>() {
  const scrollRef = useRef<T>(null);

  // Expo Router's built-in scroll to top on tab press
  useExpoScrollToTop(scrollRef as any);

  return scrollRef;
}
