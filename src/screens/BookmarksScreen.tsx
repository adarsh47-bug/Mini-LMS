/**
 * BookmarksScreen
 *
 * Displays bookmarked courses in a list.
 * Uses the bookmark store and course store for data.
 */

import { CourseCard } from '@/src/components';
import { useTheme } from '@/src/context';
import { useScrollToTop } from '@/src/hooks';
import { useBookmarkStore, useCourseStore } from '@/src/stores';
import type { CourseListItem } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookmarksScreen = () => {
  const { colors } = useTheme();
  const scrollRef = useScrollToTop();
  const courses = useCourseStore((s) => s.courses);
  const bookmarkedIds = useBookmarkStore((s) => s.bookmarkedIds);

  const bookmarkedCourses = useMemo(
    () => courses.filter((c) => bookmarkedIds.includes(c.id)),
    [courses, bookmarkedIds],
  );

  const handleCoursePress = useCallback((courseId: number) => {
    router.push(`/(app)/course/${courseId}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CourseListItem }) => (
      <CourseCard course={item} onPress={handleCoursePress} />
    ),
    [handleCoursePress],
  );

  const keyExtractor = useCallback((item: CourseListItem) => String(item.id), []);

  const renderEmpty = useCallback(
    () => (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Ionicons name="bookmark-outline" size={56} color={colors.textTertiary} />
        <Text className="text-base font-semibold mt-4 text-center" style={{ color: colors.text }}>
          No Bookmarks Yet
        </Text>
        <Text className="text-sm text-center mt-2" style={{ color: colors.textSecondary }}>
          Save courses by tapping the bookmark icon
        </Text>
      </View>
    ),
    [colors],
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-3">
        <Text className="text-xl font-bold flex-1" style={{ color: colors.text }} accessibilityRole="header">
          Bookmarks
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }} accessibilityLabel={`${bookmarkedCourses.length} saved courses`}>
          {bookmarkedCourses.length} saved
        </Text>
      </View>

      <LegendList
        ref={scrollRef}
        data={bookmarkedCourses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

export default BookmarksScreen;
