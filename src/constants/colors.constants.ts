/**
 * Color Constants
 * 
 * Centralized color configuration for the entire application.
 * Single source of truth for all colors - change here to update everywhere.
 * Supports both light and dark themes.
 */

// ============================================================================
// BASE PALETTE
// ============================================================================

/**
 * Brand Colors - Core identity colors
 */
const BrandColors = {
  primary: '#0A66C2',        //  Blue - Main brand color
  primaryLight: '#3B82F6',   // Bright Blue - Lighter variant
  primaryDark: '#004182',    // Dark Blue - Darker variant

  secondary: '#10B981',      // Emerald Green - Secondary actions
  accent: '#8B5CF6',         // Violet - Accent highlights
} as const;

/**
 * Semantic Colors - Contextual colors for different states
 */
const SemanticColors = {
  success: '#10B981',        // Emerald-500 - Success states
  warning: '#F59E0B',        // Amber-500 - Warning states
  error: '#EF4444',          // Red-500 - Error states
  info: '#3B82F6',           // Blue-500 - Informational states
} as const;

/**
 * Functional Colors - Special purpose colors
 */
const FunctionalColors = {
  purple: '#8B5CF6',         // Violet-500 - Feature highlights
  pink: '#EC4899',           // Pink-500 - Creative elements
  orange: '#F97316',         // Orange-500 - Energy/urgency
  teal: '#14B8A6',           // Teal-500 - Alternative actions
  indigo: '#6366F1',         // Indigo-500 - Deep accents
  cyan: '#06B6D4',           // Cyan-500 - Cool highlights
} as const;

// ============================================================================
// LIGHT THEME
// ============================================================================

/**
 * Light Theme Colors
 */
export const LightTheme = {
  // Brand colors
  primary: BrandColors.primary,
  primaryLight: BrandColors.primaryLight,
  primaryDark: BrandColors.primaryDark,
  secondary: BrandColors.secondary,
  accent: BrandColors.accent,

  // Backgrounds
  background: '#FFFFFF',      // White - Main background
  backgroundSecondary: '#F9FAFB', // Gray-50 - Secondary background
  surface: '#FFFFFF',         // White - Card/surface background
  surfaceSecondary: '#F3F4F6', // Gray-100 - Alternative surface
  tabBar: '#3B82F6',          // Blue-500 - Tab Bar background

  // Text colors
  text: '#111827',           // Gray-900 - Primary text
  textSecondary: '#6B7280',  // Gray-500 - Secondary text
  textTertiary: '#9CA3AF',   // Gray-400 - Tertiary/disabled text
  textInverse: '#FFFFFF',    // White - Text on dark backgrounds

  // Border colors
  border: '#E5E7EB',         // Gray-200 - Default borders
  borderLight: '#F3F4F6',    // Gray-100 - Light borders
  borderDark: '#D1D5DB',     // Gray-300 - Darker borders
  borderFocus: BrandColors.primary, // Primary - Focused borders

  // Semantic colors
  success: SemanticColors.success,
  successLight: '#D1FAE5',   // Green-100
  successDark: '#059669',    // Green-600

  warning: SemanticColors.warning,
  warningLight: '#FEF3C7',   // Amber-100
  warningDark: '#D97706',    // Amber-600

  error: SemanticColors.error,
  errorLight: '#FEE2E2',     // Red-100
  errorDark: '#DC2626',      // Red-600

  info: SemanticColors.info,
  infoLight: '#DBEAFE',      // Blue-100
  infoDark: '#2563EB',       // Blue-600

  // Functional colors
  purple: FunctionalColors.purple,
  purpleLight: '#EDE9FE',    // Violet-100

  pink: FunctionalColors.pink,
  pinkLight: '#FCE7F3',      // Pink-100

  orange: FunctionalColors.orange,
  orangeLight: '#FFEDD5',    // Orange-100

  teal: FunctionalColors.teal,
  tealLight: '#CCFBF1',      // Teal-100

  indigo: FunctionalColors.indigo,
  indigoLight: '#E0E7FF',    // Indigo-100

  cyan: FunctionalColors.cyan,
  cyanLight: '#CFFAFE',      // Cyan-100

  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Overlay colors (with opacity)
  overlay: 'rgba(0, 0, 0, 0.5)',      // Semi-transparent black
  overlayLight: 'rgba(0, 0, 0, 0.3)',  // Light overlay
  overlayDark: 'rgba(0, 0, 0, 0.7)',   // Dark overlay

  // Shadow color
  shadow: '#000000',
} as const;

// ============================================================================
// DARK THEME
// ============================================================================

/**
 * Dark Theme Colors
 */
