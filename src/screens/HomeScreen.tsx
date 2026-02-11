/**
 * HomeScreen
 *
 * Main authenticated dashboard. Shows user greeting, course stats,
 * quick actions, and recent courses. Supports pull-to-refresh.
 * NativeWind for layout, theme-context for dynamic colors.
 */

import { ConfirmModal, CourseCard, ThemeToggle } from '@/src/components';
import { LOGO, NAME } from '@/src/constants';
import { useSession, useTheme } from '@/src/context';
import { useScrollToTop } from '@/src/hooks';
import { useBookmarkStore, useCourseStore } from '@/src/stores';
import type { CourseListItem } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Stat card for dashboard */
const StatCard = React.memo(function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) {
  return (
    <View
      className="flex-1 items-center py-4 px-2 rounded-2xl"
      style={{ backgroundColor: bgColor }}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${value} ${label}`}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: color + '20' }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-xl font-bold" style={{ color }} accessible={false}>{value}</Text>
      <Text className="text-[11px] mt-0.5 text-center" style={{ color: color + 'CC' }} accessible={false}>{label}</Text>
    </View>
  );
});

const HomeScreen = () => {
  const { colors } = useTheme();
  const { signOut, user, refreshUser } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useScrollToTop();

  const courses = useCourseStore((s) => s.courses);
  const isInitialized = useCourseStore((s) => s.isInitialized);
  const fetchInitialCourses = useCourseStore((s) => s.fetchInitialCourses);
  const bookmarkCount = useBookmarkStore((s) => s.bookmarkedIds.length);
  const enrolledCount = useBookmarkStore((s) => s.enrolledIds.length);

  // Initialize courses on mount
  useEffect(() => {
    if (!isInitialized) {
      fetchInitialCourses();
    }
  }, [isInitialized, fetchInitialCourses]);

  // Show up to 4 recent courses on dashboard
  const recentCourses = useMemo(() => courses.slice(0, 4), [courses]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshUser(), fetchInitialCourses()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, fetchInitialCourses]);

  const handleSignOutConfirm = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } finally {
      setLoggingOut(false);
      setShowSignOutModal(false);
    }
  }, [signOut]);

  const handleCoursePress = useCallback((courseId: number) => {
    router.push(`/(app)/course/${courseId}` as any);
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="px-5 pb-8"
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
        <View className="flex-row justify-between items-center pt-2 mb-5">
          <View className="flex-row items-center">
            <Image
              source={LOGO}
              style={{ width: 32, height: 32, marginRight: 8, borderRadius: 8 }}
              contentFit="contain"
              transition={200}
              accessible
              accessibilityRole="image"
              accessibilityLabel={`${NAME} logo`}
            />
            <Text className="text-xl font-bold" style={{ color: colors.text }} accessibilityRole="header">
              {NAME}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <ThemeToggle variant="icon" />
            <Pressable
              onPress={() => setShowSignOutModal(true)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surfaceSecondary }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
              accessibilityHint="Opens sign out confirmation dialog"
            >
              <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        <View className="mb-5">
          <Text className="text-lg" style={{ color: colors.textSecondary }}>
            Welcome back,
          </Text>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {user?.username || 'Student'} 👋
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3 mb-6">
          <StatCard
            icon="book"
            label="Enrolled"
            value={enrolledCount}
            color={colors.primary}
            bgColor={colors.surface}
          />
          <StatCard
            icon="bookmark"
            label="Bookmarks"
            value={bookmarkCount}
            color={colors.secondary}
            bgColor={colors.surface}
          />
          <StatCard
            icon="library"
            label="Available"
            value={courses.length}
            color={colors.accent}
            bgColor={colors.surface}
          />
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <QuickAction
              icon="book-outline"
              label="Browse Courses"
              colors={colors}
              onPress={() => router.push('/(app)/(tabs)/courses' as any)}
            />
            <QuickAction
              icon="bookmark-outline"
              label="My Bookmarks"
              colors={colors}
              onPress={() => router.push('/(app)/(tabs)/bookmarks' as any)}
            />
            <QuickAction
              icon="person-outline"
              label="My Profile"
              colors={colors}
              onPress={() => router.push('/(app)/(tabs)/profile' as any)}
            />
          </View>
        </View>

        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                Recent Courses
              </Text>
              <Pressable
                onPress={() => router.push('/(app)/(tabs)/courses' as any)}
                accessibilityRole="button"
                accessibilityLabel="View All Courses"
                accessibilityHint="Opens full course catalog"
              >
                <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                  View All
                </Text>
              </Pressable>
            </View>
            {recentCourses.map((course: CourseListItem) => (
              <CourseCard key={course.id} course={course} onPress={handleCoursePress} />
            ))}
          </View>
        )}
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

/** Quick action button */
const QuickAction = React.memo(function QuickAction({
  icon,
  label,
  colors,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  colors: ReturnType<typeof import('@/src/context').useTheme>['colors'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center py-4 rounded-2xl"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Opens ${label} screen`}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text className="text-[11px] font-medium mt-2 text-center" style={{ color: colors.textSecondary }} accessible={false}>
        {label}
      </Text>
    </Pressable>
  );
});

export default HomeScreen;
