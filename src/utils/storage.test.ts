import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveGameState, loadGameState, clearGameState, savePreferredDifficulty, loadPreferredDifficulty, saveScore, loadScores, clearScores } from './storage';
import type { GameState, Difficulty } from '../types';

const STORAGE_KEY = 'shmordle-game-state';
const PREFERRED_KEY = 'shmordle-preferred-difficulty';
const SCORES_KEY = 'shmordle-scores';

const validState: GameState = {
  hiddenWord: 'HELLO',
  guesses: ['WORLD'],
  currentGuess: 'QU',
  evaluations: [[{ letter: 'W', status: 'absent' }]],
  gameStatus: 'playing',
  keyboardState: { W: 'absent' },
  difficulty: 'hard' as Difficulty,
  startedAt: Date.now(),
  streak: 1,
  sessionPoints: 0,
  timeBonus: 0,
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

  it('returns null when difficulty is missing', () => {
    const invalid = { ...validState } as Record<string, unknown>;
    delete invalid.difficulty;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
    expect(loadGameState()).toBeNull();
  });

  it('returns null when difficulty is invalid', () => {
    const invalid = { ...validState, difficulty: 'extreme' } as unknown as GameState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
    expect(loadGameState()).toBeNull();
  });

  it('returns null when startedAt is missing', () => {
    const invalid = { ...validState } as Record<string, unknown>;
    delete invalid.startedAt;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
    expect(loadGameState()).toBeNull();
  });

  it('returns null when startedAt is not a number', () => {
    const invalid = { ...validState, startedAt: 'yesterday' } as unknown as GameState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
    expect(loadGameState()).toBeNull();
  });

  describe('clearGameState', () => {
    it('removes the saved state from localStorage', () => {
      saveGameState(validState);
      clearGameState();
      expect(loadGameState()).toBeNull();
    });
  });

  describe('preferred difficulty', () => {
    it('saves and loads preferred difficulty', () => {
      savePreferredDifficulty('insane');
      expect(loadPreferredDifficulty()).toBe('insane');
    });

    it('returns null when no preference is saved', () => {
      expect(loadPreferredDifficulty()).toBeNull();
    });

    it('returns null for invalid saved value', () => {
      localStorage.setItem(PREFERRED_KEY, 'legendary');
      expect(loadPreferredDifficulty()).toBeNull();
    });

    it('overwrites previous preference', () => {
      savePreferredDifficulty('hard');
      savePreferredDifficulty('zen');
      expect(loadPreferredDifficulty()).toBe('zen');
    });
  });

  describe('score records', () => {
    it('saves and loads score records', () => {
      const record = {
        id: 1,
        difficulty: 'insane' as Difficulty,
        maxStreak: 5,
        totalPoints: 420,
        date: Date.now(),
      };
      saveScore(record);
      const data = loadScores();
      expect(data.records).toHaveLength(1);
      expect(data.records[0]).toEqual(record);
    });

    it('appends multiple records', () => {
      saveScore({ id: 1, difficulty: 'hard' as Difficulty, maxStreak: 2, totalPoints: 100, date: 1000 });
      saveScore({ id: 2, difficulty: 'insane' as Difficulty, maxStreak: 5, totalPoints: 300, date: 2000 });
      const data = loadScores();
      expect(data.records).toHaveLength(2);
    });

    it('clears scores for a specific difficulty', () => {
      saveScore({ id: 1, difficulty: 'hard' as Difficulty, maxStreak: 2, totalPoints: 100, date: 1000 });
      saveScore({ id: 2, difficulty: 'insane' as Difficulty, maxStreak: 5, totalPoints: 300, date: 2000 });
      clearScores('hard');
      const data = loadScores();
      expect(data.records).toHaveLength(1);
      expect(data.records[0].difficulty).toBe('insane');
    });

    it('returns empty records when no scores saved', () => {
      const data = loadScores();
      expect(data.records).toEqual([]);
    });

    it('handles corrupt data gracefully', () => {
      localStorage.setItem(SCORES_KEY, 'not-json');
      const data = loadScores();
      expect(data.records).toEqual([]);
    });
  });

  describe('new GameState fields', () => {
    it('returns null when streak is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.streak;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      expect(loadGameState()).toBeNull();
    });

    it('returns null when sessionPoints is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.sessionPoints;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      expect(loadGameState()).toBeNull();
    });

    it('returns null when timeBonus is missing', () => {
      const invalid = { ...validState } as Record<string, unknown>;
      delete invalid.timeBonus;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalid));
      expect(loadGameState()).toBeNull();
    });
  });
});
