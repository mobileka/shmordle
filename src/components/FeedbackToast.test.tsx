import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { FeedbackToast } from './FeedbackToast';

describe('FeedbackToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows toast when show is true', () => {
    render(<FeedbackToast message="Not in word list" show={true} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Not in word list');
  });

  it('renders the message text', () => {
    render(<FeedbackToast message="Test message" show={true} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Test message');
  });

  it('hides after exit animation when show becomes false', () => {
    const { rerender } = render(
      <FeedbackToast message="Not in word list" show={true} />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<FeedbackToast message="Not in word list" show={false} />);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
