/**
 * Game state persistence layer.
 *
 * Saves, loads, validates, and clears the full game state
 * (hidden word, guesses, evaluations, keyboard, streak, etc.)
 * using localStorage.
 *
 * @packageDocumentation
 */

import { DIFFICULTY } from '../domain/types';
import type { GameState, GameStatus, Difficulty } from '../domain/types';

const STORAGE_KEY = 'shmordle-game-state';

const VALID_STATUSES: GameStatus[] = ['playing', 'won', 'lost'];

function isValidGameState(data: unknown): data is GameState {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  if (typeof obj.hiddenWord !== 'string' || obj.hiddenWord.length !== 5) return false;
  if (!Array.isArray(obj.guesses)) return false;
  if (typeof obj.currentGuess !== 'string') return false;
  if (!Array.isArray(obj.evaluations)) return false;
  if (!VALID_STATUSES.includes(obj.gameStatus as GameStatus)) return false;
  if (typeof obj.virtualKeyboardState !== 'object' || obj.virtualKeyboardState === null) return false;
  if (!DIFFICULTY.includes(obj.difficulty as Difficulty)) return false;
  if (typeof obj.startedAt !== 'number' || obj.startedAt <= 0) return false;
  if (typeof obj.streak !== 'number') return false;
  if (typeof obj.sessionPoints !== 'number') return false;
  if (typeof obj.timeBonus !== 'number') return false;
  if (obj.gameId !== undefined && typeof obj.gameId !== 'string') return false;

  return true;
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidGameState(parsed)) return null;

    if (!parsed.gameId) {
      parsed.gameId = crypto.randomUUID();
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
