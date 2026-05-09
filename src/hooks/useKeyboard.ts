import { useEffect, useCallback } from 'react';
import type { LetterStatus } from '../types';

interface UseKeyboardOptions {
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  keyboardState: Record<string, LetterStatus>;
  disabled: boolean;
}

export function useKeyboard({
  onLetter,
  onEnter,
  onBackspace,
  keyboardState,
  disabled,
}: UseKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

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
        if (keyboardState[upper] === 'absent') return;
        e.preventDefault();
        onLetter(upper);
      }
    },
    [onLetter, onEnter, onBackspace, keyboardState, disabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
