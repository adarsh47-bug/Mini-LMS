/**
 * ForgotPasswordScreen
 *
 * Lets unauthenticated users request a password reset email.
 * NativeWind for layout, theme-context for dynamic colors.
 */

import { ThemedButton, ThemedInput } from '@/src/components';
import { useTheme } from '@/src/context';
import { forgotPassword } from '@/src/services';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/src/types';
import { extractErrorMessage } from '@/src/utils';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = () => {
  const { colors } = useTheme();

  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [emailValue, setEmailValue] = useState('');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = useCallback(async (data: ForgotPasswordInput) => {
    setError('');
    setEmailValue(data.email);

    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to send reset email. Please try again.'));
    }
  }, []);

  const handleBack = useCallback(() => router.back(), []);

  // ── Success State ─────────────────────────────────────────────
  if (sent) {
    return (
      <SafeAreaView className="flex-1 px-6 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: colors.successLight }}
        >
          <Ionicons name="mail-outline" size={40} color={colors.success} />
        </View>
        <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }} accessibilityRole="header">
          Check Your Email
        </Text>
        <Text className="text-base text-center leading-6 mb-8" style={{ color: colors.textSecondary }}>
          We&apos;ve sent password reset instructions to{' \n'}
          <Text className="font-semibold" style={{ color: colors.text }}>{emailValue.trim().toLowerCase()}</Text>
        </Text>
        <ThemedButton title="Back to Login" onPress={handleBack} size="md" />
      </SafeAreaView>
    );
  }

  // ── Form State ────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        contentContainerClassName="flex-grow px-6 justify-center"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        {/* Back Button */}
        <Pressable
          onPress={handleBack}
          className="flex-row items-center mb-8"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Returns to login screen"
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
          <Text className="text-base font-medium ml-1" style={{ color: colors.primary }}>
            Back
          </Text>
        </Pressable>

        {/* Header */}
        <View className="mb-8">
          <Ionicons name="lock-open-outline" size={48} color={colors.primary} />
          <Text className="text-[28px] font-bold mt-4 mb-2" style={{ color: colors.text }} accessibilityRole="header">
            Forgot Password?
          </Text>
          <Text className="text-[15px] leading-6" style={{ color: colors.textSecondary }}>
            Enter the email associated with your account and we&apos;ll send instructions to reset your password.
          </Text>
        </View>

        {/* Form */}
        <View className="mb-6">
          {error ? (
            <View
              className="p-3 rounded-xl mb-4"
              style={{ backgroundColor: colors.errorLight }}
              accessible
              accessibilityRole="alert"
              accessibilityLabel={`Error: ${error}`}
            >
              <Text className="text-sm font-medium text-center" style={{ color: colors.errorDark }} accessible={false}>
                {error}
              </Text>
            </View>
          ) : null}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedInput
                label="Email Address"
                placeholder="Enter your email"
                value={value}
                onChangeText={(text) => { onChange(text); setError(''); }}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                onSubmitEditing={handleSubmit(onSubmit)}
                editable={!isSubmitting}
                accessibilityLabel="Email Address"
                accessibilityHint="Enter your email address to receive password reset instructions"
              />
            )}
          />

          <ThemedButton
            title="Send Reset Link"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: 8 }}
            accessibilityHint="Sends password reset instructions to your email"
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
