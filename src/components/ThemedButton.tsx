/**
 * ThemedButton
 *
 * Reusable button with NativeWind layout and theme-context colors.
 */

import { useTheme } from '@/src/context';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, type TextStyle, type ViewStyle } from 'react-native';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const SIZE_CLASSES = {
  sm: 'py-2 px-4 min-h-[36px]',
  md: 'py-3.5 px-6 min-h-[48px]',
  lg: 'py-4 px-8 min-h-[56px]',
} as const;

const TEXT_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const;

function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: ThemedButtonProps) {
  const { colors } = useTheme();

  const bg = useMemo((): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
    }
  }, [colors, variant]);

  const textColor = useMemo((): TextStyle => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return { color: colors.primary };
      default:
        return { color: colors.textInverse };
    }
  }, [colors, variant]);

  const loaderColor = variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`flex-row items-center justify-center rounded-xl ${SIZE_CLASSES[size]} ${isDisabled ? 'opacity-60' : 'active:opacity-80 active:scale-[0.98]'}`}
      style={[bg, style]}
    >
      {loading ? <ActivityIndicator size="small" color={loaderColor} className="mr-2" /> : null}
      <Text className={`font-semibold ${TEXT_SIZES[size]}`} style={[textColor, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
}

export default React.memo(ThemedButton);
