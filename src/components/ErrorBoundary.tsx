/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 * Industry standard error handling for production React Native apps.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to render when an error occurs */
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, integrate with error reporting service (e.g., Sentry, LogRocket)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
          >
            {/* Error Icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#1E293B',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Ionicons name="warning-outline" size={40} color="#EF4444" />
            </View>

            {/* Error Title */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#F8FAFC',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Oops! Something went wrong
            </Text>

            {/* Error Description */}
            <Text
              style={{
                fontSize: 14,
                color: '#94A3B8',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {/* Error Details (only in dev mode) */}
            {__DEV__ && this.state.error && (
              <View
                style={{
                  width: '100%',
                  backgroundColor: '#1E293B',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#EF4444',
                    marginBottom: 8,
                  }}
                >
                  Error Details (Dev Mode):
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#CBD5E1',
                    fontFamily: 'monospace',
                  }}
                  numberOfLines={10}
                >
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ width: '100%', gap: 12 }}>
              <Pressable
                onPress={this.resetError}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#FFFFFF',
                  }}
                >
                  Try Again
                </Text>
              </Pressable>

              {__DEV__ && (
                <Pressable
                  onPress={() => console.log('Full Error:', this.state)}
                  style={{
                    backgroundColor: '#1E293B',
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#334155',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#94A3B8',
                    }}
                  >
                    Log Full Error (Console)
                  </Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
