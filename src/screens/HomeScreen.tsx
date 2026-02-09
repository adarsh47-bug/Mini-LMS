/**
 * HomeScreen
 *
 * Main authenticated screen. Shows user info, theme switcher, and sign-out.
 * Supports pull-to-refresh to re-fetch user profile data.
 * NativeWind for layout, theme-context for dynamic colors.
 */

import { ConfirmModal, ThemedButton } from '@/src/components';
import { LOGO, NAME } from '@/src/constants';
import { useSession, useTheme } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const { colors } = useTheme();
  const { signOut, user, refreshUser } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  const handleSignOutConfirm = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } finally {
      setLoggingOut(false);
      setShowSignOutModal(false);
    }
  }, [signOut]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
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
        <View className="flex-row justify-start items-center pt-2 mb-6">
          <Image
            source={LOGO}
            style={{ width: 40, height: 40, marginHorizontal: 4 }}
            contentFit="contain"
            transition={200}
          />
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {NAME}
          </Text>
        </View>

        {/* User Card — tap to open profile */}
        <Pressable
          onPress={() => router.push('/(app)/profile')}
          className="flex-row items-center p-4 rounded-2xl mb-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          {user?.avatar?.url ? (
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Image
                source={{ uri: user.avatar.url }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
            </View>
          ) : (
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Ionicons name="person" size={28} color={colors.textInverse} />
            </View>
          )}
          <View className="ml-3.5 flex-1">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              {user?.username || 'User'}
            </Text>
            <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
              {user?.email || ''}
            </Text>
            <View
              className="self-start px-2.5 py-0.5 rounded-lg mt-1.5"
              style={{ backgroundColor: colors.primaryLight + '20' }}
            >
              <Text className="text-xs font-semibold uppercase" style={{ color: colors.primary }}>
                {user?.role || 'USER'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>

        {/* Placeholder Content */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Dashboard
          </Text>
          <View
            className="p-8 rounded-2xl items-center justify-center"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <Ionicons name="construct-outline" size={48} color={colors.textTertiary} />
            <Text className="text-[15px] text-center mt-3 leading-[22px]" style={{ color: colors.textSecondary }}>
              More features coming soon!{'\n'}Courses, lessons, and progress tracking.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mb-6 gap-3">
          <ThemedButton
            title="View Profile"
            onPress={() => router.push('/(app)/profile')}
            variant="primary"
          />
        </View>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleSignOutConfirm}
        onCancel={() => setShowSignOutModal(false)}
        icon="log-out-outline"
        variant="warning"
        loading={loggingOut}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
