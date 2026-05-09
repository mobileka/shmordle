import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    isDark: false,
    toggleTheme: vi.fn(),
  })),
}));

describe('Header', () => {
  it('renders the title Shmordle', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { name: 'Shmordle' })).toBeInTheDocument();
  });

  it('renders a header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the ThemeToggle', () => {
    render(<Header />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});
