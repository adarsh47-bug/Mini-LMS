# MLMS - Mini Learning Management System

A production-ready React Native Expo mobile application demonstrating advanced mobile development practices, native features integration, and comprehensive security implementation.

Built for the React Native Developer Assignment - showcasing expertise in authentication, WebView integration, state management, native features, and real-world mobile app challenges.

---

## 📱 Screenshots

_Note: Screenshots will be added after building the APK_

**Main Screens:**
- Login/Register with validation
- Course Catalog with search
- Course Details with enrollment
- Bookmarks management
- User Profile with stats
- WebView course content viewer
- Notifications and offline mode

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **iOS Simulator** (macOS only) or **Android Studio** with emulator
- **Git** for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mlms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration (see Environment Variables section below)
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   ```bash
   # iOS (macOS only)
   npm run ios
   
   # Android
   npm run android
   
   # Web (limited native features)
   npm run web
   ```

### Building APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build development APK
eas build --platform android --profile development

# Build production APK
eas build --platform android --profile production
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run TypeScript type checking
npm run typecheck

# Run linter
npm run lint
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.freeapi.app/api/v1
EXPO_PUBLIC_API_TIMEOUT=60000

# Environment
EXPO_PUBLIC_ENV=development
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EXPO_PUBLIC_API_BASE_URL` | Base URL for FreeAPI backend | `https://api.freeapi.app/api/v1` | ✅ Yes |
| `EXPO_PUBLIC_API_TIMEOUT` | API request timeout in milliseconds | `60000` (60s) | ✅ Yes |
| `EXPO_PUBLIC_ENV` | Environment mode (`development`, `staging`, `production`) | `development` | ✅ Yes |

**Note:** All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the Expo app.

---

## 🏗️ Key Architectural Decisions

### 1. **State Management Strategy**

**Choice: Zustand + Expo SecureStore + AsyncStorage**

- **Zustand**: Lightweight global state management with TypeScript support and minimal boilerplate
- **Expo SecureStore**: Platform-encrypted storage for sensitive data (auth tokens) using iOS Keychain and Android Keystore
- **AsyncStorage**: Non-sensitive data persistence (bookmarks, preferences, cache)

**Why not Redux?** Zustand offers better TypeScript inference, smaller bundle size, and simpler API while maintaining powerful features like middleware and DevTools integration.

### 2. **API Architecture**

**Centralized Axios Client with Interceptors**

```typescript
// Request Interceptor: Auto token injection
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: Auto token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh and retry request
    }
    return Promise.reject(error);
  }
);
```

**Features:**
- Automatic auth token injection on every request  
- Token refresh handling on 401 responses
- Exponential backoff retry logic (3 attempts) for network/5xx errors
- Request deduplication to prevent duplicate concurrent requests
- 60-second timeout with graceful error handling

### 3. **Navigation Architecture**

**File-based Routing with Expo Router**

```
app/
├── _layout.tsx              # Root layout with providers
├── (auth)/                  # Unauthenticated routes
│   ├── index.tsx            # Welcome screen
│   ├── login.tsx            # Login
│   └── register.tsx         # Register
└── (app)/                   # Authenticated routes (protected)
    ├── (tabs)/              # Bottom tab navigation
    │   ├── index.tsx        # Courses
    │   ├── bookmarks.tsx    # Bookmarks
    │   └── profile.tsx      # Profile
    ├── course/[id].tsx      # Dynamic course details
    └── webview.tsx          # WebView content viewer
```

**Benefits:**
- Type-safe navigation with automatic TypeScript types
- Automatic deep linking support
- Cleaner code organization with convention over configuration
- Built-in authentication guards via layout groups

### 4. **Performance Optimizations**

**List Rendering:**
- `FlashList` (drop-in FlatList replacement) for 10x better performance
- `React.memo` on CourseCard components to prevent unnecessary re-renders
- `keyExtractor` using stable IDs
- `removeClippedSubviews` for off-screen view recycling
- Pagination with infinite scroll (20 items per page)

