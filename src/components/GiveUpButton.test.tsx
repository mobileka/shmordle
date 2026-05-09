import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GiveUpButton } from './GiveUpButton';

describe('GiveUpButton', () => {
  it('renders a button with correct title and aria-label', () => {
    render(<GiveUpButton onGiveUp={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Give up');
    expect(button).toHaveAttribute('title', 'Give up');
  });

  it('calls onGiveUp on click', async () => {
    const onGiveUp = vi.fn();
    render(<GiveUpButton onGiveUp={onGiveUp} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onGiveUp).toHaveBeenCalledOnce();
  });
});
