import type { GameState, GameStatus } from '../types';

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
  if (typeof obj.keyboardState !== 'object' || obj.keyboardState === null) return false;

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

    return parsed;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
