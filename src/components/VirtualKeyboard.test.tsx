import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirtualKeyboard } from './VirtualKeyboard';

describe('VirtualKeyboard', () => {
  const defaultProps = {
    keyboardState: {},
    onLetter: vi.fn(),
    onEnter: vi.fn(),
    onBackspace: vi.fn(),
    disabled: false,
  };

  const KEYS_ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const KEYS_ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const KEYS_ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  it('renders all QWERTY keys', () => {
    render(<VirtualKeyboard {...defaultProps} />);
    [...KEYS_ROW_1, ...KEYS_ROW_2, ...KEYS_ROW_3].forEach((letter) => {
      expect(screen.getByRole('button', { name: letter })).toBeInTheDocument();
    });
  });

  it('renders Enter and Backspace keys', () => {
    render(<VirtualKeyboard {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '⌫' })).toBeInTheDocument();
  });

  it('applies status classes to keys', () => {
    render(
      <VirtualKeyboard
        {...defaultProps}
        keyboardState={{ A: 'correct', B: 'present', C: 'absent' }}
      />
    );
    expect(screen.getByRole('button', { name: 'A' }).className).toContain('correct');
    expect(screen.getByRole('button', { name: 'B' }).className).toContain('present');
    expect(screen.getByRole('button', { name: 'C' }).className).toContain('absent');
  });

  it('disables absent keys', () => {
    render(
      <VirtualKeyboard {...defaultProps} keyboardState={{ A: 'absent' }} />
    );
    expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
  });

  it('disables all keys when disabled prop is true', () => {
    render(<VirtualKeyboard {...defaultProps} disabled={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('calls onLetter when clicking a letter key', async () => {
    const onLetter = vi.fn();
    render(<VirtualKeyboard {...defaultProps} onLetter={onLetter} />);
    await userEvent.click(screen.getByRole('button', { name: 'Q' }));
    expect(onLetter).toHaveBeenCalledWith('Q');
  });

  it('calls onEnter when clicking Enter', async () => {
    const onEnter = vi.fn();
    render(<VirtualKeyboard {...defaultProps} onEnter={onEnter} />);
    await userEvent.click(screen.getByRole('button', { name: 'Enter' }));
    expect(onEnter).toHaveBeenCalled();
  });

  it('calls onBackspace when clicking Backspace', async () => {
    const onBackspace = vi.fn();
    render(<VirtualKeyboard {...defaultProps} onBackspace={onBackspace} />);
    await userEvent.click(screen.getByRole('button', { name: '⌫' }));
    expect(onBackspace).toHaveBeenCalled();
  });
});
