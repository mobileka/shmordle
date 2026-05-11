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

/**
 * Listens for physical keyboard events and dispatches game actions.
 *
 * Modifier keys (meta, ctrl, alt) are ignored so that shortcuts like
 * Cmd+R or Ctrl+F are not intercepted. Letters that are already marked
 * 'absent' on the virtual keyboard are also blocked from physical input,
 * preventing the player from reusing eliminated letters.
 *
 * `preventDefault()` is called on handled keys to stop browser defaults
 * (e.g., pressing 'g' should not trigger "Find in page").
 */
export function useKeyboard({
  onLetter,
  onEnter,
  onBackspace,
  virtualKeyboardState,
  disabled,
}: UseKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore all input when the game is not accepting input.
      if (disabled) return;
      // Ignore key combinations with modifiers (Cmd, Ctrl, Alt) so that
      // browser shortcuts like Cmd+R, Ctrl+F, etc. still work.
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

      // Accept single letter keys (a–z, A–Z).
      if (/^[a-zA-Z]$/.test(key)) {
        const upper = key.toUpperCase();
        // Block letters already eliminated (marked 'absent' by a previous guess).
        if (virtualKeyboardState[upper] === 'absent') return;
        e.preventDefault();
        onLetter(upper);
      }
    },
    [onLetter, onEnter, onBackspace, virtualKeyboardState, disabled]
  );

  // Register the keydown listener on the window.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
