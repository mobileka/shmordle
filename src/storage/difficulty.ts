/**
 * Preferred difficulty persistence layer.
 *
 * Remembers the player's last-chosen difficulty level across sessions
 * so the picker can default to it on next visit.
 *
 * @packageDocumentation
 */

import { DIFFICULTY } from '../domain/types';
import type { Difficulty } from '../domain/types';

const STORAGE_KEY = 'shmordle-preferred-difficulty';

export function savePreferredDifficulty(difficulty: Difficulty): void {
  localStorage.setItem(STORAGE_KEY, difficulty);
}

export function loadPreferredDifficulty(): Difficulty | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  if (!DIFFICULTY.includes(raw as Difficulty)) return null;
  return raw as Difficulty;
}
