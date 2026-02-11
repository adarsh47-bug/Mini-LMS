/**
 * Performance Constants
 * 
 * App-wide performance-related constants
 */

// Timeouts
export const TIMEOUTS = {
  /** Default API request timeout */
  API_DEFAULT: 30000,
  /** Image loading timeout */
  IMAGE_LOAD: 10000,
  /** Splash screen minimum display time */
  SPLASH_SCREEN: 150,
  /** Debounce delay for search inputs */
  SEARCH_DEBOUNCE: 300,
  /** Auto-save delay */
  AUTO_SAVE: 1000,
} as const;

// Animation durations
export const ANIMATIONS = {
  /** Fast animation (e.g., button press) */
  FAST: 150,
  /** Standard animation (e.g., modal open/close) */
  STANDARD: 300,
  /** Slow animation (e.g., page transitions) */
  SLOW: 500,
} as const;

// Performance thresholds
export const PERFORMANCE = {
  /** Maximum notification queue size */
  MAX_NOTIFICATIONS: 5,
  /** Maximum course items to render initially */
  INITIAL_RENDER_COUNT: 10,
  /** Virtual list window size */
  LIST_WINDOW_SIZE: 20,
  /** Image cache size in MB */
  IMAGE_CACHE_SIZE: 50,
} as const;

// Retry configuration
export const RETRY = {
  /** Maximum retry attempts for failed API calls */
  MAX_ATTEMPTS: 3,
  /** Base delay between retries in ms */
  BASE_DELAY: 1000,
  /** Exponential backoff multiplier */
  BACKOFF_MULTIPLIER: 2,
} as const;

// Cache configuration
export const CACHE = {
  /** Course list cache TTL in ms (5 minutes) */
  COURSE_LIST_TTL: 5 * 60 * 1000,
  /** User profile cache TTL in ms (10 minutes) */
  USER_PROFILE_TTL: 10 * 60 * 1000,
  /** Static content cache TTL in ms (1 hour) */
  STATIC_CONTENT_TTL: 60 * 60 * 1000,
} as const;

// UI Constants
export const UI = {
  /** Minimum touch target size (accessibility) */
  MIN_TOUCH_TARGET: 44,
  /** Maximum input field length */
  MAX_INPUT_LENGTH: 255,
  /** Maximum textarea length */
  MAX_TEXTAREA_LENGTH: 1000,
  /** Toast notification duration */
  TOAST_DURATION: 3000,
} as const;

// Validation
export const VALIDATION = {
  /** Minimum password length */
  MIN_PASSWORD_LENGTH: 6,
  /** Maximum password length */
  MAX_PASSWORD_LENGTH: 128,
  /** Minimum username length */
  MIN_USERNAME_LENGTH: 3,
  /** Maximum username length */
  MAX_USERNAME_LENGTH: 50,
  /** Email regex */
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Pagination
export const PAGINATION = {
  /** Default items per page */
  DEFAULT_PAGE_SIZE: 20,
  /** Max items per page */
  MAX_PAGE_SIZE: 100,
} as const;

// Feature flags (could be moved to env in future)
export const FEATURES = {
  /** Enable offline mode */
  OFFLINE_MODE: true,
  /** Enable push notifications */
  PUSH_NOTIFICATIONS: true,
  /** Enable analytics */
  ANALYTICS: false,
  /** Enable crash reporting */
  CRASH_REPORTING: false,
} as const;
