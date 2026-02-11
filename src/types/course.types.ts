/**
 * Course & Product Types
 *
 * Types for the public products API (used as courses)
 * and random users API (used as instructors).
 */

// Course and product types

/** Basic product from list endpoint */
export interface ProductListItem {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  images: string[];
}

/** Full product returned from detail endpoint */
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
}

/** Paginated products response */
export interface PaginatedProducts {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  currentPageItems: number;
  nextPage: boolean;
  previousPage: boolean;
  data: ProductListItem[];
}

// Instructor types

export interface RandomUserName {
  title: string;
  first: string;
  last: string;
}

export interface RandomUserPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface RandomUserDob {
  date: string;
  age: number;
}

export interface RandomUserLocation {
  city: string;
  state: string;
  country: string;
  postcode: string | number;
  street: { name: string; number: number };
  coordinates: { latitude: string; longitude: string };
  timezone: { offset: string; description: string };
}

export interface RandomUserLogin {
  uuid: string;
  username: string;
  password: string;
  salt: string;
  md5: string;
  sha1: string;
  sha256: string;
}

export interface RandomUser {
  id: number;
  gender: string;
  email: string;
  phone: string;
  cell: string;
  nat: string;
  name: RandomUserName;
  picture: RandomUserPicture;
  dob: RandomUserDob;
  registered: { date: string; age: number };
  location: RandomUserLocation;
  login: RandomUserLogin;
}

/** Paginated users response */
export interface PaginatedUsers {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  currentPageItems: number;
  nextPage: boolean;
  previousPage: boolean;
  data: RandomUser[];
}

// ============================================================================
// COMBINED COURSE MODEL (Product + Instructor)
// ============================================================================

/** A course combines a product (course data) with a random user (instructor) */
export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  instructor: {
    name: string;
    avatar: string;
    email: string;
    location: string;
  };
}

/** Course list item for FlatList rendering */
export interface CourseListItem {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  images: string[];
  instructor: {
    name: string;
    avatar: string;
  };
}
