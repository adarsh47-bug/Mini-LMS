/**
 * This file serves as a central export point for all constants used throughout the application.
 * It re-exports constants from various modules, allowing for cleaner and more organized imports in other parts of the app.
 * By consolidating exports here, we can easily manage and maintain our constants in one place, improving code readability and maintainability.
 *
 * The constants include:
 * - Color themes and palettes
 * - Font styles and sizes
 * - Any other static values that are used across multiple components or screens
 * This approach promotes a modular structure and helps prevent circular dependencies by centralizing the exports.
 */

export * from './app.constants';
export * from './colors.constants';
export * from './fonts.constants';
export * from './tabs.constants';

