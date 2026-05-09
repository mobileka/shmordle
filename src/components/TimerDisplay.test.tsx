import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';

describe('TimerDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when timeRemaining is null', () => {
    const { container } = render(<TimerDisplay timeRemaining={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders formatted M:SS', () => {
    render(<TimerDisplay timeRemaining={125} />);
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('renders single digit minutes', () => {
    render(<TimerDisplay timeRemaining={60} />);
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('renders zero-padded seconds', () => {
    render(<TimerDisplay timeRemaining={65} />);
    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('shows urgent class at 10 seconds', () => {
    render(<TimerDisplay timeRemaining={10} />);
    const el = screen.getByText('0:10');
    expect(el.className).toContain('urgent');
  });

  it('shows urgent class below 10 seconds', () => {
    render(<TimerDisplay timeRemaining={3} />);
    const el = screen.getByText('0:03');
    expect(el.className).toContain('urgent');
  });

  it('does not show urgent class above 10 seconds', () => {
    render(<TimerDisplay timeRemaining={11} />);
    const el = screen.getByText('0:11');
    expect(el.className).not.toContain('urgent');
  });

  it('renders 0:00 at zero', () => {
    render(<TimerDisplay timeRemaining={0} />);
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('animates when timeRemaining increases', () => {
    const { rerender } = render(<TimerDisplay timeRemaining={15} />);
    rerender(<TimerDisplay timeRemaining={45} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const el = screen.getByText(/^\d+:\d{2}$/);
    expect(el.className).toContain('counting');
  });

  it('does not animate when timeRemaining decreases', () => {
    const { rerender } = render(<TimerDisplay timeRemaining={45} />);
    rerender(<TimerDisplay timeRemaining={44} />);

    const el = screen.getByText('0:44');
    expect(el.className).not.toContain('counting');
  });
});