export const DarkTheme = {
  // Brand colors (slightly adjusted for dark mode)
  primary: '#3B82F6',        // Brighter blue for dark background
  primaryLight: '#60A5FA',   // Blue-400
  primaryDark: '#2563EB',    // Blue-600
  secondary: '#34D399',      // Emerald-400 - Brighter for visibility
  accent: '#A78BFA',         // Violet-400

  // Backgrounds
  background: '#0F172A',     // Slate-900 - Main background
  backgroundSecondary: '#1E293B', // Slate-800 - Secondary background
  surface: '#1E293B',        // Slate-800 - Card/surface background
  surfaceSecondary: '#334155', // Slate-700 - Alternative surface
  tabBar: '#F1F5F9',          // Slate-100 - Tab Bar background

  // Text colors
  text: '#F1F5F9',           // Slate-100 - Primary text
  textSecondary: '#94A3B8',  // Slate-400 - Secondary text
  textTertiary: '#64748B',   // Slate-500 - Tertiary/disabled text
  textInverse: '#0F172A',    // Slate-900 - Text on light backgrounds

  // Border colors
  border: '#334155',         // Slate-700 - Default borders
  borderLight: '#475569',    // Slate-600 - Light borders
  borderDark: '#1E293B',     // Slate-800 - Darker borders
  borderFocus: '#3B82F6',    // Primary - Focused borders

  // Semantic colors (adjusted for dark mode)
  success: '#34D399',        // Emerald-400
  successLight: '#064E3B',   // Emerald-900 - Dark background
  successDark: '#10B981',    // Emerald-500

  warning: '#FBBF24',        // Amber-400
  warningLight: '#78350F',   // Amber-900 - Dark background
  warningDark: '#F59E0B',    // Amber-500

  error: '#F87171',          // Red-400
  errorLight: '#7F1D1D',     // Red-900 - Dark background
  errorDark: '#EF4444',      // Red-500

  info: '#60A5FA',           // Blue-400
  infoLight: '#1E3A8A',      // Blue-900 - Dark background
  infoDark: '#3B82F6',       // Blue-500

  // Functional colors (adjusted for dark mode)
  purple: '#A78BFA',         // Violet-400
  purpleLight: '#4C1D95',    // Violet-900 - Dark background

  pink: '#F472B6',           // Pink-400
  pinkLight: '#831843',      // Pink-900 - Dark background

  orange: '#FB923C',         // Orange-400
  orangeLight: '#7C2D12',    // Orange-900 - Dark background

  teal: '#2DD4BF',           // Teal-400
  tealLight: '#134E4A',      // Teal-900 - Dark background

  indigo: '#818CF8',         // Indigo-400
  indigoLight: '#312E81',    // Indigo-900 - Dark background

  cyan: '#22D3EE',           // Cyan-400
  cyanLight: '#164E63',      // Cyan-900 - Dark background

  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Overlay colors (with opacity)
  overlay: 'rgba(0, 0, 0, 0.7)',      // Darker overlay for dark mode
  overlayLight: 'rgba(0, 0, 0, 0.5)',  // Light overlay
  overlayDark: 'rgba(0, 0, 0, 0.9)',   // Very dark overlay

  // Shadow color
  shadow: '#000000',
} as const;

// ============================================================================
// THEME TYPE DEFINITIONS
// ============================================================================

/**
 * Common color theme structure with full color value documentation
 * Hover over any color property to see the actual hex value and color name
 */
export interface ColorTheme {
  // Brand colors
  /** Light: #0A66C2 (Blue) | Dark: #3B82F6 (Blue-500) */
  primary: string;
  /** Light: #3B82F6 (Blue-500) | Dark: #60A5FA (Blue-400) */
  primaryLight: string;
  /** Light: #004182 (Dark Blue) | Dark: #2563EB (Blue-600) */
  primaryDark: string;
  /** Light: #10B981 (Emerald-500) | Dark: #34D399 (Emerald-400) */
  secondary: string;
  /** Light: #8B5CF6 (Violet-500) | Dark: #A78BFA (Violet-400) */
  accent: string;

  // Backgrounds
  /** Light: #FFFFFF (White) | Dark: #0F172A (Slate-900) */
  background: string;
  /** Light: #F9FAFB (Gray-50) | Dark: #1E293B (Slate-800) */
  backgroundSecondary: string;
  /** Light: #FFFFFF (White) | Dark: #1E293B (Slate-800) */
  surface: string;
  /** Light: #F3F4F6 (Gray-100) | Dark: #334155 (Slate-700) */
  surfaceSecondary: string;
  /** Tab Bar, Light: #3B82F6 (Blue-500) | Dark: #F1F5F9 (Slate-100) */
  tabBar: string;

