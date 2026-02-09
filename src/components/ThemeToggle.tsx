/**
 * ThemeToggle
 *
 * A compact theme switcher (icon or segmented control).
 * NativeWind for layout, theme-context for colors.
 */

import { useTheme } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

type ThemeToggleVariant = 'icon' | 'segmented';

interface ThemeToggleProps {
  variant?: ThemeToggleVariant;
}

const OPTIONS: Array<{
  key: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
  { key: 'system', label: 'Auto', icon: 'phone-portrait-outline' },
];

function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { colors, mode, preference, setThemePreference, toggleTheme } = useTheme();

  const handleSelect = useCallback(
    (key: 'light' | 'dark' | 'system') => setThemePreference(key),
    [setThemePreference],
  );

  // ── Icon variant ──────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <Pressable
        onPress={toggleTheme}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.surfaceSecondary }}
        hitSlop={8}
      >
        <Ionicons
          name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
          size={22}
          color={colors.text}
        />
      </Pressable>
    );
  }

  // ── Segmented variant ─────────────────────────────────────────
  return (
    <View
      className="flex-row rounded-xl p-[3px] overflow-hidden"
      style={{ backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border }}
    >
      {OPTIONS.map((opt) => {
        const isActive = preference === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => handleSelect(opt.key)}
            className="flex-1 flex-row items-center justify-center py-2 rounded-[10px]"
            style={isActive ? { backgroundColor: colors.primary } : undefined}
          >
            <Ionicons
              name={opt.icon}
              size={16}
              color={isActive ? colors.textInverse : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              className="text-[13px] font-semibold"
              style={{ color: isActive ? colors.textInverse : colors.textSecondary }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default React.memo(ThemeToggle);
