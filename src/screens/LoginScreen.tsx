/**
 * LoginScreen
 *
 * Handles user authentication with username + password.
 * NativeWind for layout, theme-context for dynamic colors.
 * Uses Zod for validation.
 */

import { ThemedButton, ThemedInput } from '@/src/components';
import { LOGO, NAME } from '@/src/constants';
import { useSession, useTheme } from '@/src/context';
import { loginSchema, type LoginInput } from '@/src/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const { colors } = useTheme();
  const { signIn, error: authError, clearError } = useSession();
  const passwordRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = useCallback(async (data: LoginInput) => {
    clearError();
    try {
      await signIn({ username: data.username.trim(), password: data.password });
    } catch {
      // Error is set in context
    }
  }, [signIn, clearError]);

  const handleGoToRegister = useCallback(() => {
    clearError();
    router.push('/(auth)/register');
  }, [clearError]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        contentContainerClassName="flex-grow px-6 justify-center"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <Image
            source={LOGO}
            style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 16 }}
            contentFit="contain"
            transition={200}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`${NAME} logo`}
          />
          <Text className="text-[28px] font-bold mb-1" style={{ color: colors.text }} accessibilityRole="header">
            Welcome Back
          </Text>
          <Text className="text-[15px] text-center" style={{ color: colors.textSecondary }}>
            Sign in to continue to {NAME}
          </Text>
        </View>

        {/* Form */}
        <View className="mb-6">
          {authError ? (
            <View
              className="p-3 rounded-xl mb-4"
              style={{ backgroundColor: colors.errorLight }}
              accessible
              accessibilityRole="alert"
              accessibilityLabel={`Error: ${authError}`}
              accessibilityLiveRegion="assertive"
            >
              <Text className="text-sm font-medium text-center" style={{ color: colors.errorDark }} accessible={false}>
                {authError}
              </Text>
            </View>
          ) : null}

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedInput
                label="Username"
                placeholder="Enter your username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.username?.message}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                nextInputRef={passwordRef}
                editable={!isSubmitting}
                accessibilityLabel="Username"
                accessibilityHint="Enter your username to sign in"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedInput
                ref={passwordRef}
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                isPassword
                textContentType="password"
                onSubmitEditing={handleSubmit(onSubmit)}
                editable={!isSubmitting}
                accessibilityLabel="Password"
                accessibilityHint="Enter your password to sign in"
              />
            )}
          />

          <ThemedButton
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: 8 }}
            accessibilityLabel="Sign In"
            accessibilityHint="Sign in to your account with provided credentials"
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            hitSlop={8}
            className="self-end mt-2"
            accessibilityRole="button"
            accessibilityLabel="Forgot Password?"
            accessibilityHint="Opens password recovery screen"
          >
            <Text className="text-sm font-medium" style={{ color: colors.primary }}>
              Forgot Password?
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center items-center">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Don&apos;t have an account?{' '}
          </Text>
          <Pressable
            onPress={handleGoToRegister}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Sign Up"
            accessibilityHint="Navigate to registration screen to create a new account"
          >
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
