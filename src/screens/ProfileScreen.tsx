/**
 * ProfileScreen
 *
 * Authenticated user profile with avatar update,
 * account info, and navigation to settings.
 * NativeWind for layout, theme-context for dynamic colors.
 */

import { ConfirmModal, ImagePickerModal, PlaceholderImage, ThemedButton, ThemeToggle } from '@/src/components';
import { STORAGE_KEYS } from '@/src/constants';
import { useNotification, useSession, useTheme } from '@/src/context';
import { useScrollToTop } from '@/src/hooks';
import { resendEmailVerification, updateAvatar } from '@/src/services';
import { useBookmarkStore } from '@/src/stores';
import { formatDate, formatDateTime, getAsyncStorageItem, logger, setAsyncStorageItem } from '@/src/utils';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function InfoRow({ icon, label, value, colors }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View className="flex-row items-center py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <View className="ml-3 flex-1">
        <Text className="text-xs" style={{ color: colors.textTertiary }}>{label}</Text>
        <Text className="text-[15px] font-medium mt-0.5" style={{ color: colors.text }}>{value}</Text>
      </View>
    </View>
  );
}

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, signOut, refreshUser } = useSession();
  const notification = useNotification();
  const scrollRef = useScrollToTop();
  const bookmarkCount = useBookmarkStore((s) => s.bookmarkedIds.length);
  const enrolledCount = useBookmarkStore((s) => s.enrolledIds.length);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const displayAvatar = avatarUri || user?.avatar?.url;

  // Load optimistic avatar from AsyncStorage on mount
  useEffect(() => {
    const loadOptimisticAvatar = async () => {
      try {
        const cachedAvatar = await getAsyncStorageItem(STORAGE_KEYS.optimisticAvatar);
        if (cachedAvatar && cachedAvatar !== user?.avatar?.url) {
          setAvatarUri(cachedAvatar);
        }
      } catch (error) {
        logger.error('Failed to load optimistic avatar', error);
      }
    };
    loadOptimisticAvatar();
  }, [user?.avatar?.url]);

  // Auto-check for updates on mount
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Get last update time
        const lastUpdate = await Application.getLastUpdateTimeAsync();
        setLastUpdateTime(lastUpdate);

        // Only check for updates in production builds (not in dev mode)
        if (!__DEV__ && Updates.isEnabled) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            setUpdateAvailable(true);
            // Auto-download and apply update
            await Updates.fetchUpdateAsync();
            notification.success('Update downloaded! Restart app to apply.');
            // Optional: Auto-reload the app
            // await Updates.reloadAsync();
          }
        }
      } catch (error) {
        logger.error('Error checking for updates', error);
      }
    };

    checkForUpdates();
  }, [notification]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  const handleImageSelected = useCallback(async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets[0]) return;

    const imageUri = result.assets[0].uri;

    // Optimistically update UI immediately and cache in AsyncStorage
    setAvatarUri(imageUri);
    await setAsyncStorageItem(STORAGE_KEYS.optimisticAvatar, imageUri);

    setUploadingAvatar(true);
    try {
      await updateAvatar(imageUri);
      // Refetch user to sync avatar across the app
      await refreshUser();
      notification.success('Profile picture updated successfully.');
    } catch (err: unknown) {
      // Revert on error
      setAvatarUri(user?.avatar?.url || null);
      await setAsyncStorageItem(STORAGE_KEYS.optimisticAvatar, user?.avatar?.url || null);
      const msg = err instanceof Error ? err.message : 'Failed to update avatar.';
      notification.error(msg);
    } finally {
      setUploadingAvatar(false);
    }
  }, [refreshUser, notification, user?.avatar?.url]);

  const handlePickFromGallery = useCallback(async () => {
    setShowImagePicker(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notification.warning('Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    await handleImageSelected(result);
  }, [handleImageSelected, notification]);

  const handlePickFromCamera = useCallback(async () => {
    setShowImagePicker(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      notification.warning('Please allow access to your camera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    await handleImageSelected(result);
  }, [handleImageSelected, notification]);

  const handleSignOut = useCallback(async () => {
    setLoggingOut(true);
    try { await signOut(); } finally { setLoggingOut(false); setShowSignOutModal(false); }
  }, [signOut]);

  const handleResendVerification = useCallback(async () => {
    if (!user?.email) return;
    setResendingVerification(true);
    try {
      await resendEmailVerification(user.email);
      notification.success('Verification email sent! Check your inbox.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send verification email.';
      notification.error(msg);
    } finally {
      setResendingVerification(false);
    }
  }, [user?.email, notification]);

  const handleChangePassword = useCallback(() => {
    router.push('/(app)/change-password');
  }, []);

  const handleCheckUpdates = useCallback(async () => {
    setCheckingUpdate(true);
    try {
      // Get latest update time
      const lastUpdate = await Application.getLastUpdateTimeAsync();
      setLastUpdateTime(lastUpdate);

      // Check for updates (skip in dev mode)
      if (__DEV__) {
        notification.info('Update check is disabled in development mode.');
        return;
      }

      if (!Updates.isEnabled) {
        notification.info('Updates are not enabled for this build.');
        return;
      }

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateAvailable(true);
        notification.success('New update available! Downloading...');

        // Download the update
        await Updates.fetchUpdateAsync();
        notification.success('Update downloaded! Restarting app...');

        // Reload the app to apply the update
        await Updates.reloadAsync();
      } else {
        setUpdateAvailable(false);
        notification.success('You are on the latest version!');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to check for updates';
      notification.error(msg);
      logger.error('Update check error', error);
    } finally {
      setCheckingUpdate(false);
    }
  }, [notification]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="px-6 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Bar */}
        <View className="flex-row justify-between items-center pt-2 mb-6">
          <Text className="text-xl font-bold" style={{ color: colors.text }} accessibilityRole="header">
            Profile
          </Text>
          <ThemeToggle variant="icon" />
        </View>

        {/* Avatar Section */}
        <View className="items-center mb-8">
          <Pressable
            onPress={() => setShowImagePicker(true)}
            disabled={uploadingAvatar}
            accessibilityRole="button"
            accessibilityLabel={uploadingAvatar ? "Uploading profile picture" : "Change profile picture"}
            accessibilityHint="Opens photo picker to update your profile picture"
          >
            <PlaceholderImage
              uri={displayAvatar}
              width={96}
              height={96}
              borderRadius={48}
              placeholderIcon="person"
              iconSize={40}
              accessibilityLabel={`${user?.username}'s profile picture`}
            />
            {/* Edit badge */}
            <View
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background }}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Ionicons name="camera" size={16} color={colors.textInverse} />
              )}
            </View>
          </Pressable>
          <Text className="text-xl font-bold mt-3" style={{ color: colors.text }}>
            {user?.username || 'User'}
          </Text>
          <View className="px-3 py-1 rounded-full mt-1" style={{ backgroundColor: colors.primaryLight + '20' }}>
            <Text className="text-xs font-semibold uppercase" style={{ color: colors.primary }}>
              {user?.role || 'USER'}
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 items-center py-4 rounded-2xl"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`${enrolledCount} enrolled courses`}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Ionicons name="school" size={24} color={colors.primary} />
            </View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {enrolledCount}
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Enrolled
            </Text>
          </View>
          <View
            className="flex-1 items-center py-4 rounded-2xl"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`${bookmarkCount} bookmarked courses`}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: colors.secondary + '20' }}
            >
              <Ionicons name="bookmark" size={24} color={colors.secondary} />
            </View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {bookmarkCount}
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Bookmarked
            </Text>
          </View>
        </View>

        {/* Account Info */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
            Account Information
          </Text>
          <InfoRow icon="person-outline" label="Username" value={user?.username || '-'} colors={colors} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email || '-'} colors={colors} />
          <InfoRow
            icon="shield-checkmark-outline"
            label="Email Verified"
            value={user?.isEmailVerified ? 'Yes' : 'No'}
            colors={colors}
          />
          <InfoRow
            icon="calendar-outline"
            label="Member Since"
            value={formatDate(user?.createdAt)}
            colors={colors}
          />
        </View>

        {/* Email Verification Banner */}
        {!user?.isEmailVerified && (
          <View
            className="rounded-2xl p-4 mb-6 flex-row items-center"
            style={{ backgroundColor: colors.primaryLight + '15', borderWidth: 1, borderColor: colors.primary }}
            accessible
            accessibilityRole="alert"
            accessibilityLabel="Email not verified. Verify your email to access all features"
          >
            <Ionicons name="alert-circle-outline" size={24} color={colors.primary} />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold" style={{ color: colors.text }}>Email Not Verified</Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Verify your email to access all features</Text>
            </View>
            <Pressable
              onPress={handleResendVerification}
              disabled={resendingVerification}
              className="ml-2 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: colors.primary }}
              accessibilityRole="button"
              accessibilityLabel="Resend verification email"
              accessibilityHint="Sends a new verification email to your inbox"
            >
              {resendingVerification ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text className="text-xs font-semibold" style={{ color: colors.textInverse }}>Resend</Text>
              )}
            </Pressable>
          </View>
        )}

        <View
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          {/* Theme */}
          <View className="mb-6">
            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Appearance</Text>
            <ThemeToggle variant="segmented" />
          </View>

          {/* Actions */}
          <View className="gap-3">
            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Account Actions</Text>
            <ThemedButton
              title="Change Password"
              onPress={handleChangePassword}
              variant="outline"
              accessibilityHint="Navigate to change password screen"
            />
            <ThemedButton
              title="Sign Out"
              onPress={() => setShowSignOutModal(true)}
              variant="ghost"
              disabled={loggingOut}
              accessibilityHint="Opens confirmation dialog to sign out"
            />
          </View>
        </View>

        {/* App Updates Section */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold" style={{ color: colors.text }}>App Updates</Text>
            {updateAvailable && (
              <View className="px-2 py-1 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                <Text className="text-xs font-semibold" style={{ color: colors.primary }}>Update Available</Text>
              </View>
            )}
          </View>

          {lastUpdateTime && (
            <View className="mb-3 flex-row items-center">
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text className="text-xs ml-2" style={{ color: colors.textSecondary }}>
                Last updated: {formatDateTime(lastUpdateTime)}
              </Text>
            </View>
          )}

          <ThemedButton
            title={checkingUpdate ? 'Checking...' : 'Check for Updates'}
            onPress={handleCheckUpdates}
            variant="outline"
            disabled={checkingUpdate}
            accessibilityHint="Checks for available app updates"
          />

          <Text className="text-xs mt-3" style={{ color: colors.textTertiary }}>
            {__DEV__
              ? '⚠️ Update checking is disabled in development mode'
              : 'App automatically checks for updates on launch'}
          </Text>
        </View>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutModal(false)}
        icon="log-out-outline"
        variant="warning"
        loading={loggingOut}
      />

      {/* Image Source Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onCamera={handlePickFromCamera}
        onGallery={handlePickFromGallery}
        onCancel={() => setShowImagePicker(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