**Component Optimization:**
- `useCallback` for stable function references in props
- `useMemo` for expensive computations (search filtering, sorting)
- Expo Image with built-in caching and progressive loading
- Code splitting with dynamic imports where applicable

### 5. **Security Implementation**

**Multi-layered Security Approach:**

1. **Secure Token Storage**
   - iOS: Keychain Services (hardware-encrypted)
   - Android: Keystore System (hardware-backed if available)
   - Web: Encrypted localStorage with fallback

2. **Data Encryption**
   - AES-256 encryption for sensitive user data
   - SHA-256 hashing for password validation
   - Secure random key generation using Expo Crypto

3. **Input Validation**
   - Zod schemas for runtime type validation
   - XSS protection via input sanitization
   - Email format validation and normalization

4. **Network Security**
   - HTTPS-only API communication
   - Certificate pinning support (configurable)
   - Request timeout and retry limits

5. **Device Security**
   - Jailbreak/root detection (iOS/Android)
   - Secure flag for screenshots (Android)

### 6. **Error Handling Strategy**

**Resilient Error Management:**

```typescript
// Error Boundary for React crashes
<ErrorBoundary fallback={<ErrorFallbackUI />}>
  <App />
</ErrorBoundary>

// Network error handling with retry
try {
  await fetchCourses();
} catch (error) {
  if (isNetworkError(error)) {
    showRetryOption();
  } else {
    showGenericError();
  }
}

// Offline mode detection
useNetworkMonitor((isConnected) => {
  if (!isConnected) {
    showOfflineBanner();
  }
});
```

**Features:**
- React Error Boundary to catch component crashes
- Offline mode banner with real-time network monitoring
- Axios retry interceptor with exponential backoff
- User-friendly error messages mapped from API codes
- Graceful degradation for missing native features

### 7. **Testing Strategy**

**Comprehensive Test Coverage (>70%)**

```
__tests__/
├── components/        # Component behavior tests
├── services/          # API service tests
├── stores/            # State management tests
├── hooks/             # Custom hook tests
└── utils/             # Utility function tests
```

**Stack:**
- Jest + React Native Testing Library
- Mock implementation for Expo modules
- Coverage enforcement via jest.config.js
- CI/CD integration ready

---

## 📁 Project Structure

