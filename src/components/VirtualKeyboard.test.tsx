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

  it('renders all QWERTY keys', () => {
    render(<VirtualKeyboard {...defaultProps} />);
    const letters = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
      'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
      'Z', 'X', 'C', 'V', 'B', 'N', 'M'];
    letters.forEach((l) => {
      expect(screen.getByText(l)).toBeInTheDocument();
    });
  });

  it('renders Enter and Backspace keys', () => {
    render(<VirtualKeyboard {...defaultProps} />);
    expect(screen.getByText('Enter')).toBeInTheDocument();
    expect(screen.getByText('⌫')).toBeInTheDocument();
  });

  it('applies status classes to keys', () => {
    const { container } = render(
      <VirtualKeyboard
        {...defaultProps}
        keyboardState={{ A: 'correct', B: 'present', C: 'absent' }}
      />
    );
    const buttons = container.querySelectorAll('button');
    const aBtn = Array.from(buttons).find((b) => b.textContent === 'A');
    const bBtn = Array.from(buttons).find((b) => b.textContent === 'B');
    const cBtn = Array.from(buttons).find((b) => b.textContent === 'C');
    expect(aBtn?.className).toContain('correct');
    expect(bBtn?.className).toContain('present');
    expect(cBtn?.className).toContain('absent');
  });

  it('disables absent keys', () => {
    render(
      <VirtualKeyboard {...defaultProps} keyboardState={{ A: 'absent' }} />
    );
    expect(screen.getByText('A')).toBeDisabled();
  });

  it('disables all keys when disabled prop is true', () => {
    render(<VirtualKeyboard {...defaultProps} disabled={true} />);
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('calls onLetter when clicking a letter key', async () => {
    const onLetter = vi.fn();
    render(<VirtualKeyboard {...defaultProps} onLetter={onLetter} />);
    await userEvent.click(screen.getByText('Q'));
    expect(onLetter).toHaveBeenCalledWith('Q');
  });

  it('calls onEnter when clicking Enter', async () => {
    const onEnter = vi.fn();
    render(<VirtualKeyboard {...defaultProps} onEnter={onEnter} />);
    await userEvent.click(screen.getByText('Enter'));
    expect(onEnter).toHaveBeenCalled();
  });

  it('calls onBackspace when clicking Backspace', async () => {
    const onBackspace = vi.fn();
    render(<VirtualKeyboard {...defaultProps} onBackspace={onBackspace} />);
    await userEvent.click(screen.getByText('⌫'));
    expect(onBackspace).toHaveBeenCalled();
  });
});
