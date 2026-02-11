/**
 * CourseDetailScreen
 *
 * Shows complete course information with instructor details,
 * enroll button, bookmark toggle, and "View Content" button
 * that opens the WebView content viewer.
 */

import { PlaceholderImage, ThemedButton } from '@/src/components';
import { useNotification, useTheme } from '@/src/context';
import { useBookmarkStore, useCourseStore } from '@/src/stores';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const CourseDetailScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const notification = useNotification();

  const courseDetail = useCourseStore((s) => s.courseDetail);
  const isLoadingDetail = useCourseStore((s) => s.isLoadingDetail);
  const error = useCourseStore((s) => s.error);
  const loadCourseDetail = useCourseStore((s) => s.loadCourseDetail);
  const clearCourseDetail = useCourseStore((s) => s.clearCourseDetail);

  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const isBookmarked = useBookmarkStore((s) => s.bookmarkedIds.includes(Number(id)));
  const enrollCourse = useBookmarkStore((s) => s.enrollCourse);
  const isEnrolled = useBookmarkStore((s) => s.enrolledIds.includes(Number(id)));

  useEffect(() => {
    if (id) {
      loadCourseDetail(Number(id));
    }
    return () => clearCourseDetail();
  }, [id, loadCourseDetail, clearCourseDetail]);

  const handleBack = useCallback(() => router.back(), []);

  const handleBookmark = useCallback(() => {
    toggleBookmark(Number(id));
    const wasBookmarked = isBookmarked;
    notification.success(wasBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  }, [id, toggleBookmark, isBookmarked, notification]);

  const handleEnroll = useCallback(() => {
    const courseId = Number(id);
    enrollCourse(courseId);
    notification.success('Successfully enrolled in this course!');
  }, [id, enrollCourse, notification]);

  const handleViewContent = useCallback(() => {
    if (courseDetail) {
      router.push({
        pathname: '/(app)/webview',
        params: {
          courseId: String(courseDetail.id),
          courseTitle: courseDetail.title,
        },
      });
    }
  }, [courseDetail]);

  // Loading state
  if (isLoadingDetail) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-sm mt-3" style={{ color: colors.textSecondary }}>
          Loading course...
        </Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !courseDetail) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.textTertiary} />
        <Text className="text-base font-semibold mt-4 text-center" style={{ color: colors.text }}>
          {error || 'Course not found'}
        </Text>
        <ThemedButton title="Go Back" onPress={handleBack} variant="outline" style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const discountedPrice = courseDetail.price * (1 - courseDetail.discountPercentage / 100);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Image */}
        <View className="relative">
          <PlaceholderImage
            uri={courseDetail.thumbnail}
            width="100%"
            height={220}
            placeholderIcon="book-outline"
            iconSize={48}
            accessibilityLabel={`${courseDetail.title} course thumbnail`}
          />
          {/* Top Buttons */}
          <View className="absolute top-3 left-4 right-4 flex-row justify-between">
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surface + 'E6' }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to previous screen"
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={handleBookmark}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surface + 'E6' }}
              accessibilityRole="button"
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              accessibilityHint={isBookmarked ? 'Removes this course from bookmarks' : 'Saves this course to bookmarks'}
              accessibilityState={{ selected: isBookmarked }}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? colors.primary : colors.text}
              />
            </Pressable>
          </View>
        </View>

        <View className="px-5 pt-5">
          {/* Category & Rating */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: colors.primaryLight + '20' }}>
              <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                {courseDetail.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text className="text-sm font-semibold ml-1" style={{ color: colors.text }}>
                {courseDetail.rating.toFixed(1)}
              </Text>
              <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                ({courseDetail.stock} students)
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold leading-7 mb-3" style={{ color: colors.text }} accessibilityRole="header">
            {courseDetail.title}
          </Text>

          {/* Price */}
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
              ${discountedPrice.toFixed(2)}
            </Text>
            {courseDetail.discountPercentage > 0 && (
              <>
                <Text
                  className="text-base ml-2 line-through"
                  style={{ color: colors.textTertiary }}
                >
                  ${courseDetail.price}
                </Text>
                <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: colors.errorLight }}>
                  <Text className="text-xs font-semibold" style={{ color: colors.error }}>
                    -{courseDetail.discountPercentage.toFixed(0)}%
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Instructor Card */}
          <View
            className="flex-row items-center p-3.5 rounded-2xl mb-5"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`Instructor: ${courseDetail.instructor.name}, ${courseDetail.instructor.location || 'Instructor'}`}
          >
            <PlaceholderImage
              uri={courseDetail.instructor.avatar}
              width={48}
              height={48}
              borderRadius={24}
              placeholderIcon="person"
              iconSize={24}
              accessibilityLabel={`${courseDetail.instructor.name}'s avatar`}
            />
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-semibold" style={{ color: colors.text }}>
                {courseDetail.instructor.name}
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                {courseDetail.instructor.location || 'Instructor'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
              About This Course
            </Text>
            <Text className="text-sm leading-[22px]" style={{ color: colors.textSecondary }}>
              {courseDetail.description}
            </Text>
          </View>

          {/* Course Info Grid */}
          <View
            className="rounded-2xl p-4 mb-5"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
              Course Details
            </Text>
            <View className="flex-row flex-wrap">
              <InfoChip icon="business-outline" label="Brand" value={courseDetail.brand} colors={colors} />
              <InfoChip icon="pricetag-outline" label="Category" value={courseDetail.category.replace(/-/g, ' ')} colors={colors} />
              <InfoChip icon="people-outline" label="Students" value={String(courseDetail.stock)} colors={colors} />
              <InfoChip icon="images-outline" label="Resources" value={`${courseDetail.images.length} files`} colors={colors} />
            </View>
          </View>

          {/* Course Images Preview */}
          {courseDetail.images.length > 0 && (
            <View className="mb-5">
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                Course Preview
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {courseDetail.images.map((img, index) => (
                  <PlaceholderImage
                    key={index}
                    uri={img}
                    width={200}
                    height={130}
                    borderRadius={12}
                    placeholderIcon="image-outline"
                    style={{ marginRight: 10 }}
                    accessibilityLabel={`Course preview image ${index + 1} of ${courseDetail.images.length}`}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 py-4 flex-row gap-3"
        style={{
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
        }}
      >
        {isEnrolled ? (
          <View className="flex-1 flex-row items-center gap-3">
            <View className="flex-1">
              <ThemedButton
                title="View Content"
                onPress={handleViewContent}
                variant="primary"
                accessibilityHint="Opens course content in viewer"
              />
            </View>
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.successLight }}
              accessible
              accessibilityLabel="Enrolled"
            >
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
          </View>
        ) : (
          <View className="flex-1">
            <ThemedButton
              title={`Enroll — $${discountedPrice.toFixed(2)}`}
              onPress={handleEnroll}
              variant="primary"
              accessibilityLabel={`Enroll in course for $${discountedPrice.toFixed(2)}`}
              accessibilityHint="Enrolls you in this course"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

/** Small info chip for course details grid */
function InfoChip({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  colors: ReturnType<typeof import('@/src/context').useTheme>['colors'];
}) {
  return (
    <View
      className="w-1/2 flex-row items-center py-2"
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <View className="ml-2">
        <Text className="text-[10px]" style={{ color: colors.textTertiary }} accessible={false}>{label}</Text>
        <Text className="text-xs font-medium capitalize" style={{ color: colors.text }} accessible={false}>{value}</Text>
      </View>
    </View>
  );
}

export default CourseDetailScreen;
