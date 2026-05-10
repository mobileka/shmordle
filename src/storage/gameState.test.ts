import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveGameState, loadGameState, clearGameState } from './gameState';
import type { GameState, Difficulty } from '../domain/types';

const STORAGE_KEY = 'shmordle-game-state';

const validState: GameState = {
  gameId: 'test-game-id',
  hiddenWord: 'HELLO',
  guesses: ['WORLD'],
  currentGuess: 'QU',
  evaluations: [[{ letter: 'W', status: 'absent' }]],
  gameStatus: 'playing',
  virtualKeyboardState: { W: 'absent' },
  difficulty: 'hard' as Difficulty,
  startedAt: Date.now(),
  streak: 1,
  sessionPoints: 0,
  timeBonus: 0,
};

describe('gameState', () => {
  const store = new Map<string, string>();

  const localStorageMock = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
    removeItem: vi.fn((key: string) => { store.delete(key); }),
  };

  beforeEach(() => {
    store.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('saveGameState / loadGameState', () => {
    it('loads a valid game state', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validState));

      const loaded = loadGameState();

      expect(loaded).toEqual(validState);
    });

    it('saves a valid game state', () => {
      saveGameState(validState);
      const loaded = loadGameState();

      expect(loaded).toEqual(validState);
    });

    it('returns null when no state is saved', () => {
      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null for corrupt JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json');

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('loads a won state correctly', () => {
      const wonState: GameState = { ...validState, gameStatus: 'won' };

      saveGameState(wonState);
      const result = loadGameState();

      expect(result).toEqual(wonState);
    });

    it('loads a lost state correctly', () => {
      const lostState: GameState = { ...validState, gameStatus: 'lost' };

      saveGameState(lostState);
      const result = loadGameState();

      expect(result).toEqual(lostState);
    });
  });

  describe('loadGameState validation', () => {
    it('returns null when hiddenWord is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.hiddenWord;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when hiddenWord is not a string', () => {
      const invalid = { ...validState, hiddenWord: 12345 } as unknown as GameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when guesses is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.guesses;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when guesses is not an array', () => {
      const invalid = { ...validState, guesses: 'not-array' } as unknown as GameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when gameStatus is invalid', () => {
      const invalid = { ...validState, gameStatus: 'unknown' } as unknown as GameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when difficulty is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.difficulty;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when difficulty is invalid', () => {
      const invalid = { ...validState, difficulty: 'extreme' } as unknown as GameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when startedAt is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.startedAt;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when startedAt is not a number', () => {
      const invalid = { ...validState, startedAt: 'yesterday' } as unknown as GameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when streak is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.streak;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when sessionPoints is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.sessionPoints;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('returns null when timeBonus is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.timeBonus;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));

      const result = loadGameState();

      expect(result).toBeNull();
    });
  });

  describe('clearGameState', () => {
    it('removes the saved state from localStorage', () => {
      saveGameState(validState);

      clearGameState();

      expect(loadGameState()).toBeNull();
    });
  });
});