  // Text colors
  /** Light: #111827 (Gray-900) | Dark: #F1F5F9 (Slate-100) */
  text: string;
  /** Light: #6B7280 (Gray-500) | Dark: #94A3B8 (Slate-400) */
  textSecondary: string;
  /** Light: #9CA3AF (Gray-400) | Dark: #64748B (Slate-500) */
  textTertiary: string;
  /** Light: #FFFFFF (White) | Dark: #0F172A (Slate-900) */
  textInverse: string;

  // Border colors
  /** Light: #E5E7EB (Gray-200) | Dark: #334155 (Slate-700) */
  border: string;
  /** Light: #F3F4F6 (Gray-100) | Dark: #475569 (Slate-600) */
  borderLight: string;
  /** Light: #D1D5DB (Gray-300) | Dark: #1E293B (Slate-800) */
  borderDark: string;
  /** Light: #0A66C2 (Primary) | Dark: #3B82F6 (Primary) */
  borderFocus: string;

  // Semantic colors
  /** Light: #10B981 (Emerald-500) | Dark: #34D399 (Emerald-400) */
  success: string;
  /** Light: #D1FAE5 (Green-100) | Dark: #064E3B (Emerald-900) */
  successLight: string;
  /** Light: #059669 (Green-600) | Dark: #10B981 (Emerald-500) */
  successDark: string;
  /** Light: #F59E0B (Amber-500) | Dark: #FBBF24 (Amber-400) */
  warning: string;
  /** Light: #FEF3C7 (Amber-100) | Dark: #78350F (Amber-900) */
  warningLight: string;
  /** Light: #D97706 (Amber-600) | Dark: #F59E0B (Amber-500) */
  warningDark: string;
  /** Light: #EF4444 (Red-500) | Dark: #F87171 (Red-400) */
  error: string;
  /** Light: #FEE2E2 (Red-100) | Dark: #7F1D1D (Red-900) */
  errorLight: string;
  /** Light: #DC2626 (Red-600) | Dark: #EF4444 (Red-500) */
  errorDark: string;
  /** Light: #3B82F6 (Blue-500) | Dark: #60A5FA (Blue-400) */
  info: string;
  /** Light: #DBEAFE (Blue-100) | Dark: #1E3A8A (Blue-900) */
  infoLight: string;
  /** Light: #2563EB (Blue-600) | Dark: #3B82F6 (Blue-500) */
  infoDark: string;

  // Functional colors
  /** Light: #8B5CF6 (Violet-500) | Dark: #A78BFA (Violet-400) */
  purple: string;
  /** Light: #EDE9FE (Violet-100) | Dark: #4C1D95 (Violet-900) */
  purpleLight: string;
  /** Light: #EC4899 (Pink-500) | Dark: #F472B6 (Pink-400) */
  pink: string;
  /** Light: #FCE7F3 (Pink-100) | Dark: #831843 (Pink-900) */
  pinkLight: string;
  /** Light: #F97316 (Orange-500) | Dark: #FB923C (Orange-400) */
  orange: string;
  /** Light: #FFEDD5 (Orange-100) | Dark: #7C2D12 (Orange-900) */
  orangeLight: string;
  /** Light: #14B8A6 (Teal-500) | Dark: #2DD4BF (Teal-400) */
  teal: string;
  /** Light: #CCFBF1 (Teal-100) | Dark: #134E4A (Teal-900) */
  tealLight: string;
  /** Light: #6366F1 (Indigo-500) | Dark: #818CF8 (Indigo-400) */
  indigo: string;
  /** Light: #E0E7FF (Indigo-100) | Dark: #312E81 (Indigo-900) */
  indigoLight: string;
  /** Light: #06B6D4 (Cyan-500) | Dark: #22D3EE (Cyan-400) */
  cyan: string;
  /** Light: #CFFAFE (Cyan-100) | Dark: #164E63 (Cyan-900) */
  cyanLight: string;

  // Special colors
  /** #FFFFFF - Pure White */
  white: string;
  /** #000000 - Pure Black */
  black: string;
  /** transparent - Fully Transparent */
  transparent: string;

  // Overlay colors
  /** Light: rgba(0,0,0,0.5) | Dark: rgba(0,0,0,0.7) */
  overlay: string;
  /** Light: rgba(0,0,0,0.3) | Dark: rgba(0,0,0,0.5) */
  overlayLight: string;
  /** Light: rgba(0,0,0,0.7) | Dark: rgba(0,0,0,0.9) */
  overlayDark: string;

  // Shadow
  /** #000000 - Black shadow */
  shadow: string;
}

export type ThemeMode = 'light' | 'dark';

/**
 * Get theme colors based on theme mode
 */
export function getThemeColors(mode: ThemeMode): ColorTheme {
  return mode === 'light' ? LightTheme : DarkTheme;
}

