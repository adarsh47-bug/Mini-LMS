# Testing Guide

> **TL;DR**: Run `npm test` for all tests, `npm run test:coverage` for coverage report. Minimum 70% coverage enforced.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
  - [Component Tests](#component-tests)
  - [Store Tests](#store-tests)
  - [Service Tests](#service-tests)
  - [Hook Tests](#hook-tests)
  - [Utility Tests](#utility-tests)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Mocking](#mocking)
- [Debugging](#debugging)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- CourseStore.test
npm test -- ThemedButton
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should login"
```

---

## 📁 Test Structure

```
src/
├── components/__tests__/
│   ├── ThemedButton.test.tsx
│   ├── ThemedInput.test.tsx
│   └── CourseCard.test.tsx
│
├── services/__tests__/
│   ├── api.test.ts
│   └── auth.service.test.ts
│
├── stores/__tests__/
│   ├── bookmarkStore.test.ts
│   ├── courseStore.test.ts
│   └── networkStore.test.ts
│
├── hooks/__tests__/
│   ├── useNetworkMonitor.test.ts
│   └── useStorageState.test.ts
│
└── utils/__tests__/
    ├── security.utils.test.ts
    ├── storage.utils.test.ts
    ├── error.utils.test.ts
    └── date.utils.test.ts
```

---

## 🏃 Running Tests

### Basic Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run in watch mode (auto-rerun on file changes) |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ci` | Run tests in CI mode (no watch, generate coverage) |

### Advanced Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests without cache
npm test -- --no-cache

# Update snapshots
npm test -- -u

# Run only failed tests
npm test -- --onlyFailures

# Run tests in specific folder
npm test -- src/stores

# Run tests with coverage for specific file
npm test -- --coverage --collectCoverageFrom=src/stores/bookmarkStore.ts
```

---

## ✏️ Writing Tests

### Component Tests

Test React Native components using Testing Library.

```tsx
// src/components/__tests__/ThemedButton.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import ThemedButton from '../ThemedButton';

describe('ThemedButton', () => {
  it('should render with title', () => {
    const { getByText } = render(<ThemedButton title="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ThemedButton title="Submit" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Submit'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ThemedButton title="Submit" onPress={mockOnPress} disabled />
    );

    fireEvent.press(getByText('Submit'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    const { getByTestId } = render(
      <ThemedButton title="Submit" loading testID="button" />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
```

### Store Tests

Test Zustand stores with state management logic.

```tsx
// src/stores/__tests__/bookmarkStore.test.ts
import { useBookmarkStore } from '../bookmarkStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('BookmarkStore', () => {
  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset store state
    useBookmarkStore.setState({
      bookmarks: [],
      isInitialized: false,
    });
    
    // Clear AsyncStorage
    await AsyncStorage.clear();
  });

  it('should initialize with empty bookmarks', () => {
    const state = useBookmarkStore.getState();
    expect(state.bookmarks).toEqual([]);
    expect(state.isInitialized).toBe(false);
  });

  it('should toggle bookmark', async () => {
    const { toggleBookmark, isBookmarked } = useBookmarkStore.getState();
    
    // Add bookmark
    await toggleBookmark(1);
    expect(isBookmarked(1)).toBe(true);
    
    // Remove bookmark
    await toggleBookmark(1);
    expect(isBookmarked(1)).toBe(false);
  });

  it('should persist bookmarks to AsyncStorage', async () => {
    const { toggleBookmark } = useBookmarkStore.getState();
    
    await toggleBookmark(1);
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'bookmarks',
      JSON.stringify([1])
    );
  });

  it('should load bookmarks from AsyncStorage', async () => {
    // Mock stored bookmarks
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([1, 2, 3])
    );
    
    const { initializeBookmarks } = useBookmarkStore.getState();
    await initializeBookmarks();
    
    const state = useBookmarkStore.getState();
    expect(state.bookmarks).toEqual([1, 2, 3]);
    expect(state.isInitialized).toBe(true);
  });
});
```

### Service Tests

Test API services with mocked HTTP clients.

```tsx
// src/services/__tests__/auth.service.test.ts
import { apiClient } from '../api';
import { loginUser, registerUser, logoutUser } from '../auth.service';

// Mock API client
jest.mock('../api');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', username: 'john', email: 'john@example.com' },
            accessToken: 'token123',
            refreshToken: 'refresh123',
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await loginUser({
        username: 'john',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user.username).toBe('john');
      expect(apiClient.post).toHaveBeenCalledWith('/users/login', {
        username: 'john',
        password: 'password123',
      });
    });

    it('should handle login error', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Invalid credentials',
          },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await loginUser({
        username: 'john',
        password: 'wrong',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', username: 'john', email: 'john@example.com' },
            accessToken: 'token123',
            refreshToken: 'refresh123',
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await registerUser({
        username: 'john',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe('john@example.com');
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Logged out successfully',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await logoutUser();

      expect(result.success).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/users/logout');
    });
  });
});
```

### Hook Tests

Test custom React hooks.

```tsx
// src/hooks/__tests__/useNetworkMonitor.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useNetworkMonitor } from '../useNetworkMonitor';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo');

describe('useNetworkMonitor', () => {
  it('should call callback when network state changes', () => {
    const mockCallback = jest.fn();
    
    renderHook(() => useNetworkMonitor(mockCallback));
    
    // Simulate network change
    act(() => {
      const listener = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      listener({ isConnected: false });
    });
    
    expect(mockCallback).toHaveBeenCalledWith(false);
  });
});
```

### Utility Tests

Test utility functions.

```tsx
// src/utils/__tests__/security.utils.test.ts
import {
  sanitizeInput,
  isValidEmail,
  checkPasswordStrength,
} from '../security.utils';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should rate strong password', () => {
      const result = checkPasswordStrength('MyP@ssw0rd!2024');
      expect(result.score).toBeGreaterThan(3);
    });

    it('should rate weak password', () => {
      const result = checkPasswordStrength('123456');
      expect(result.score).toBeLessThan(2);
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });
});
```

---

## ✅ Best Practices

### 1. Test Isolation

Always reset state between tests to prevent side effects.

```tsx
beforeEach(() => {
  // Reset store state
  useBookmarkStore.setState({ bookmarks: [] });
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear AsyncStorage
  AsyncStorage.clear();
});
```

### 2. Descriptive Test Names

Use clear, descriptive test names that explain what is being tested.

```tsx
// ❌ Bad
it('works', () => {});
it('test login', () => {});

