/**
 * Auth Context
 *
 * Session provider following Expo Router's authentication pattern.
 * Uses SecureStore for token persistence and provides auth state
 * to the entire app via context.
 */

import { STORAGE_KEYS } from '@/src/constants';
import { setStorageItemAsync, useStorageState } from '@/src/hooks';
import {
  clearTokens,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  setAccessToken, setRefreshToken,
  type LoginPayload,
  type RegisterPayload,
  type User,
} from '@/src/services';
import { useBookmarkStore, useCourseStore } from '@/src/stores';
import React, { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useNotification } from './notification-context';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  /** Sign in with username + password */
  signIn: (payload: LoginPayload) => Promise<void>;
  /** Register a new account */
  signUp: (payload: RegisterPayload) => Promise<void>;
  /** Sign out and clear tokens */
  signOut: () => Promise<void>;
  /** Refresh the current user profile from the server */
  refreshUser: () => Promise<void>;
  /** The current session token (null when logged out) */
  session: string | null;
  /** True while loading session from storage */
  isLoading: boolean;
  /** The authenticated user profile */
  user: User | null;
  /** Error message from last auth operation */
  error: string | null;
  /** Clear error state */
  clearError: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// HOOK
// ============================================================================

/**
 * Access auth session anywhere in the app.
 * Must be used within SessionProvider.
 */
export function useSession(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState(STORAGE_KEYS.session);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  // Get store reset methods
  const resetBookmarkStore = useBookmarkStore((s) => s.reset);
  const resetCourseStore = useCourseStore((s) => s.reset);

  // Load user profile when session exists
  useEffect(() => {
    if (session && !user) {
      loadUser();
    }
  }, [session]);

  const loadUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch {
      console.warn('Failed to load user profile');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch {
      console.warn('Failed to refresh user profile');
    }
  }, []);

  const signIn = useCallback(async (payload: LoginPayload) => {
    try {
      setError(null);
      const response = await loginUser(payload);

      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data;

        await setAccessToken(accessToken);
        await setRefreshToken(refreshToken);
        await setStorageItemAsync(STORAGE_KEYS.user, JSON.stringify(userData));

        setUser(userData);
        setSession(accessToken);

        notification.success(`Welcome back, ${userData.username}!`);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Login failed. Please check your credentials.');
      setError(message);
      throw new Error(message);
    }
  }, [setSession, notification]);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    try {
      setError(null);
      const response = await registerUser(payload);

      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }

      notification.success('Account created successfully!');
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Registration failed. Please try again.');
      setError(message);
      throw new Error(message);
    }
  }, [notification]);

  const signOut = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      console.warn('Logout API call failed, clearing local session');
    } finally {
      // Clear all tokens and auth data
      await clearTokens();

      // Reset user-specific stores
      resetBookmarkStore();
      resetCourseStore();

      // Clear auth state
      setUser(null);
      setSession(null);

      notification.info('You have been signed out.');
    }
  }, [setSession, notification, resetBookmarkStore, resetCourseStore]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        refreshUser,
        session,
        isLoading,
        user,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}
