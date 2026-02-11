/**
 * Bookmark Store
 *
 * Zustand store with AsyncStorage persistence for course bookmarks.
 * Tracks bookmarked course IDs and enrolled course IDs.
 */

import { checkBookmarkMilestone, resetBookmarkMilestone } from '@/src/services/notification.service';
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
  /** Enroll in a course */
  enrollCourse: (courseId: number) => void;
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
          const newBookmarks = isCurrentlyBookmarked
            ? bookmarkedIds.filter((id) => id !== courseId)
            : [...bookmarkedIds, courseId];
          set({ bookmarkedIds: newBookmarks });

          // Check for 5+ bookmark milestone notification
          if (!isCurrentlyBookmarked) {
            checkBookmarkMilestone(newBookmarks.length);
          }
        },

        enrollCourse: (courseId: number) => {
          const { enrolledIds } = get();
          if (!enrolledIds.includes(courseId)) {
            set({ enrolledIds: [...enrolledIds, courseId] });
          }
        },

        reset: () => {
          set({
            bookmarkedIds: [],
            enrolledIds: [],
          });
          // Reset milestone so it can trigger again for new users
          resetBookmarkMilestone();
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
