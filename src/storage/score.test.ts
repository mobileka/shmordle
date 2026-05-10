import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveScore, loadScores, clearScores } from './score';
import type { Difficulty } from '../domain/types';

const SCORES_KEY = 'shmordle-scores';

describe('score', () => {
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

  it('saves records without duplicates', () => {
    const record = {
      id: '1',
      difficulty: 'insane' as Difficulty,
      maxStreak: 5,
      totalPoints: 420,
      date: Date.now(),
    };

    for (let i = 0; i < 5; i++) {
      saveScore(record);
    }

    const data = loadScores();
    expect(data.records).toHaveLength(1);
    expect(data.records[0]).toEqual(record);
  });

  it('appends multiple records', () => {
    const records = [
      { id: '1', difficulty: 'hard' as Difficulty, maxStreak: 2, totalPoints: 100, date: 1000 },
      { id: '2', difficulty: 'insane' as Difficulty, maxStreak: 5, totalPoints: 300, date: 2000 }
    ];

    for (const record of records) {
      saveScore(record);
    }

    const data = loadScores();
    expect(data.records).toHaveLength(2);
  });

  it('clears scores for a specific difficulty', () => {
    const records = [
      { id: '1', difficulty: 'hard' as Difficulty, maxStreak: 2, totalPoints: 100, date: 1000 },
      { id: '2', difficulty: 'insane' as Difficulty, maxStreak: 5, totalPoints: 300, date: 2000 }
    ];

    for (const record of records) {
      saveScore(record);
    }

    clearScores('hard');

    const data = loadScores();
    expect(data.records).toHaveLength(1);
    expect(data.records[0].difficulty).toBe('insane');
  });

  it('returns empty records when no scores saved', () => {
    const data = loadScores();
    expect(data.records).toEqual([]);
  });

  it('preserves original date on overwrite', () => {
    const record = {
      id: '1',
      difficulty: 'hard' as Difficulty,
      maxStreak: 2,
      totalPoints: 100,
      date: 1000,
    };

    saveScore(record);

    const updated = { ...record, maxStreak: 3, totalPoints: 150, date: 9999 };

    saveScore(updated);

    const data = loadScores();
    expect(data.records).toHaveLength(1);
    expect(data.records[0].maxStreak).toBe(3);
    expect(data.records[0].totalPoints).toBe(150);
    expect(data.records[0].date).toBe(1000);
  });

  it('handles corrupt data gracefully', () => {
    localStorage.setItem(SCORES_KEY, 'not-json');
    const data = loadScores();
    expect(data.records).toEqual([]);
  });
});
