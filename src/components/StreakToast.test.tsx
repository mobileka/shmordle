import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StreakToast } from './StreakToast';

describe('StreakToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders streak and points when show is true', () => {
    render(<StreakToast show={true} points={42} streak={3} />);
    expect(screen.getByText(/42\s*pts/i)).toBeInTheDocument();
    expect(screen.getByText(/streak\s*3/i)).toBeInTheDocument();
  });

  it('renders nothing when show is false', () => {
    const { container } = render(<StreakToast show={false} points={42} streak={3} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders singular streak', () => {
    render(<StreakToast show={true} points={10} streak={1} />);
    expect(screen.getByText(/streak\s*1/i)).toBeInTheDocument();
  });

  it('auto-dismisses after timeout', () => {
    const onDone = vi.fn();
    render(<StreakToast show={true} points={42} streak={3} onDone={onDone} />);

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(onDone).toHaveBeenCalledOnce();
  });
});
