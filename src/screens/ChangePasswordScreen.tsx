/**
 * ChangePasswordScreen
 *
 * Allows the authenticated user to change their password.
 * Uses changePassword from auth.service.ts.
 * NativeWind layout, theme-context for dynamic colors.
 */

import { ThemedButton, ThemedInput } from '@/src/components';
import { useNotification, useTheme } from '@/src/context';
import { changePassword } from '@/src/services';
import { changePasswordSchema, type ChangePasswordInput } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChangePasswordScreen = () => {
  const { colors } = useTheme();
  const notification = useNotification();
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(async (data: ChangePasswordInput) => {
    // Additional validation: new password must differ from current
    if (data.currentPassword === data.newPassword) {
      notification.error('New password must differ from current password.');
      return;
    }

    try {
      await changePassword(data.currentPassword, data.newPassword);
      notification.success('Your password has been updated successfully.');
      reset();
      router.back();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.';
      notification.error(msg);
    }
  }, [notification, reset]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        contentContainerClassName="px-6 pb-8"
        showsVerticalScrollIndicator={false}
        bottomOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        {/* Top Bar */}
        <View className="flex-row items-center pt-2 mb-6">
          <Pressable onPress={() => router.back()} className="flex-row items-center" hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
            <Text className="text-base font-medium ml-1" style={{ color: colors.primary }}>Back</Text>
          </Pressable>
        </View>

        {/* Header */}
        <View className="items-center mb-8">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primaryLight + '20' }}
          >
            <Ionicons name="lock-closed" size={30} color={colors.primary} />
          </View>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Change Password
          </Text>
          <Text className="text-sm text-center mt-1" style={{ color: colors.textSecondary }}>
            Enter your current password and choose a new one.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedInput
                label="Current Password"
                placeholder="Enter current password"
                isPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.currentPassword?.message}
                nextInputRef={newPasswordRef}
                editable={!isSubmitting}
              />
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedInput
                ref={newPasswordRef}
                label="New Password"
                placeholder="Enter new password"
                isPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.newPassword?.message}
                nextInputRef={confirmPasswordRef}
                editable={!isSubmitting}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedInput
                ref={confirmPasswordRef}
                label="Confirm New Password"
                placeholder="Re-enter new password"
                isPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                onSubmitEditing={handleSubmit(onSubmit)}
                editable={!isSubmitting}
              />
            )}
          />
        </View>

        {/* Submit */}
        <View className="mt-8">
          <ThemedButton
            title="Update Password"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
