import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveGameState, loadGameState, clearGameState } from './storage';
import type { GameState } from '../types';

const STORAGE_KEY = 'shmordle-game-state';

const validState: GameState = {
  hiddenWord: 'HELLO',
  guesses: ['WORLD'],
  currentGuess: 'QU',
  evaluations: [[{ letter: 'W', status: 'absent' }]],
  gameStatus: 'playing',
  keyboardState: { W: 'absent' },
};

describe('storage', () => {
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
    it('saves and loads a valid game state', () => {
      saveGameState(validState);
      const loaded = loadGameState();
      expect(loaded).toEqual(validState);
    });

    it('returns null when no state is saved', () => {
      expect(loadGameState()).toBeNull();
    });

    it('returns null for corrupt JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json');
      expect(loadGameState()).toBeNull();
    });

    it('returns null when hiddenWord is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.hiddenWord;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      expect(loadGameState()).toBeNull();
    });

    it('returns null when hiddenWord is not a string', () => {
      const invalid = { ...validState, hiddenWord: 12345 } as unknown as GameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      expect(loadGameState()).toBeNull();
    });

    it('returns null when guesses is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.guesses;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      expect(loadGameState()).toBeNull();
    });

    it('returns null when guesses is not an array', () => {
      const invalid = { ...validState, guesses: 'not-array' } as unknown as GameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      expect(loadGameState()).toBeNull();
    });

    it('returns null when gameStatus is invalid', () => {
      const invalid = { ...validState, gameStatus: 'unknown' } as unknown as GameState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      expect(loadGameState()).toBeNull();
    });

    it('loads a won state correctly', () => {
      const wonState: GameState = { ...validState, gameStatus: 'won' };
      saveGameState(wonState);
      expect(loadGameState()).toEqual(wonState);
    });

    it('loads a lost state correctly', () => {
      const lostState: GameState = { ...validState, gameStatus: 'lost' };
      saveGameState(lostState);
      expect(loadGameState()).toEqual(lostState);
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
