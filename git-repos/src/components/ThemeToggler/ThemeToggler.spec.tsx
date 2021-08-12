import { mocked } from 'ts-jest/utils';

import { render, screen } from '@testing-library/react';

import { ThemeToggler } from '.';
import { useTheme } from '../../hooks/useTheme';

jest.mock('../../hooks/useTheme');

describe('ThemeToggler component', () => {
  it('should renders correct colors when calling with light theme', () => {
    const useThemeMocked = mocked(useTheme);

    useThemeMocked.mockReturnValue({
      theme: 'light',
      themeToggler: () => null,
    });

    render(<ThemeToggler />);

    expect(
      screen.getByTestId('theme-toggler-button-light-icon')
    ).toHaveAttribute('color', '#e6770b');
    expect(
      screen.getByTestId('theme-toggler-button-dark-icon')
    ).toHaveAttribute('color', '#e6770b60');
  });

  it('should renders correct colors when calling with dark theme', () => {
    const useThemeMocked = mocked(useTheme);

    useThemeMocked.mockReturnValue({
      theme: 'dark',
      themeToggler: () => null,
    });

    render(<ThemeToggler />);

    expect(
      screen.getByTestId('theme-toggler-button-light-icon')
    ).toHaveAttribute('color', '#76589860');
    expect(
      screen.getByTestId('theme-toggler-button-dark-icon')
    ).toHaveAttribute('color', '#765898');
  });
});
