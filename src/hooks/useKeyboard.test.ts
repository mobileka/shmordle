import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboard } from './useKeyboard';

describe('useKeyboard', () => {
  let onLetter: (letter: string) => void;
  let onEnter: () => void;
  let onBackspace: () => void;

  const fireKeyDown = (key: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  };

  const fireLetter = (char: string) => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: char })
    );
  };

  beforeEach(() => {
    onLetter = vi.fn<(letter: string) => void>();
    onEnter = vi.fn<() => void>();
    onBackspace = vi.fn<() => void>();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const render = (overrides = {}) =>
    renderHook(() =>
      useKeyboard({
        onLetter,
        onEnter,
        onBackspace,
        virtualKeyboardState: {},
        disabled: false,
        ...overrides,
      })
    );

  it('calls onLetter for a-z keys', () => {
    render();
    fireLetter('a');
    expect(onLetter).toHaveBeenCalledWith('A');
  });

  it('calls onLetter for uppercase A-Z keys', () => {
    render();
    fireLetter('Z');
    expect(onLetter).toHaveBeenCalledWith('Z');
  });

  it('calls onEnter for Enter key', () => {
    render();
    fireKeyDown('Enter');
    expect(onEnter).toHaveBeenCalled();
  });

  it('calls onBackspace for Backspace key', () => {
    render();
    fireKeyDown('Backspace');
    expect(onBackspace).toHaveBeenCalled();
  });

  it('ignores non-letter keys', () => {
    render();
    fireKeyDown('1');
    fireKeyDown(' ');
    fireKeyDown('!');
    fireKeyDown('ArrowLeft');
    expect(onLetter).not.toHaveBeenCalled();
    expect(onEnter).not.toHaveBeenCalled();
    expect(onBackspace).not.toHaveBeenCalled();
  });

  it('blocks absent keys', () => {
    render({ virtualKeyboardState: { A: 'absent' } });
    fireLetter('a');
    expect(onLetter).not.toHaveBeenCalled();
  });

  it('ignores letter keys when metaKey is pressed', () => {
    render();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', metaKey: true }));
    expect(onLetter).not.toHaveBeenCalled();
  });

  it('ignores letter keys when ctrlKey is pressed', () => {
    render();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', ctrlKey: true }));
    expect(onLetter).not.toHaveBeenCalled();
  });

  it('ignores letter keys when altKey is pressed', () => {
    render();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', altKey: true }));
    expect(onLetter).not.toHaveBeenCalled();
  });

  it('ignores Enter when metaKey is pressed', () => {
    render();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true }));
    expect(onEnter).not.toHaveBeenCalled();
  });

  it('ignores Backspace when metaKey is pressed', () => {
    render();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', metaKey: true }));
    expect(onBackspace).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    render({ disabled: true });
    fireLetter('a');
    fireKeyDown('Enter');
    fireKeyDown('Backspace');
    expect(onLetter).not.toHaveBeenCalled();
    expect(onEnter).not.toHaveBeenCalled();
    expect(onBackspace).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = render();
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