// ✅ Good
it('should display error message when login fails', () => {});
it('should call onPress callback when button is pressed', () => {});
it('should disable button when loading prop is true', () => {});
```

### 3. Arrange-Act-Assert Pattern

Structure tests consistently with AAA pattern.

```tsx
it('should update username', () => {
  // Arrange - Set up test data and mocks
  const mockOnChange = jest.fn();
  const { getByPlaceholderText } = render(
    <ThemedInput placeholder="Username" onChangeText={mockOnChange} />
  );
  
  // Act - Perform the action
  fireEvent.changeText(getByPlaceholderText('Username'), 'john');
  
  // Assert - Verify the outcome
  expect(mockOnChange).toHaveBeenCalledWith('john');
});
```

### 4. Test Behavior, Not Implementation

Focus on what the component does, not how it does it.

```tsx
// ❌ Bad - tests implementation details
expect(component.state.isLoading).toBe(false);
expect(component.instance().handleClick).toBeDefined();

// ✅ Good - tests user-facing behavior
expect(getByText('Data loaded')).toBeTruthy();
expect(getByRole('button')).not.toBeDisabled();
```

### 5. Mock External Dependencies

Mock APIs, storage, and other external dependencies.

```tsx
// Mock modules
jest.mock('expo-router');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../api');

