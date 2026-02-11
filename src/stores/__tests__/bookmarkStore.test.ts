/**
 * Bookmark Store Tests
 */

import { checkBookmarkMilestone, resetBookmarkMilestone } from '@/src/services/notification.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBookmarkStore } from '../bookmarkStore';

// Mock the services
jest.mock('@/src/services/notification.service', () => ({
  checkBookmarkMilestone: jest.fn(),
  resetBookmarkMilestone: jest.fn(),
}));

describe('Bookmark Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBookmarkStore.setState({
      bookmarkedIds: [],
      enrolledIds: [],
    });
    jest.clearAllMocks();
  });

  describe('toggleBookmark', () => {
    it('should add bookmark when not bookmarked', () => {
      const { toggleBookmark } = useBookmarkStore.getState();
      toggleBookmark(1);

      const state = useBookmarkStore.getState();
      expect(state.bookmarkedIds).toContain(1);
      expect(checkBookmarkMilestone).toHaveBeenCalledWith(1);
    });

    it('should remove bookmark when already bookmarked', () => {
      useBookmarkStore.setState({ bookmarkedIds: [1, 2, 3] });

      const { toggleBookmark } = useBookmarkStore.getState();
      toggleBookmark(2);

      const state = useBookmarkStore.getState();
      expect(state.bookmarkedIds).toEqual([1, 3]);
      expect(state.bookmarkedIds).not.toContain(2);
    });

    it('should check milestone when adding bookmark', () => {
      const { toggleBookmark } = useBookmarkStore.getState();

      toggleBookmark(1);
      toggleBookmark(2);
      toggleBookmark(3);

      expect(checkBookmarkMilestone).toHaveBeenCalledTimes(3);
      expect(checkBookmarkMilestone).toHaveBeenLastCalledWith(3);
    });

    it('should not check milestone when removing bookmark', () => {
      useBookmarkStore.setState({ bookmarkedIds: [1, 2] });

      const { toggleBookmark } = useBookmarkStore.getState();
      toggleBookmark(2);

      expect(checkBookmarkMilestone).not.toHaveBeenCalled();
    });
  });

  describe('enrollCourse', () => {
    it('should enroll in a course', () => {
      const { enrollCourse } = useBookmarkStore.getState();
      enrollCourse(1);

      const state = useBookmarkStore.getState();
      expect(state.enrolledIds).toContain(1);
    });

    it('should not duplicate enrollment', () => {
      const { enrollCourse } = useBookmarkStore.getState();
      enrollCourse(1);
      enrollCourse(1);

      const state = useBookmarkStore.getState();
      expect(state.enrolledIds).toEqual([1]);
    });

    it('should enroll in multiple courses', () => {
      const { enrollCourse } = useBookmarkStore.getState();
      enrollCourse(1);
      enrollCourse(2);
      enrollCourse(3);

      const state = useBookmarkStore.getState();
      expect(state.enrolledIds).toEqual([1, 2, 3]);
    });
  });

  describe('reset', () => {
    it('should reset all bookmark data', () => {
      useBookmarkStore.setState({
        bookmarkedIds: [1, 2, 3],
        enrolledIds: [1, 2],
      });

      const { reset } = useBookmarkStore.getState();
      reset();

      const state = useBookmarkStore.getState();
      expect(state.bookmarkedIds).toEqual([]);
      expect(state.enrolledIds).toEqual([]);
      expect(resetBookmarkMilestone).toHaveBeenCalled();
    });
  });

  describe('persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      const { toggleBookmark, enrollCourse } = useBookmarkStore.getState();

      toggleBookmark(1);
      enrollCourse(1);

      // Allow time for async persistence
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
