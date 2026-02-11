# Quick Reference Guide

> **TL;DR**: Fast lookup for common tasks, patterns, and commands in the MLMS project.

---

## 📋 Table of Contents

- [Common Commands](#common-commands)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Notifications](#notifications)
- [Forms & Validation](#forms--validation)
- [Network Monitoring](#network-monitoring)
- [State Management](#state-management)
- [Theming](#theming)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Common Commands

### Development
```bash
# Start development server
npm start

# Run on specific platform
npm run ios                    # iOS simulator (macOS only)
npm run android                # Android emulator
npm run web                    # Web browser

# Clear cache and restart
npm start -- --reset-cache
```

### Testing
```bash
npm test                       # Run all tests
npm run test:watch            # Watch mode (auto-rerun)
npm run test:coverage         # Generate coverage report
npm test -- CourseStore       # Run specific test
```

### Code Quality
```bash
npm run typecheck             # TypeScript type checking
npm run lint                  # ESLint code linting
npm run lint:fix              # Auto-fix linting issues
```

### Build
```bash
npm run build                 # Production build
eas build --platform android  # Build Android APK
eas build --platform ios      # Build iOS IPA
```

---

## 📁 Project Structure

```
mlms/
├── app/                      # Expo Router (file-based routing)
│   ├── (auth)/              # Public routes: login, register
│   └── (app)/               # Protected routes: tabs, profile
│       └── (tabs)/          # Bottom tab navigation
│
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AppNotify/       # Notification banner system
│   │   ├── NetworkStatus/   # Offline/online indicators
│   │   └── *.tsx            # Themed buttons, inputs, modals
│   │
│   ├── screens/             # Screen components (used in app/)
│   ├── services/            # API client & business logic
│   ├── stores/              # Zustand state management
│   ├── context/             # React Context (auth, theme, notifications)
│   ├── hooks/               # Custom hooks (network, storage)
│   ├── types/               # TypeScript types & Zod schemas
│   ├── utils/               # Helper functions
│   └── constants/           # App config, colors, fonts
│
├── assets/                  # Images, fonts, static files
└── documentation/           # Project documentation
```

### Key Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout with providers |
| `src/services/api.ts` | Axios client with interceptors |
| `src/context/auth-context.tsx` | Authentication state |
| `src/stores/bookmarkStore.ts` | Bookmark management |
| `.env` | Environment variables |
| `app.config.js` | Expo configuration |

---

## 🔐 Authentication

### Using Auth Context

```tsx
import { useSession } from '@/src/context';

function MyComponent() {
  const { user, session, signIn, signOut, isLoading, refreshUser } = useSession();

  // Sign in
  const handleLogin = async () => {
    const result = await signIn({ username: 'john', password: 'pass123' });
    if (!result.success) {
      console.error(result.error);
    }
  };

  // Sign out
  const handleLogout = () => signOut();

  // Refresh user data (pull-to-refresh)
  const handleRefresh = () => refreshUser();

  return (
    <View>
      {user ? <Text>Hello, {user.username}</Text> : <Text>Not logged in</Text>}
      {isLoading && <ActivityIndicator />}
    </View>
  );
}
```

### Auth State

```tsx
// Check if user is authenticated
const isAuthenticated = !!session;

// Access user data
console.log(user?.email, user?.role);

// Access token (usually automatic via interceptor)
console.log(session); // accessToken + refreshToken
```

---

## 🔔 Notifications

### Show Notifications

```tsx
import { useNotification } from '@/src/context';

function MyComponent() {
  const notification = useNotification();

  // Quick helpers
  notification.success('Profile updated!');
  notification.error('Failed to save changes');
  notification.warning('Check your internet connection');
  notification.info('New course available');

  // Custom notification
  notification.showNotification({
    title: 'Course deleted',
    message: 'The course has been removed',
    variant: 'delete',
    position: 'top',
    duration: 5000,
    actions: [
      { label: 'Undo', onPress: () => handleUndo() }
    ],
  });
}
```

### Notification Variants

| Variant | Use Case | Color |
|---------|----------|-------|
| `success` | Successful operations | Green |
| `error` | Errors and failures | Red |
| `warning` | Warnings and cautions | Yellow |
| `info` | Informational messages | Blue |
| `delete` | Deletion confirmations | Red |

---

## 📝 Forms & Validation

### Using React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/src/types';

function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data) => {
    // Data is validated and typed
    await signIn(data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <ThemedInput
            placeholder="Username"
            value={value}
            onChangeText={onChange}
            error={errors.username?.message}
          />
        )}
      />
      
      <ThemedButton title="Login" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
```

### Validation Schemas

```tsx
import { z } from 'zod';

// Available schemas in src/types/auth.types.ts
loginSchema          // username + password
registerSchema       // username + email + password
changePasswordSchema // current + new + confirm
forgotPasswordSchema // email only
```

### Manual Validation

```tsx
import { validate } from '@/src/utils';
import { loginSchema } from '@/src/types';

const result = validate(loginSchema, { username, password });

if (!result.success) {
  console.error(result.errors); // { username?: string, password?: string }
} else {
  console.log(result.data); // Validated data
}
```

---

## 🌐 Network Monitoring

### Using Network Store

```tsx
import { useNetworkStore } from '@/src/stores';

function MyComponent() {
  const isConnected = useNetworkStore(state => state.isConnected);
  const isInternetReachable = useNetworkStore(state => state.isInternetReachable);

  return (
    <View>
      {!isConnected && (
        <Text>⚠️ You are offline</Text>
      )}
    </View>
  );
}
```

### Using Network Hook

```tsx
import { useNetworkMonitor } from '@/src/hooks';

function MyComponent() {
  useNetworkMonitor((isConnected) => {
    if (!isConnected) {
      console.log('Lost connection');
    } else {
      console.log('Connection restored');
    }
  });
}
```

---

## 🗄️ State Management

### Zustand Stores

```tsx
// Bookmark Store
import { useBookmarkStore } from '@/src/stores';

const bookmarks = useBookmarkStore(state => state.bookmarks);
const toggleBookmark = useBookmarkStore(state => state.toggleBookmark);
const isBookmarked = useBookmarkStore(state => state.isBookmarked);

// Usage
toggleBookmark(courseId);
const bookmarked = isBookmarked(courseId);
```

```tsx
// Course Store
import { useCourseStore } from '@/src/stores';

const courses = useCourseStore(state => state.courses);
const fetchCourses = useCourseStore(state => state.fetchInitialCourses);
const searchCourses = useCourseStore(state => state.searchCourses);

// Usage
await fetchCourses();
searchCourses('react native');
```

### Persistent Storage

```tsx
import { setStorageItemAsync, getStorageItemAsync } from '@/src/utils';

// Save data (uses SecureStore on native, localStorage on web)
await setStorageItemAsync('key', 'value');

// Retrieve data
const value = await getStorageItemAsync('key');
```

---

## 🎨 Theming

### Using Theme Context

```tsx
import { useTheme } from '@/src/context';

function MyComponent() {
  const { theme, toggleTheme, colorScheme } = useTheme();

  // Access theme colors
  const textColor = theme.text;
  const bgColor = theme.background;

  // Toggle theme
  const handleToggle = () => toggleTheme();

  // Current theme: 'light' | 'dark' | 'system'
  console.log(colorScheme);
}
```

### Theme Colors

```tsx
// Available in theme object
theme.primary         // Primary brand color
theme.secondary       // Secondary brand color
theme.background      // Background color
theme.surface         // Card/surface color
theme.text            // Primary text color
theme.textSecondary   // Secondary text color
theme.border          // Border color
theme.success         // Success state color
theme.error           // Error state color
theme.warning         // Warning state color
```

---

## 🐛 Troubleshooting

### Common Issues

#### Metro bundler cache issues
```bash
npm start -- --reset-cache
# or
npx expo start -c
```

#### TypeScript errors
```bash
npm run typecheck
# Check tsconfig.json and ensure all imports are correct
```

#### Test failures
```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose
```

#### Build errors
```bash
# Clean build
rm -rf node_modules
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

#### Environment variables not loading
```bash
# Ensure .env file exists
cp .env.example .env

# Restart Expo server
npm start -- --reset-cache
```

### Getting Help

1. **Check logs**: `npx expo start` shows detailed error messages
2. **TypeScript errors**: Run `npm run typecheck` for full error list
3. **Test errors**: Run `npm test -- --verbose` for detailed output
4. **Documentation**: See [README.md](../README.md) for setup instructions

---

## 📚 Related Documentation

- [README.md](../README.md) - Complete project overview and setup
- [TESTING.md](./TESTING.md) - Testing guide and best practices
- [SECURITY.md](./SECURITY.md) - Security implementation details
- [FreeAPI_Authentication.md](./FreeAPI_Authentication.md) - Auth API reference
- [tasks.md](./tasks.md) - Original assignment requirements

---

## 💡 Pro Tips

### Performance
- Use `React.memo` for list items to prevent re-renders
- Implement `useCallback` and `useMemo` for stable references
- Enable `removeClippedSubviews` on FlatList for better performance

### Development
- Use breakpoints in VS Code for debugging
- Install React DevTools for component inspection
- Use `__DEV__` constant for development-only code

### Code Quality
- Run `npm run typecheck` before committing- Enable ESLint in your editor for real-time feedback
- Write tests for new features (aim for >70% coverage)

---

**Last Updated**: February 2026  
**Maintainer**: MLMS Development Team