// Mock specific functions
const mockPush = jest.fn();
jest.spyOn(router, 'push').mockImplementation(mockPush);
```

---

## 🔄 Common Patterns

### Testing Async Operations

```tsx
it('should handle async fetch', async () => {
  const { fetchCourses } = useCourseStore.getState();
  
  await act(async () => {
    await fetchCourses();
  });
  
  const state = useCourseStore.getState();
  expect(state.courses.length).toBeGreaterThan(0);
});
```

### Testing Error Handling

```tsx
it('should handle network errors', async () => {
  (apiClient.get as jest.Mock).mockRejectedValueOnce(
    new Error('Network error')
  );
  
  await expect(fetchCourses()).rejects.toThrow('Network error');
});
```

### Testing Loading States

```tsx
it('should show loading indicator while fetching', () => {
  const { getByTestId } = render(<CourseList />);
  
  expect(getByTestId('loading-indicator')).toBeTruthy();
});
```

### Testing Navigation

```tsx
import { router } from 'expo-router';

it('should navigate to detail screen when card is pressed', () => {
  const { getByText } = render(<CourseCard course={mockCourse} />);
  
  fireEvent.press(getByText('View Details'));
  
  expect(router.push).toHaveBeenCalledWith('/course/1');
});
```

### Testing Forms

```tsx
it('should validate form input', async () => {
  const { getByPlaceholderText, getByText } = render(<LoginForm />);
  
  // Enter invalid data
  fireEvent.changeText(getByPlaceholderText('Email'), 'invalid');
  fireEvent.press(getByText('Submit'));
  
  // Check for error message
  await waitFor(() => {
    expect(getByText('Invalid email format')).toBeTruthy();
  });
});
```

### Testing with `waitFor`

```tsx
import { waitFor } from '@testing-library/react-native';

it('should display data after loading', async () => {
  const { getByText } = render(<DataComponent />);
  
  await waitFor(() => {
    expect(getByText('Data loaded')).toBeTruthy();
  }, { timeout: 3000 });
});
```

---

## 🎭 Mocking

### Mock Expo Modules

```tsx
// jest.setup.js
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));
```

### Mock Navigation

```tsx
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));
```

### Mock API Calls

```tsx
import { apiClient } from '../api';

jest.mock('../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// In test
(apiClient.get as jest.Mock).mockResolvedValueOnce({
  data: { success: true, data: [] },
});
```

---

## 🐛 Debugging

### Run Single Test

```bash
npm test -- --testNamePattern="should login user"
npm test -- --testPathPattern="CourseStore"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-cache",
        "--watchAll=false"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Verbose Output

```bash
npm test -- --verbose
npm test -- --detectOpenHandles  # Find async operations that didn't complete
```

### Clear Cache

```bash
npm test -- --clearCache
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 🎯 Coverage Requirements

The project enforces minimum coverage thresholds:

```javascript
// jest.config.js
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### View Coverage Report

```bash
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Sample Coverage Output

```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
All files              |   85.2  |   78.4   |   82.1  |   86.3  |
 stores/               |   92.1  |   87.3   |   90.0  |   93.0  |
 services/             |   88.5  |   82.1   |   85.2  |   89.1  |
 utils/                |   90.3  |   85.7   |   88.9  |   91.0  |
 components/           |   78.4  |   70.2   |   75.0  |   79.1  |
```

---

## 🔧 Troubleshooting

### Tests Timeout

```tsx
// Increase timeout for slow tests
jest.setTimeout(10000);

// Or per test
it('should handle slow operation', async () => {
  // ...
}, 10000);
```

### Mock Not Working

```tsx
beforeEach(() => {
  // Clear mocks between tests
  jest.clearAllMocks();
  
  // Reset mock implementation
  (apiClient.get as jest.Mock).mockReset();
});
```

### Async State Updates

```tsx
import { waitFor } from '@testing-library/react-native';

// Wait for async state updates
await waitFor(() => {
  expect(getByText('Loaded')).toBeTruthy();
});
```

### Memory Leaks

```tsx
// Clean up after tests
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

---

**Last Updated**: February 2026  
**Maintainer**: MLMS Development Team
