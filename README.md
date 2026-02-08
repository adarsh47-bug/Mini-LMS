# LMS - Mini Learning Management System

A feature-rich Mini LMS Mobile App built with React Native Expo, demonstrating proficiency in native features, WebView integration, state management, and production-ready architecture.

## Features

### Authentication & User Management
- Login/Register with secure token storage (Expo SecureStore)
- Auto-login on app restart with token validation
- Profile screen with user stats and avatar display
- Secure logout with token cleanup

### Course Catalog
- Browse courses with instructor information
- Search/filter by title, description, category, or instructor
- Pull-to-refresh with smooth animations
- Optimized FlatList with memoization and windowing
- Course detail view with enrollment and bookmarking

### Bookmarks
- Bookmark/unbookmark courses with instant toggle
- Dedicated bookmarks tab with persisted data (AsyncStorage)
- Notification milestone when 5+ courses bookmarked

### WebView Integration
- Course content viewer using embedded WebView
- Bidirectional native-to-WebView communication
- JavaScript injection for course data sync
- Native message handling from WebView events

### Notifications
- Permission request on app launch
- Bookmark milestone notification (5 courses)
- 24-hour inactivity reminder scheduling
- Android notification channel configuration

### Error Handling & Resilience
- Error boundary for graceful crash recovery
- Offline mode banner with network monitoring
- Axios retry logic with exponential backoff (3 retries)
- Request timeout handling (15s)
- User-friendly error messages

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind (Tailwind CSS) |
| State Management | Zustand |
| Data Fetching | TanStack React Query + Axios |
| Secure Storage | Expo SecureStore |
| Persistence | AsyncStorage |
| Animations | React Native Reanimated |
| Images | Expo Image (with caching) |
| Notifications | Expo Notifications |
| Network | Expo Network |

## Project Structure

```
LMS/
├── app/                          # Expo Router - file-based routing
│   ├── _layout.tsx               # Root layout (providers, auth bootstrap)
│   ├── index.tsx                 # Entry redirect (auth check)
│   ├── login.tsx                 # Login screen
│   ├── register.tsx              # Registration screen
│   ├── webview.tsx               # WebView course content viewer
│   ├── course/
│   │   └── [id].tsx              # Dynamic course detail screen
│   └── (tabs)/
│       ├── _layout.tsx           # Tab navigator (auth-protected)
│       ├── index.tsx             # Courses list + search
│       ├── bookmarks.tsx         # Bookmarked courses
│       └── profile.tsx           # User profile + stats
├── components/
│   ├── error-boundary.tsx        # React error boundary
│   └── ui/                       # Reusable UI components
│       ├── button.tsx            # Multi-variant button
│       ├── input.tsx             # Form input with validation
│       ├── empty-state.tsx       # Empty state placeholder
│       ├── error-view.tsx        # Error display with retry
│       ├── loading-screen.tsx    # Full-screen loader
│       └── offline-banner.tsx    # Network status banner
├── services/
│   ├── api-client.ts             # Axios instance with interceptors
│   ├── auth-service.ts           # Authentication API calls
│   ├── course-service.ts         # Course/instructor API calls
│   └── notification-service.ts   # Push notification helpers
├── stores/
│   ├── auth-store.ts             # Auth state (Zustand + SecureStore)
│   ├── course-store.ts           # Courses, bookmarks, enrollment
│   └── app-store.ts              # App preferences, network state
├── hooks/
│   ├── use-courses.ts            # Course data fetching hook
│   ├── use-network-monitor.ts    # Network connectivity hook
│   ├── use-color-scheme.ts       # Theme detection hook
│   └── use-theme-color.ts        # Themed color accessor
├── types/
│   └── index.ts                  # TypeScript interfaces
├── utils/
│   └── helpers.ts                # Utility functions
├── constants/
│   └── theme.ts                  # Color palette & fonts
└── documentation/
    └── tasks.md                  # Assignment specification
```

## Architecture Decisions

### State Management Strategy
- **Zustand** for lightweight, TypeScript-friendly global state
- **Expo SecureStore** for sensitive data (auth tokens) - encrypted at rest
- **AsyncStorage** for non-sensitive persistence (bookmarks, preferences)
- **React Query** for server state with caching, retry, and background refetch

### API Layer
- Centralized Axios client with request/response interceptors
- Automatic auth token injection via request interceptor
- Exponential backoff retry on network/5xx errors (up to 3 retries)
- 15-second timeout with user-friendly error mapping
- Automatic token cleanup on 401 responses

### Navigation Architecture
- File-based routing with Expo Router for type-safe navigation
- Auth-protected tab group with automatic redirect
- Dynamic routes for course details (`/course/[id]`)
- Stack navigation for WebView content

### Performance Optimizations
- `React.memo` on list item components
- `useCallback`/`useMemo` for stable references
- FlatList with `removeClippedSubviews`, windowing, and batch rendering
- Expo Image with caching and transition animations
- React Query stale-time to prevent unnecessary refetches

### Security
- Tokens stored in platform-encrypted SecureStore (not AsyncStorage)
- Auth tokens automatically cleared on 401/logout
- No hardcoded credentials or API keys in source
- Input validation on auth forms

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd LMS

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device/Emulator

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Web (limited features)
npx expo start --web
```

### Building APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build development APK
eas build --platform android --profile development

# Build preview APK
eas build --platform android --profile preview
```

## API

This app uses the [FreeAPI](https://api.freeapi.app/) as its backend:

| Endpoint | Usage |
|---|---|
| `POST /api/v1/users/login` | User authentication |
| `POST /api/v1/users/register` | User registration |
| `GET /api/v1/users/current-user` | Fetch current user profile |
| `POST /api/v1/users/logout` | User logout |
| `GET /api/v1/public/randomproducts` | Course catalog (as courses) |
| `GET /api/v1/public/randomusers` | Instructor list (as instructors) |

## Known Limitations

- Course content is generated HTML (no real LMS backend)
- Profile picture upload requires a development build (not Expo Go)
- Notifications require a physical device (not simulators)
- The FreeAPI uses random products/users which are mapped to courses/instructors

## Screenshots

_Screenshots to be added after build_
