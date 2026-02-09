/**
 * Course Service
 *
 * API calls for fetching courses (products) and instructors (random users).
 * Maps the public FreeAPI endpoints to our course domain model.
 */

import type {
  ApiResponse,
  Course,
  CourseListItem,
  PaginatedProducts,
  PaginatedUsers,
  Product,
  RandomUser,
} from '@/src/types';
import { apiClient } from './api';

// ============================================================================
// RAW API CALLS
// ============================================================================

/** Fetch paginated products (courses) */
export async function fetchProducts(page = 1, limit = 10): Promise<ApiResponse<PaginatedProducts>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedProducts>>(
    `/public/randomproducts?page=${page}&limit=${limit}`,
  );
  return data;
}

/** Fetch a single product by ID */
export async function fetchProductById(id: number): Promise<ApiResponse<Product>> {
  const { data } = await apiClient.get<ApiResponse<Product>>(`/public/randomproducts/${id}`);
  return data;
}

/** Fetch paginated random users (instructors) */
export async function fetchRandomUsers(page = 1, limit = 10): Promise<ApiResponse<PaginatedUsers>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedUsers>>(
    `/public/randomusers?page=${page}&limit=${limit}`,
  );
  return data;
}

/** Fetch a single random user by ID */
export async function fetchRandomUserById(id: number): Promise<ApiResponse<RandomUser>> {
  const { data } = await apiClient.get<ApiResponse<RandomUser>>(`/public/randomusers/${id}`);
  return data;
}

// ============================================================================
// DOMAIN MAPPERS
// ============================================================================

/** Map a product + random user into a CourseListItem */
function mapToCourseListItem(
  product: { id: number; title: string; category: string; price: number; thumbnail: string; images: string[] },
  user?: RandomUser,
): CourseListItem {
  return {
    id: product.id,
    title: product.title,
    category: product.category,
    price: product.price,
    thumbnail: product.thumbnail,
    images: product.images,
    instructor: {
      name: user ? `${user.name.first} ${user.name.last}` : 'Unknown Instructor',
      avatar: user?.picture?.medium ?? '',
    },
  };
}

/** Map a full product + user into a Course */
function mapToCourse(product: Product, user?: RandomUser): Course {
  return {
    ...product,
    instructor: {
      name: user ? `${user.name.first} ${user.name.last}` : 'Unknown Instructor',
      avatar: user?.picture?.large ?? '',
      email: user?.email ?? '',
      location: user ? `${user.location.city}, ${user.location.country}` : '',
    },
  };
}

// ============================================================================
// HIGH-LEVEL COURSE FETCHERS
// ============================================================================

export interface CoursesPageResult {
  courses: CourseListItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
}

/** Fetch a page of courses (products merged with instructors) */
export async function fetchCourses(page = 1, limit = 10): Promise<CoursesPageResult> {
  // Fetch products and users concurrently
  const [productsRes, usersRes] = await Promise.all([
    fetchProducts(page, limit),
    fetchRandomUsers(page, limit),
  ]);

  const products = productsRes.data?.data ?? [];
  const users = usersRes.data?.data ?? [];

  const courses = products.map((product, index) => {
    const user = users[index % users.length];
    return mapToCourseListItem(product, user);
  });

  return {
    courses,
    page: productsRes.data?.page ?? page,
    totalPages: productsRes.data?.totalPages ?? 1,
    totalItems: productsRes.data?.totalItems ?? 0,
    hasNextPage: productsRes.data?.nextPage ?? false,
  };
}

/** Fetch full course detail by product ID */
export async function fetchCourseDetail(productId: number): Promise<Course> {
  const [productRes, userRes] = await Promise.all([
    fetchProductById(productId),
    fetchRandomUserById((productId % 50) + 1), // Map product to a user
  ]);

  const product = productRes.data;
  const user = userRes.data;

  if (!product) throw new Error('Course not found');

  return mapToCourse(product, user ?? undefined);
}
