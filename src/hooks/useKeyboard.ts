/**
 * Physical keyboard listener hook.
 *
 * Maps `keydown` events to game actions (letter input, Enter, Backspace).
 * Respects absent keys (blocked on physical input) and the disabled state.
 *
 * @packageDocumentation
 */

import { useEffect, useCallback } from 'react';
import type { LetterStatus } from '../domain/types';

interface UseKeyboardOptions {
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  virtualKeyboardState: Record<string, LetterStatus>;
  disabled: boolean;
}

export function useKeyboard({
  onLetter,
  onEnter,
  onBackspace,
  virtualKeyboardState,
  disabled,
}: UseKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      if (key === 'Enter') {
        e.preventDefault();
        onEnter();
        return;
      }

      if (key === 'Backspace') {
        e.preventDefault();
        onBackspace();
        return;
      }

      if (/^[a-zA-Z]$/.test(key)) {
        const upper = key.toUpperCase();
        if (virtualKeyboardState[upper] === 'absent') return;
        e.preventDefault();
        onLetter(upper);
      }
    },
    [onLetter, onEnter, onBackspace, virtualKeyboardState, disabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
