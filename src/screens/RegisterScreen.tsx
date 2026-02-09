/**
 * RegisterScreen
 *
 * User registration with username, email, password, and confirm password.
 * NativeWind for layout, theme-context for dynamic colors.
 */

import { ThemedButton, ThemedInput } from '@/src/components';
import { LOGO, NAME } from '@/src/constants';
import { useSession, useTheme } from '@/src/context';
import { registerSchema, type RegisterInput } from '@/src/types';
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

const RegisterScreen = () => {
  const { colors } = useTheme();
  const { signUp, signIn, error: authError, clearError } = useSession();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(async (data: RegisterInput) => {
    clearError();
    try {
      // First, register the user
      await signUp({
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: 'USER',
      });

      // Then, automatically sign in with the same credentials
      await signIn({
        username: data.username.trim(),
        password: data.password,
      });
    } catch (err: unknown) {
      // If registration succeeds but login fails, show message
      if (err instanceof Error && err.message.includes('login')) {
        router.replace('/(auth)/login');
      }
      // Other errors are displayed via authError
    }
  }, [signUp, signIn, clearError]);

  const handleGoToLogin = useCallback(() => {
    clearError();
    router.back();
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
        <View className="items-center mb-6">
          <Image
            source={LOGO}
            style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12 }}
            contentFit="contain"
            transition={200}
          />
          <Text className="text-[28px] font-bold mb-1" style={{ color: colors.text }}>
            Create Account
          </Text>
          <Text className="text-[15px] text-center" style={{ color: colors.textSecondary }}>
            Sign up to get started with {NAME}
          </Text>
        </View>

        {/* Form */}
        <View className="mb-6">
          {authError ? (
            <View className="p-3 rounded-xl mb-4" style={{ backgroundColor: colors.errorLight }}>
              <Text className="text-sm font-medium text-center" style={{ color: colors.errorDark }}>
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
                placeholder="Choose a username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.username?.message}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                nextInputRef={emailRef}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedInput
                ref={emailRef}
                label="Email"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                nextInputRef={passwordRef}
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
                placeholder="Create a password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                isPassword
                textContentType="newPassword"
                nextInputRef={confirmPasswordRef}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedInput
                ref={confirmPasswordRef}
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                isPassword
                textContentType="newPassword"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <ThemedButton
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Footer */}
        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={handleGoToLogin} hitSlop={8}>
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              Sign In
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
