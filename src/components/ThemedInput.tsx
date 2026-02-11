/**
 * ThemedInput
 *
 * Reusable text input with NativeWind layout and theme-context colors.
 * Includes label, error display, and password toggle.
 */

import { useTheme } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  nextInputRef?: React.RefObject<TextInput | null>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const ThemedInput = forwardRef<TextInput, ThemedInputProps>(function ThemedInput({
  label,
  error,
  containerStyle,
  isPassword = false,
  nextInputRef,
  style,
  returnKeyType,
  onSubmitEditing,
  accessibilityLabel,
  accessibilityHint,
  ...props
}, ref) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [secureEntry, setSecureEntry] = useState(isPassword);

  const toggleSecure = useCallback(() => setSecureEntry((prev) => !prev), []);

  const handleSubmitEditing = useCallback((e: any) => {
    if (onSubmitEditing) {
      onSubmitEditing(e);
    } else if (nextInputRef?.current) {
      nextInputRef.current.focus();
    }
  }, [onSubmitEditing, nextInputRef]);

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.borderFocus
      : colors.border;

  return (
    <View className="mb-4" style={containerStyle}>
      {label ? (
        <Text className="text-sm font-medium mb-1.5" style={{ color: colors.text }}>
          {label}
        </Text>
      ) : null}
      <View
        className="flex-row items-center rounded-xl px-3.5"
        style={{ borderWidth: 1.5, borderColor, backgroundColor: colors.surfaceSecondary }}
      >
        <TextInput
          ref={ref}
          className="flex-1 text-base py-3.5"
          style={[{ color: colors.text }, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureEntry}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          returnKeyType={returnKeyType || (nextInputRef ? 'next' : 'done')}
          onSubmitEditing={handleSubmitEditing}
          submitBehavior={nextInputRef ? 'submit' : 'blurAndSubmit'}
          accessibilityLabel={accessibilityLabel || label || props.placeholder}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: props.editable === false }}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={toggleSecure}
            className="pl-2"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={secureEntry ? 'Show password' : 'Hide password'}
            accessibilityHint="Toggles password visibility"
          >
            <Ionicons
              name={secureEntry ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="text-xs mt-1 ml-1" style={{ color: colors.error }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export default React.memo(ThemedInput);
