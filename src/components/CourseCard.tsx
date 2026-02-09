/**
 * CourseCard
 *
 * Reusable card component for displaying course items in lists.
 * Supports bookmark toggle, image placeholder fallback, and themed styling.
 */

import { useTheme } from '@/src/context';
import { useBookmarkStore } from '@/src/stores';
import type { CourseListItem } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import PlaceholderImage from './PlaceholderImage';

interface CourseCardProps {
  course: CourseListItem;
  onPress: (courseId: number) => void;
}

function CourseCard({ course, onPress }: CourseCardProps) {
  const { colors } = useTheme();
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const isBookmarked = useBookmarkStore((s) => s.bookmarkedIds.includes(course.id));

  const handleBookmark = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      toggleBookmark(course.id);
    },
    [course.id, toggleBookmark],
  );

  const handlePress = useCallback(() => onPress(course.id), [course.id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl mb-3 overflow-hidden"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Thumbnail */}
      <View className="relative">
        <PlaceholderImage
          uri={course.thumbnail}
          width="100%"
          height={160}
          placeholderIcon="book-outline"
          iconSize={40}
        />
        {/* Category badge */}
        <View
          className="absolute top-3 left-3 px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: colors.primary + 'E6' }}
        >
          <Text className="text-xs font-semibold" style={{ color: colors.white }}>
            {course.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
        {/* Bookmark button */}
        <Pressable
          onPress={handleBookmark}
          className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface + 'E6' }}
          hitSlop={8}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isBookmarked ? colors.primary : colors.textSecondary}
          />
        </Pressable>
        {/* Price badge */}
        <View
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: colors.secondary + 'E6' }}
        >
          <Text className="text-xs font-bold" style={{ color: colors.white }}>
            ${course.price}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-3.5">
        <Text
          className="text-[15px] font-semibold leading-5"
          style={{ color: colors.text }}
          numberOfLines={2}
        >
          {course.title}
        </Text>

        {/* Instructor */}
        <View className="flex-row items-center mt-2.5">
          <PlaceholderImage
            uri={course.instructor.avatar}
            width={24}
            height={24}
            borderRadius={12}
            placeholderIcon="person"
            iconSize={14}
          />
          <Text
            className="text-xs ml-2 flex-1"
            style={{ color: colors.textSecondary }}
            numberOfLines={1}
          >
            {course.instructor.name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default React.memo(CourseCard);
