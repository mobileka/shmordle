import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('does not render GiveUpButton when showGiveUp is false', () => {
    render(<Header showGiveUp={false} onGiveUp={vi.fn()} />);
    expect(screen.queryByLabelText('Give up')).not.toBeInTheDocument();
  });

  it('does not render GiveUpButton when onGiveUp is not provided', () => {
    render(<Header showGiveUp={true} />);
    expect(screen.queryByLabelText('Give up')).not.toBeInTheDocument();
  });

  it('renders GiveUpButton when showGiveUp is true and onGiveUp is provided', () => {
    render(<Header showGiveUp={true} onGiveUp={vi.fn()} />);
    expect(screen.getByLabelText('Give up')).toBeInTheDocument();
  });

  it('calls onGiveUp when GiveUpButton is clicked', async () => {
    const onGiveUp = vi.fn();
    render(<Header showGiveUp={true} onGiveUp={onGiveUp} />);
    await userEvent.click(screen.getByLabelText('Give up'));
    expect(onGiveUp).toHaveBeenCalledOnce();
  });
});
