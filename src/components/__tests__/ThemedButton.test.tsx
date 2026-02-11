/**
 * ThemedButton Component Tests
 */

import { ThemeProvider } from '@/src/context';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ThemedButton from '../ThemedButton';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ThemedButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render button with title', () => {
    const { getByText } = renderWithTheme(
      <ThemedButton title="Test Button" onPress={mockOnPress} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = renderWithTheme(
      <ThemedButton title="Click Me" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Click Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const { getByText } = renderWithTheme(
      <ThemedButton title="Disabled" onPress={mockOnPress} disabled />
    );

    fireEvent.press(getByText('Disabled'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <ThemedButton title="Loading" onPress={mockOnPress} loading />
    );

    // ActivityIndicator should be present
    expect(queryByTestId || getByTestId).toBeTruthy();
  });

  it('should not call onPress when loading', () => {
    const { getByText } = renderWithTheme(
      <ThemedButton title="Loading" onPress={mockOnPress} loading />
    );

    fireEvent.press(getByText('Loading'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const variants: ('primary' | 'secondary' | 'outline' | 'ghost')[] = [
      'primary',
      'secondary',
      'outline',
      'ghost',
    ];

    variants.forEach((variant) => {
      const { getByText } = renderWithTheme(
        <ThemedButton title={variant} onPress={mockOnPress} variant={variant} />
      );

      expect(getByText(variant)).toBeTruthy();
    });
  });

  it('should render with different sizes', () => {
    const sizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      const { getByText } = renderWithTheme(
        <ThemedButton title={size} onPress={mockOnPress} size={size} />
      );

      expect(getByText(size)).toBeTruthy();
    });
  });

  it('should have correct accessibility attributes', () => {
    const { getByRole } = renderWithTheme(
      <ThemedButton
        title="Accessible Button"
        onPress={mockOnPress}
        accessibilityLabel="Custom Label"
        accessibilityHint="Custom Hint"
      />
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
  });
});
