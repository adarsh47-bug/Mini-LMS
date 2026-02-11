/**
 * Course Store Tests
 */

import { fetchCourseDetail, fetchCourses } from '@/src/services';
import type { Course, CourseListItem } from '@/src/types';
import { useCourseStore } from '../courseStore';

// Mock the services
jest.mock('@/src/services', () => ({
  fetchCourses: jest.fn(),
  fetchCourseDetail: jest.fn(),
}));

const mockCourses: CourseListItem[] = [
  {
    id: 1,
    title: 'Test Course 1',
    category: 'Programming',
    price: 99.99,
    thumbnail: 'https://example.com/image1.jpg',
    images: ['https://example.com/image1.jpg'],
    instructor: {
      name: 'John Doe',
      avatar: 'https://example.com/avatar1.jpg',
    },
  },
  {
    id: 2,
    title: 'Test Course 2',
    category: 'Design',
    price: 79.99,
    thumbnail: 'https://example.com/image2.jpg',
    images: ['https://example.com/image2.jpg'],
    instructor: {
      name: 'Jane Smith',
      avatar: 'https://example.com/avatar2.jpg',
    },
  },
];

const mockCourseDetail: Course = {
  id: 1,
  title: 'Test Course 1',
  description: 'Description 1',
  category: 'Programming',
  brand: 'Test Brand',
  price: 99.99,
  discountPercentage: 10,
  rating: 4.5,
  stock: 100,
  thumbnail: 'https://example.com/image1.jpg',
  images: ['https://example.com/image1.jpg'],
  instructor: {
    name: 'John Doe',
    avatar: 'https://example.com/avatar1.jpg',
    email: 'john@example.com',
    location: 'New York, USA',
  },
};

describe('Course Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCourseStore.setState({
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
    jest.clearAllMocks();
  });

  describe('fetchInitialCourses', () => {
    it('should fetch initial courses successfully', async () => {
      (fetchCourses as jest.Mock).mockResolvedValueOnce({
        courses: mockCourses,
        page: 1,
        totalPages: 5,
        hasNextPage: true,
      });

      const { fetchInitialCourses } = useCourseStore.getState();
      await fetchInitialCourses();

      const state = useCourseStore.getState();
      expect(state.courses).toEqual(mockCourses);
      expect(state.currentPage).toBe(1);
      expect(state.totalPages).toBe(5);
      expect(state.hasNextPage).toBe(true);
      expect(state.isInitialized).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle fetch error', async () => {
      (fetchCourses as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { fetchInitialCourses } = useCourseStore.getState();
      await fetchInitialCourses();

      const state = useCourseStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it('should not fetch if already loading', async () => {
      useCourseStore.setState({ isLoading: true });

      const { fetchInitialCourses } = useCourseStore.getState();
      await fetchInitialCourses();

      expect(fetchCourses).not.toHaveBeenCalled();
    });
  });

  describe('fetchMoreCourses', () => {
    it('should fetch next page of courses', async () => {
      useCourseStore.setState({
        courses: mockCourses.slice(0, 1),
        currentPage: 1,
        hasNextPage: true,
      });

      (fetchCourses as jest.Mock).mockResolvedValueOnce({
        courses: mockCourses.slice(1),
        page: 2,
        totalPages: 5,
        hasNextPage: true,
      });

      const { fetchMoreCourses } = useCourseStore.getState();
      await fetchMoreCourses();

      const state = useCourseStore.getState();
      expect(state.courses).toHaveLength(2);
      expect(state.currentPage).toBe(2);
      expect(state.isLoadingMore).toBe(false);
    });

    it('should not fetch if no next page', async () => {
      useCourseStore.setState({ hasNextPage: false });

      const { fetchMoreCourses } = useCourseStore.getState();
      await fetchMoreCourses();

      expect(fetchCourses).not.toHaveBeenCalled();
    });

    it('should not fetch if already loading more', async () => {
      useCourseStore.setState({ isLoadingMore: true, hasNextPage: true });

      const { fetchMoreCourses } = useCourseStore.getState();
      await fetchMoreCourses();

      expect(fetchCourses).not.toHaveBeenCalled();
    });
  });

  describe('refreshCourses', () => {
    it('should refresh course list', async () => {
      useCourseStore.setState({
        courses: mockCourses,
        currentPage: 2,
      });

      (fetchCourses as jest.Mock).mockResolvedValueOnce({
        courses: mockCourses,
        page: 1,
        totalPages: 5,
        hasNextPage: true,
      });

      const { refreshCourses } = useCourseStore.getState();
      await refreshCourses();

      const state = useCourseStore.getState();
      expect(state.currentPage).toBe(1);
      expect(state.error).toBe(null);
    });
  });

  describe('loadCourseDetail', () => {
    it('should load course detail successfully', async () => {
      (fetchCourseDetail as jest.Mock).mockResolvedValueOnce(mockCourseDetail);

      const { loadCourseDetail } = useCourseStore.getState();
      await loadCourseDetail(1);

      const state = useCourseStore.getState();
      expect(state.courseDetail).toEqual(mockCourseDetail);
      expect(state.isLoadingDetail).toBe(false);
    });

    it('should handle course detail error', async () => {
      (fetchCourseDetail as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

      const { loadCourseDetail } = useCourseStore.getState();
      await loadCourseDetail(999);

      const state = useCourseStore.getState();
      expect(state.courseDetail).toBe(null);
      expect(state.isLoadingDetail).toBe(false);
    });
  });

  describe('clearCourseDetail', () => {
    it('should clear course detail', () => {
      useCourseStore.setState({ courseDetail: mockCourseDetail });

      const { clearCourseDetail } = useCourseStore.getState();
      clearCourseDetail();

      const state = useCourseStore.getState();
      expect(state.courseDetail).toBe(null);
    });
  });

  describe('reset', () => {
    it('should reset all course data', () => {
      useCourseStore.setState({
        courses: mockCourses,
        courseDetail: mockCourseDetail,
        currentPage: 3,
        isInitialized: true,
      });

      const { reset } = useCourseStore.getState();
      reset();

      const state = useCourseStore.getState();
      expect(state.courses).toEqual([]);
      expect(state.courseDetail).toBe(null);
      expect(state.currentPage).toBe(1);
      expect(state.isInitialized).toBe(false);
    });
  });
});
