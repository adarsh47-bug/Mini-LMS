/**
 * UI Component Types
 *
 * Shared types for UI components
 */
import { Ionicons } from '@expo/vector-icons';
import { TextStyle, ViewStyle } from 'react-native';

// ============================================================================
// BUTTON TYPES
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface InputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

// ============================================================================
// MODAL TYPES
// ============================================================================

export type ModalVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: ModalVariant;
  loading?: boolean;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;

  background: string;
  surface: string;
  surfaceSecondary: string;

  text: string;
  textSecondary: string;
  textInverse: string;

  border: string;
  borderFocus: string;

  success: string;
  error: string;
  warning: string;
  info: string;

  white: string;
  black: string;
}

export interface ThemeColors extends ColorPalette { }
