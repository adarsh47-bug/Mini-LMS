/**
 * Course Store
 *
 * Zustand store for course catalog state management.
 * Handles fetching, caching, and pagination.
 * Search filtering is handled locally in screen components.
 */

import { fetchCourseDetail, fetchCourses, type CoursesPageResult } from '@/src/services';
import type { Course, CourseListItem } from '@/src/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CourseState {
  /** Course list items */
  courses: CourseListItem[];
  /** Currently viewed course detail */
  courseDetail: Course | null;
  /** Loading states */
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingDetail: boolean;
  /** Error state */
  error: string | null;
  /** Pagination */
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  /** Whether initial fetch has been done */
  isInitialized: boolean;

  /** Fetch first page of courses */
  fetchInitialCourses: () => Promise<void>;
  /** Fetch next page (append) */
  fetchMoreCourses: () => Promise<void>;
  /** Refresh courses (pull-to-refresh) */
  refreshCourses: () => Promise<void>;
  /** Fetch course detail */
  loadCourseDetail: (productId: number) => Promise<void>;
  /** Clear course detail */
  clearCourseDetail: () => void;
  /** Reset all course data (for logout) */
  reset: () => void;
}

export const useCourseStore = create<CourseState>()(
  devtools(
    (set, get) => ({
      courses: [],
      courseDetail: null,
      isLoading: false,
      isLoadingMore: false,
      isLoadingDetail: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      isInitialized: false,

      fetchInitialCourses: async () => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
          const result: CoursesPageResult = await fetchCourses(1, 10);
          set({
            courses: result.courses,
            currentPage: result.page,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            isLoading: false,
            isInitialized: true,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load courses';
          set({ error: message, isLoading: false, isInitialized: true });
        }
      },

      fetchMoreCourses: async () => {
        const { isLoadingMore, hasNextPage, currentPage } = get();
        if (isLoadingMore || !hasNextPage) return;

        set({ isLoadingMore: true });
        try {
          const nextPage = currentPage + 1;
          const result = await fetchCourses(nextPage, 10);
          set((state) => ({
            courses: [...state.courses, ...result.courses],
            currentPage: result.page,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            isLoadingMore: false,
          }));
        } catch {
          set({ isLoadingMore: false });
        }
      },

      refreshCourses: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await fetchCourses(1, 10);
          set({
            courses: result.courses,
            currentPage: result.page,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            isLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to refresh courses';
          set({ error: message, isLoading: false });
        }
      },

      loadCourseDetail: async (productId: number) => {
        set({ isLoadingDetail: true, courseDetail: null, error: null });
        try {
          const course = await fetchCourseDetail(productId);
          set({ courseDetail: course, isLoadingDetail: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load course details';
          set({ error: message, isLoadingDetail: false });
        }
      },

      clearCourseDetail: () => set({ courseDetail: null }),

      reset: () => {
        set({
          courses: [],
          courseDetail: null,
          isLoading: false,
          isLoadingMore: false,
          isLoadingDetail: false,
          error: null,
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          isInitialized: false,
        });
      },
    }),
    { name: 'course-store' },
  ),
);