```
mlms/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout (providers, theme)
│   ├── global.css                # NativeWind global styles
│   ├── (app)/                    # Authenticated routes
│   │   ├── _layout.tsx           # App layout with tab navigation
│   │   ├── (tabs)/               # Bottom tabs
│   │   │   ├── index.tsx         # Courses home
│   │   │   ├── bookmarks.tsx     # Bookmarks
│   │   │   └── profile.tsx       # Profile
│   │   ├── course/[id].tsx       # Course detail (dynamic route)
│   │   ├── webview.tsx           # WebView content viewer
│   │   ├── enrolled.tsx          # Enrolled courses
│   │   └── change-password.tsx   # Password change
│   └── (auth)/                   # Public routes
│       ├── index.tsx             # Welcome/Intro
│       ├── login.tsx             # Login
│       ├── register.tsx          # Registration
│       └── forgot-password.tsx   # Password recovery
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ThemedButton.tsx
│   │   ├── ThemedInput.tsx
│   │   ├── CourseCard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── AppNotify/            # Notification system
│   │   └── NetworkStatus/        # Network indicators
│   │
│   ├── screens/                  # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── CourseListScreen.tsx
│   │   ├── CourseDetailScreen.tsx
│   │   └── ...
│   │
│   ├── services/                 # API and business logic
│   │   ├── api.ts                # Axios client + interceptors
│   │   ├── auth.service.ts       # Auth API calls
│   │   ├── course.service.ts     # Course API calls
│   │   └── notification.service.ts
│   │
│   ├── stores/                   # Zustand state stores
│   │   ├── bookmarkStore.ts      # Bookmarks management
│   │   ├── courseStore.ts        # Courses cache
│   │   └── networkStore.ts       # Network state
│   │
│   ├── context/                  # React Context providers
│   │   ├── auth-context.tsx      # Auth state
│   │   ├── theme-context.tsx     # Dark/light theme
│   │   └── notification-context.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useNetworkMonitor.ts
│   │   ├── useStorageState.ts
│   │   └── useNotificationHandler.ts
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── auth.types.ts         # Auth + validation schemas
│   │   ├── course.types.ts       # Course/product types
│   │   └── api.types.ts          # API request/response
│   │
│   ├── utils/                    # Utility functions
│   │   ├── logger.utils.ts       # Centralized logging
│   │   ├── storage.utils.ts      # Secure storage helpers
│   │   ├── security.utils.ts     # Encryption, validation
│   │   ├── error.utils.ts        # Error mapping
│   │   └── date.utils.ts         # Date formatting
│   │
│   └── constants/                # App-wide constants
│       ├── app.constants.ts      # App metadata, API config
│       ├── colors.constants.ts   # Theme colors
│       └── tabs.constants.ts     # Tab configuration
│
├── assets/                       # Static assets
│   └── images/                   # Icons, splash screens
│
├── documentation/                # Project documentation
│   ├── tasks.md                  # Assignment requirements
│   ├── FreeAPI_*.md              # API documentation
│   ├── TESTING.md                # Testing guide
│   ├── SECURITY.md               # Security practices
│   └── QUICK_REFERENCE.md        # Quick commands
│
├── .env.example                  # Environment template
├── app.config.js                 # Expo configuration
├── jest.config.js                # Jest testing config
├── tailwind.config.js            # NativeWind config
└── tsconfig.json                 # TypeScript config
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React Native Expo SDK 54 | Cross-platform mobile development |
| **Language** | TypeScript (strict mode) | Type safety and developer experience |
| **Navigation** | Expo Router | File-based routing with type safety |
| **Styling** | NativeWind (Tailwind CSS) | Utility-first responsive styling |
| **State Management** | Zustand | Lightweight global state |
| **Data Fetching** | Axios | HTTP client with interceptors |
| **Forms** | React Hook Form | Performant form handling |
| **Validation** | Zod | Runtime schema validation |
| **Testing** | Jest + Testing Library | Unit and integration testing |
| **Secure Storage** | Expo SecureStore | Encrypted token storage |
| **Persistence** | AsyncStorage | Non-sensitive data cache |
| **Notifications** | Expo Notifications | Push notifications |
| **Images** | Expo Image | Optimized image loading |
| **Network** | Expo Network | Connectivity monitoring |
| **Encryption** | Expo Crypto | AES encryption, SHA hashing |

---

## ✨ Features Implemented

### ✅ Part 1: Authentication & User Management
- [x] Login/Register with FreeAPI `/api/v1/users` endpoints
- [x] Secure token storage using Expo SecureStore (Keychain/Keystore)
- [x] Auto-login on app restart with token validation
- [x] Logout with complete token cleanup
- [x] Token refresh handling on 401 responses
- [x] Profile screen with user info and stats
- [x] Profile picture update (camera + gallery)
- [x] User statistics (courses enrolled, bookmarks count)
- [x] Password change functionality

### ✅ Part 2: Course Catalog
- [x] Fetch courses from `/api/v1/public/randomproducts`
- [x] Fetch instructors from `/api/v1/public/randomusers`
- [x] Scrollable course list with FlashList optimization
- [x] Course thumbnail, instructor, title, description display
- [x] Bookmark icon with toggle functionality
- [x] Pull-to-refresh with smooth animations
- [x] Real-time search filtering (title, category, description, instructor)
- [x] Course detail screen with complete information
- [x] Enroll button with visual feedback
- [x] Bookmark persistence with AsyncStorage

### ✅ Part 3: WebView Integration
- [x] WebView screen for course content display
- [x] HTML template for course details rendering
- [x] Native-to-WebView communication via headers
- [x] JavaScript injection for dynamic data
- [x] WebView error handling

### ✅ Part 4: Native Features
- [x] Notification permission request on first app launch
- [x] Local notification on 5+ courses bookmarked
- [x] 24-hour inactivity reminder notification
- [x] Android notification channels configuration
- [x] Notification scheduling and cancellation

### ✅ Part 5: State Management & Performance
- [x] Zustand stores for bookmarks, courses, network state
- [x] Expo SecureStore for auth tokens (encrypted)
- [x] AsyncStorage for bookmarks and preferences
- [x] FlashList with proper optimization (keyExtractor, memo)
- [x] Pull-to-refresh without jank
- [x] Component memoization and stable callbacks
- [x] Image caching with Expo Image

### ✅ Part 6: Error Handling
- [x] API failure retry with exponential backoff (3 attempts)
- [x] User-friendly error messages
- [x] Request timeout handling (60s)
- [x] Offline mode banner with network monitoring
- [x] WebView load error handling
- [x] React Error Boundary for crash recovery

### 🌟 Bonus Features Implemented
- [x] **Testing**: Jest + Testing Library with >70% coverage
- [x] **Security**: AES encryption, jailbreak detection, input sanitization
- [x] **Dark Mode**: System-aware theme switching
- [x] **Form Validation**: Zod schemas with real-time feedback
- [x] **Logging**: Centralized logger with environment awareness
- [x] **TypeScript**: Strict mode with comprehensive types
- [x] **Performance**: Optimized lists, memoization, caching

---

## 🔒 Security Features

1. **Token Security**
   - iOS: Keychain Services (hardware-encrypted)
   - Android: Keystore (hardware-backed encryption when available)
   - Automatic token cleanup on logout/401

2. **Data Encryption**
   - AES-256 encryption for sensitive data
   - SHA-256 hashing for integrity checks
   - Secure random key generation

3. **Input Protection**
   - XSS prevention via sanitization
   - Email validation and normalization
   - Password strength requirements (min 6 chars)

4. **Network Security**
   - HTTPS-only communication
   - Request/response timeout limits
   - Certificate pinning support (optional)

5. **Device Security**
   - Jailbreak detection (iOS)
   - Root detection (Android)
   - Platform-specific security checks

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Coverage:**
- Unit tests: Services, stores, utilities, hooks
- Component tests: UI components behavior
- Integration tests: API calls, state updates
- Overall coverage: >70% (enforced)

**Test Files:**
```
src/
├── components/__tests__/
├── services/__tests__/
├── stores/__tests__/
├── hooks/__tests__/
└── utils/__tests__/
```

See [TESTING.md](./documentation/TESTING.md) for detailed testing guide.

---

## 📚 API Documentation

**Base URL:** `https://api.freeapi.app/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register new user |
| POST | `/users/login` | Login user |
| POST | `/users/logout` | Logout current user |
| GET | `/users/current-user` | Get current user profile |
| POST | `/users/change-password` | Change user password |
| POST | `/users/refresh-token` | Refresh access token |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/randomproducts` | Get random products (courses) |
| GET | `/public/randomproducts?page=1&limit=20` | Paginated products |
| GET | `/public/randomusers` | Get random users (instructors) |

See [documentation/FreeAPI_*.md](./documentation/) for detailed API documentation.

---

## ⚠️ Known Issues/Limitations

### Platform Limitations

1. **Notifications on Simulators**
   - **Issue**: Push notifications don't work on iOS Simulator or Android Emulator
   - **Workaround**: Test on physical device or use Expo Go
   - **Impact**: Local notifications for bookmarks and inactivity reminders

2. **Camera/Image Picker in Expo Go**
   - **Issue**: Full camera access requires development build
   - **Workaround**: Use `expo-dev-client` or build custom APK with EAS
   - **Impact**: Profile picture upload from camera

3. **Web Platform**
   - **Issue**: Limited native features (notifications, secure storage)
   - **Workaround**: Graceful degradation with fallbacks
   - **Impact**: Reduced functionality on web platform

### API Limitations

4. **Random Product/User Data**
   - **Issue**: FreeAPI returns random products/users, not real LMS data
   - **Mapping**: Products → Courses, Users → Instructors
   - **Impact**: No real course content, enrollment is local-only

5. **No Course Content Backend**
   - **Issue**: WebView displays generated HTML, not real course videos/materials
   - **Workaround**: Local HTML template with course details
   - **Impact**: Limited WebView functionality demonstration

6. **Token Refresh Reliability**
   - **Issue**: FreeAPI token refresh occasionally fails
   - **Workaround**: Automatic re-login prompt on failure
   - **Impact**: User may need to login again after extended session

### Performance Considerations

7. **First Launch Delay**
   - **Issue**: Initial API calls may be slow (~2-3s)
   - **Cause**: FreeAPI cold start time
   - **Workaround**: Loading indicators and skeleton screens

8. **Large Image Loading**
   - **Issue**: Some product images are large (>1MB)
   - **Workaround**: Expo Image with progressive loading and caching
   - **Impact**: Minor delay on slow networks

### Testing Limitations

9. **Expo Module Mocking**
   - **Issue**: Some Expo modules (SecureStore, Notifications) need manual mocks
   - **Workaround**: Jest mock implementations in `jest.setup.js`
   - **Impact**: Some integration tests may not cover full native behavior

### Future Improvements

- [ ] Implement proper course video playback
- [ ] Add biometric authentication (Face ID/Touch ID/Fingerprint)
- [ ] Integrate real error tracking (Sentry)
- [ ] Add analytics tracking (Expo Analytics)
- [ ] Implement background fetch for course updates
- [ ] Add offline course caching with sync
- [ ] Implement deep linking for course sharing
- [ ] Add accessibility features (screen reader support)

---

## 🎯 Assignment Compliance

This project fulfills all mandatory requirements:

✅ **Mandatory Technologies:**
- React Native Expo (SDK 54)
- TypeScript (strict mode)
- Expo SecureStore (auth tokens)
- AsyncStorage (bookmarks)
- Expo Router (navigation)
- NativeWind (styling)

✅ **Bonus Technologies:**
- Jest + Testing Library (>70% coverage)
- React Hook Form (forms)
- Zod (validation)
- Expo Image (caching)
- Custom error tracking
- Custom logging solution

✅ **All Parts Implemented:**
- Part 1: Authentication & User Management ✅
- Part 2: Course Catalog ✅
- Part 3: WebView Integration ✅
- Part 4: Native Features ✅
- Part 5: State Management & Performance ✅
- Part 6: Error Handling ✅

---

## 📖 Additional Documentation

- [QUICK_REFERENCE.md](./documentation/QUICK_REFERENCE.md) - Common commands and patterns
- [TESTING.md](./documentation/TESTING.md) - Testing guide and best practices
- [SECURITY.md](./documentation/SECURITY.md) - Security implementation details
- [FreeAPI Documentation](./documentation/FreeAPI_*.md) - API endpoint documentation
- [Assignment Requirements](./documentation/tasks.md) - Original assignment spec

---

## 📝 License

This project is built as part of a developer assignment and is for demonstration purposes.

---

## 👨‍💻 Author

Built with ❤️ for the React Native Expo Developer Assignment

---

## 🙏 Acknowledgments

- [FreeAPI](https://freeapi.app/) for providing the backend API
- [Expo](https://expo.dev/) for the amazing development framework
- [React Native](https://reactnative.dev/) community for excellent documentation
- [NativeWind](https://www.nativewind.dev/) for Tailwind CSS in React Native
