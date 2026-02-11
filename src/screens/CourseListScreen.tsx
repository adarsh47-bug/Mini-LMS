/**
 * CourseListScreen
 *
 * Displays the course catalog with search, pull-to-refresh,
 * infinite scroll, and bookmark functionality.
 * Uses Zustand stores for state and themed colors throughout.
 */

import { CourseCard } from '@/src/components';
import { useTheme } from '@/src/context';
import { useScrollToTop } from '@/src/hooks';
import { useBookmarkStore, useCourseStore } from '@/src/stores';
import type { CourseListItem } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CourseListScreen = () => {
  const { colors } = useTheme();

  const scrollRef = useScrollToTop();

  // Use individual selectors for proper reactivity
  const courses = useCourseStore((s) => s.courses);
  const isLoading = useCourseStore((s) => s.isLoading);
  const isLoadingMore = useCourseStore((s) => s.isLoadingMore);
  const error = useCourseStore((s) => s.error);
  const hasNextPage = useCourseStore((s) => s.hasNextPage);
  const isInitialized = useCourseStore((s) => s.isInitialized);
  const fetchInitialCourses = useCourseStore((s) => s.fetchInitialCourses);
  const fetchMoreCourses = useCourseStore((s) => s.fetchMoreCourses);
  const refreshCourses = useCourseStore((s) => s.refreshCourses);

  const bookmarkCount = useBookmarkStore((s) => s.bookmarkedIds.length);
  const enrolledCount = useBookmarkStore((s) => s.enrolledIds.length);

  // Local search state for instant filtering
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) fetchInitialCourses();
  }, [isInitialized, fetchInitialCourses]);

  // Filter courses locally based on search query
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.instructor.name.toLowerCase().includes(q),
    );
  }, [courses, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const handleCoursePress = useCallback((courseId: number) => {
    router.push(`/(app)/course/${courseId}` as any);
  }, []);

  const handleEnrolled = useCallback(() => {
    router.push('/(app)/enrolled' as any);
  }, []);

  const handleBookmarks = useCallback(() => {
    router.push('/(app)/(tabs)/bookmarks' as any);
  }, []);

  const renderCourseItem = useCallback(
    ({ item }: { item: CourseListItem }) => (
      <CourseCard course={item} onPress={handleCoursePress} />
    ),
    [handleCoursePress],
  );

  const keyExtractor = useCallback((item: CourseListItem) => String(item.id), []);

  // Only allow loading more when not searching
  const handleEndReached = useCallback(() => {
    if (!isSearching && hasNextPage && !isLoadingMore) {
      fetchMoreCourses();
    }
  }, [isSearching, hasNextPage, isLoadingMore, fetchMoreCourses]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore || isSearching) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={colors.primary} />
        <Text className="text-xs mt-1" style={{ color: colors.textTertiary }}>
          Loading more courses...
        </Text>
      </View>
    );
  }, [isLoadingMore, isSearching, colors.primary, colors.textTertiary]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    if (error) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-6">
          <Ionicons name="cloud-offline-outline" size={56} color={colors.textTertiary} />
          <Text className="text-base font-semibold mt-4 text-center" style={{ color: colors.text }}>
            Failed to Load Courses
          </Text>
          <Text className="text-sm text-center mt-2" style={{ color: colors.textSecondary }}>
            {error}
          </Text>
          <Pressable
            onPress={fetchInitialCourses}
            className="mt-4 px-6 py-2.5 rounded-xl"
            style={{ backgroundColor: colors.primary }}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            accessibilityHint="Retry loading courses"
          >
            <Text className="text-sm font-semibold" style={{ color: colors.textInverse }}>
              Retry
            </Text>
          </Pressable>
        </View>
      );
    }

    if (isSearching) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-6">
          <Ionicons name="search-outline" size={56} color={colors.textTertiary} />
          <Text className="text-base font-semibold mt-4 text-center" style={{ color: colors.text }}>
            No Courses Found
          </Text>
          <Text className="text-sm text-center mt-2" style={{ color: colors.textSecondary }}>
            Try adjusting your search terms
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Ionicons name="book-outline" size={56} color={colors.textTertiary} />
        <Text className="text-base font-semibold mt-4 text-center" style={{ color: colors.text }}>
          No Courses Available
        </Text>
        <Text className="text-sm text-center mt-2" style={{ color: colors.textSecondary }}>
          Pull down to refresh
        </Text>
      </View>
    );
  }, [isLoading, error, isSearching, colors, fetchInitialCourses]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-5 pt-2 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold" style={{ color: colors.text }} accessibilityRole="header">
            Courses
          </Text>
          <View className="flex-row items-center gap-2">
            {/* Enrolled courses button */}
            <Pressable
              onPress={handleEnrolled}
              className="relative w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surfaceSecondary }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Enrolled courses${enrolledCount > 0 ? `, ${enrolledCount} enrolled` : ''}`}
              accessibilityHint="View your enrolled courses"
            >
              <Ionicons name="school-outline" size={20} color={colors.text} />
              {enrolledCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1"
                  style={{ backgroundColor: colors.secondary }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: colors.white }}>
                    {enrolledCount > 99 ? '99+' : enrolledCount}
                  </Text>
                </View>
              )}
            </Pressable>
            {/* Bookmark button */}
            <Pressable
              onPress={handleBookmarks}
              className="relative w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surfaceSecondary }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Bookmarks${bookmarkCount > 0 ? `, ${bookmarkCount} bookmarked` : ''}`}
              accessibilityHint="View your bookmarked courses"
            >
              <Ionicons name="bookmark-outline" size={20} color={colors.text} />
              {bookmarkCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: colors.white }}>
                    {bookmarkCount > 99 ? '99+' : bookmarkCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View
          className="flex-row items-center rounded-xl px-3 h-11"
          style={{ backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border }}
        >
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            placeholder="Search courses, categories, instructors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 14,
              color: colors.text,
              height: 40,
            }}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search courses"
            accessibilityHint="Search by course title, category, or instructor name"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              accessibilityHint="Clears the search field"
            >
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Course List */}
      {isLoading && !courses.length ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm mt-3" style={{ color: colors.textSecondary }}>
            Loading courses...
          </Text>
        </View>
      ) : (
        <LegendList
          ref={scrollRef}
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && courses.length > 0}
              onRefresh={refreshCourses}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default CourseListScreen;
