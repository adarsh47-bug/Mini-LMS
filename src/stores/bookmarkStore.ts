/**
 * Bookmark Store
 *
 * Zustand store with AsyncStorage persistence for course bookmarks.
 * Tracks bookmarked course IDs and enrolled course IDs.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

interface BookmarkState {
  /** Set of bookmarked course IDs */
  bookmarkedIds: number[];
  /** Set of enrolled course IDs */
  enrolledIds: number[];

  /** Toggle bookmark for a course */
  toggleBookmark: (courseId: number) => void;
  /** Check if a course is bookmarked */
  isBookmarked: (courseId: number) => boolean;
  /** Enroll in a course */
  enrollCourse: (courseId: number) => void;
  /** Check if enrolled in a course */
  isEnrolled: (courseId: number) => boolean;
  /** Get total bookmark count */
  bookmarkCount: () => number;
  /** Get total enrolled count */
  enrolledCount: () => number;
  /** Reset all bookmark data (for logout) */
  reset: () => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  devtools(
    persist(
      (set, get) => ({
        bookmarkedIds: [],
        enrolledIds: [],

        toggleBookmark: (courseId: number) => {
          const { bookmarkedIds } = get();
          const isCurrentlyBookmarked = bookmarkedIds.includes(courseId);
          set({
            bookmarkedIds: isCurrentlyBookmarked
              ? bookmarkedIds.filter((id) => id !== courseId)
              : [...bookmarkedIds, courseId],
          });
        },

        isBookmarked: (courseId: number) => {
          return get().bookmarkedIds.includes(courseId);
        },

        enrollCourse: (courseId: number) => {
          const { enrolledIds } = get();
          if (!enrolledIds.includes(courseId)) {
            set({ enrolledIds: [...enrolledIds, courseId] });
          }
        },

        isEnrolled: (courseId: number) => {
          return get().enrolledIds.includes(courseId);
        },

        bookmarkCount: () => get().bookmarkedIds.length,
        enrolledCount: () => get().enrolledIds.length,

        reset: () => {
          set({
            bookmarkedIds: [],
            enrolledIds: [],
          });
        },
      }),
      {
        name: 'bookmark-store',
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
    { name: 'bookmark-store' },
  ),
);
