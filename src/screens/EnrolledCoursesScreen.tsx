/**
 * EnrolledCoursesScreen
 *
 * Displays courses the user has enrolled in.
 * Uses the bookmark store (enrolledIds) and course store (courses list).
 * Accessible from the CourseListScreen header via school icon.
 */

import { CourseCard } from '@/src/components';
import { useTheme } from '@/src/context';
import { useBookmarkStore, useCourseStore } from '@/src/stores';
import type { CourseListItem } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EnrolledCoursesScreen = () => {
  const { colors } = useTheme();
  const courses = useCourseStore((s) => s.courses);
  const enrolledIds = useBookmarkStore((s) => s.enrolledIds);

  const enrolledCourses = useMemo(
    () => courses.filter((c) => enrolledIds.includes(c.id)),
    [courses, enrolledIds],
  );

  const handleBack = useCallback(() => router.back(), []);

  const handleCoursePress = useCallback((courseId: number) => {
    router.push(`/(app)/course/${courseId}` as any);
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
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: colors.surfaceSecondary }}
        >
          <Ionicons name="school-outline" size={40} color={colors.textTertiary} />
        </View>
        <Text className="text-base font-semibold mt-2 text-center" style={{ color: colors.text }}>
          No Enrolled Courses
        </Text>
        <Text className="text-sm text-center mt-2 px-4" style={{ color: colors.textSecondary }}>
          Browse the catalog and enroll in courses to start learning
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-5 px-6 py-2.5 rounded-xl"
          style={{ backgroundColor: colors.primary }}
          accessibilityRole="button"
          accessibilityLabel="Browse Courses"
          accessibilityHint="Navigate to course catalog"
        >
          <Text className="text-sm font-semibold" style={{ color: colors.textInverse }}>
            Browse Courses
          </Text>
        </Pressable>
      </View>
    ),
    [colors],
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-3">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.surfaceSecondary }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to previous screen"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text className="text-xl font-bold flex-1" style={{ color: colors.text }} accessibilityRole="header">
          My Courses
        </Text>
        <View
          className="px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: colors.primaryLight + '20' }}
          accessible
          accessibilityLabel={`${enrolledCourses.length} enrolled courses`}
        >
          <Text className="text-xs font-semibold" style={{ color: colors.primary }} accessible={false}>
            {enrolledCourses.length} enrolled
          </Text>
        </View>
      </View>

      <LegendList
        data={enrolledCourses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

export default EnrolledCoursesScreen;
