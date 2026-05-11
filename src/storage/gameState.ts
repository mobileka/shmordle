/**
 * Game state persistence layer.
 *
 * Saves, loads, validates, and clears the full game state
 * (hidden word, guesses, evaluations, keyboard, streak, etc.)
 * using localStorage.
 *
 * Schema validation in `isValidGameState` protects against corrupted
 * or stale data from previous app versions. If validation fails, the
 * game starts fresh rather than crashing.
 *
 * @packageDocumentation
 */

import { DIFFICULTY } from '../domain/types';
import type { GameState, GameStatus, Difficulty } from '../domain/types';

const STORAGE_KEY = 'shmordle-game-state';

// All valid game status values, used for schema validation.
const VALID_STATUSES: GameStatus[] = ['playing', 'won', 'lost'];

/**
 * Validates that parsed data conforms to the GameState shape.
 *
 * This is a runtime type guard. It checks every required field so that
 * corrupted, partial, or outdated localStorage data is rejected safely
 * rather than causing runtime errors downstream.
 *
 * @param data - The unknown value to validate.
 * @returns True if data is a valid GameState (also narrows the type).
 */
function isValidGameState(data: unknown): data is GameState {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // Check each required field has the expected type and reasonable value.
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
  // gameId is optional in older saves; it is a string when present.
  if (obj.gameId !== undefined && typeof obj.gameId !== 'string') return false;

  return true;
}

/**
 * Persists the full game state to localStorage.
 *
 * @param state - The current GameState to save.
 */
export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Loads and validates the game state from localStorage.
 *
 * If no saved state exists, or if the data fails validation, returns null.
 * Older saves without a gameId are assigned one on load for score tracking.
 *
 * @returns The validated GameState, or null if none exists or data is corrupt.
 */
export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidGameState(parsed)) return null;

    // Backfill gameId for saves created before it was added.
    if (!parsed.gameId) {
      parsed.gameId = crypto.randomUUID();
    }

    return parsed;
  } catch {
    // JSON parse error or other exception — treat as no saved state.
    return null;
  }
}

/**
 * Removes the saved game state from localStorage.
 * Called when starting a new game or clearing progress.
 */
export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
