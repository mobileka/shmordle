import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

const mockToggleTheme = vi.fn();

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from '../hooks/useTheme';

const mockUseTheme = vi.mocked(useTheme);

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setTheme = (theme: 'light' | 'dark') => {
    mockUseTheme.mockReturnValue({
      theme,
      isDark: theme === 'dark',
      toggleTheme: mockToggleTheme,
    });
  };

  it('renders a button with role switch', () => {
    setTheme('light');
    render(<ThemeToggle />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('has aria-checked false in light mode', () => {
    setTheme('light');
    render(<ThemeToggle />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('has aria-checked true in dark mode', () => {
    setTheme('dark');
    render(<ThemeToggle />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('has accessible label', () => {
    setTheme('light');
    render(<ThemeToggle />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Toggle theme');
  });

  it('calls toggleTheme when clicked', async () => {
    setTheme('light');
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('switch'));
    expect(mockToggleTheme).toHaveBeenCalled();
  });
});
