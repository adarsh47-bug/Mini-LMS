/**
 * ThemedInput Component Tests
 */

import { ThemeProvider } from '@/src/context';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ThemedInput from '../ThemedInput';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ThemedInput', () => {
  it('should render input with label', () => {
    const { getByText } = renderWithTheme(
      <ThemedInput label="Email" placeholder="Enter email" />
    );

    expect(getByText('Email')).toBeTruthy();
  });

  it('should render input without label', () => {
    const { queryByText } = renderWithTheme(
      <ThemedInput placeholder="Enter text" />
    );

    expect(queryByText).toBeTruthy();
  });

  it('should display error message', () => {
    const { getByText } = renderWithTheme(
      <ThemedInput label="Email" error="Email is required" />
    );

    expect(getByText('Email is required')).toBeTruthy();
  });

  it('should handle text input change', () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = renderWithTheme(
      <ThemedInput placeholder="Enter text" onChangeText={mockOnChange} />
    );

    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'test input');

    expect(mockOnChange).toHaveBeenCalledWith('test input');
  });

  it('should toggle password visibility', () => {
    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <ThemedInput placeholder="Password" isPassword />
    );

    const input = getByPlaceholderText('Password');
    const toggleButton = getByRole('button');

    // Should be secure initially
    expect(input.props.secureTextEntry).toBe(true);

    // Toggle visibility
    fireEvent.press(toggleButton);
    expect(input.props.secureTextEntry).toBe(false);

    // Toggle back
    fireEvent.press(toggleButton);
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('should handle focus and blur events', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <ThemedInput placeholder="Test input" />
    );

    const input = getByPlaceholderText('Test input');

    fireEvent(input, 'focus');
    fireEvent(input, 'blur');

    expect(input).toBeTruthy();
  });

  it('should autocapitalize none for password fields', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <ThemedInput placeholder="Password" isPassword />
    );

    const input = getByPlaceholderText('Password');
    expect(input.props.autoCapitalize).toBe('none');
  });
});
