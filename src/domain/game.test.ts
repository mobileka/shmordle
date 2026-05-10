import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createGame,
  addLetter,
  removeLetter,
  submitGuess,
  forfeit,
  roundPoints,
  roundWin,
  statusPriority,
  mergeKeyboardState,
  calculatePoints,
  getRemainingTime,
  buildScoreRecord,
  isPersonalBest,
  finalizeGameScore,
} from './game';
import type { GameState, LetterResult, LetterStatus, ScoreRecord } from './types';

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  gameId: 'test-game-id',
  hiddenWord: 'HELLO',
  guesses: [],
  currentGuess: '',
  evaluations: [],
  gameStatus: 'playing',
  virtualKeyboardState: {},
  difficulty: 'hard',
  startedAt: Date.now(),
  streak: 1,
  sessionPoints: 0,
  timeBonus: 0,
  ...overrides,
});

describe('createGame', () => {
  it('returns a valid GameState with required fields', () => {
    const state = createGame('hard');

    expect(typeof state.hiddenWord).toBe('string');
    expect(state.hiddenWord).toHaveLength(5);
    expect(state.guesses).toEqual([]);
    expect(state.currentGuess).toBe('');
    expect(state.evaluations).toEqual([]);
    expect(state.gameStatus).toBe('playing');
    expect(state.virtualKeyboardState).toEqual({});
    expect(state.difficulty).toBe('hard');
    expect(typeof state.startedAt).toBe('number');
    expect(state.streak).toBe(1);
    expect(state.sessionPoints).toBe(0);
    expect(state.timeBonus).toBe(0);
    expect(typeof state.gameId).toBe('string');
    expect(state.gameId.length).toBeGreaterThan(0);
  });

  it('sets the correct difficulty', () => {
    expect(createGame('zen').difficulty).toBe('zen');
    expect(createGame('relaxed').difficulty).toBe('relaxed');
    expect(createGame('insane').difficulty).toBe('insane');
  });
});

describe('addLetter', () => {
  it('appends letter to currentGuess when playing', () => {
    const state = makeState({ currentGuess: 'HEL' });

    const result = addLetter(state, 'L');

    expect(result.currentGuess).toBe('HELL');
  });

  it('caps currentGuess at 5 letters', () => {
    const state = makeState({ currentGuess: 'HELLO' });

    const result = addLetter(state, 'X');

    expect(result.currentGuess).toBe('HELLO');
  });

  it('does nothing when game is won', () => {
    const state = makeState({ gameStatus: 'won', currentGuess: 'HE' });

    const result = addLetter(state, 'L');

    expect(result.currentGuess).toBe('HE');
  });

  it('does nothing when game is lost', () => {
    const state = makeState({ gameStatus: 'lost', currentGuess: 'HE' });

    const result = addLetter(state, 'L');

    expect(result.currentGuess).toBe('HE');
  });
});

describe('removeLetter', () => {
  it('removes last letter when playing', () => {
    const state = makeState({ currentGuess: 'HELL' });

    const result = removeLetter(state);

    expect(result.currentGuess).toBe('HEL');
  });

  it('does nothing when currentGuess is empty', () => {
    const state = makeState({ currentGuess: '' });

    const result = removeLetter(state);

    expect(result.currentGuess).toBe('');
  });

  it('does nothing when game is won', () => {
    const state = makeState({ gameStatus: 'won', currentGuess: 'HE' });

    const result = removeLetter(state);

    expect(result.currentGuess).toBe('HE');
  });

  it('does nothing when game is lost', () => {
    const state = makeState({ gameStatus: 'lost', currentGuess: 'HE' });

    const result = removeLetter(state);

    expect(result.currentGuess).toBe('HE');
  });
});

describe('submitGuess', () => {
  it('evaluates guess and adds to guesses and evaluations', () => {
    const state = makeState({ currentGuess: 'HELLP' });

    const result = submitGuess(state);

    expect(result.guesses).toEqual(['HELLP']);
    expect(result.evaluations).toHaveLength(1);
    expect(result.evaluations[0]).toHaveLength(5);
    expect(result.currentGuess).toBe('');
  });

  it('detects win condition', () => {
    const state = makeState({ hiddenWord: 'HELLO', currentGuess: 'HELLO' });

    const result = submitGuess(state);

    expect(result.gameStatus).toBe('won');
  });

  it('detects loss condition on 6th wrong guess', () => {
    const state = makeState({
      hiddenWord: 'HELLO',
      currentGuess: 'WORLD',
      guesses: ['AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE'],
      evaluations: [[], [], [], [], []],
    });

    const result = submitGuess(state);

    expect(result.gameStatus).toBe('lost');
  });

  it('clears currentGuess after submission', () => {
    const state = makeState({ currentGuess: 'HELLP' });

    const result = submitGuess(state);

    expect(result.currentGuess).toBe('');
  });

  it('updates virtualKeyboardState', () => {
    const state = makeState({ currentGuess: 'WORLD' });

    const result = submitGuess(state);

    expect(Object.keys(result.virtualKeyboardState).length).toBeGreaterThan(0);
  });
});

describe('forfeit', () => {
  it('sets gameStatus to lost', () => {
    const state = makeState({ gameStatus: 'playing' });

    const result = forfeit(state);

    expect(result.gameStatus).toBe('lost');
  });

  it('keeps all other state intact', () => {
    const state = makeState({
      hiddenWord: 'HELLO',
      guesses: ['WORLD', 'PLANE'],
      currentGuess: 'QU',
      evaluations: [[{ letter: 'W', status: 'absent' }], [{ letter: 'P', status: 'absent' }]],
      virtualKeyboardState: { W: 'absent', P: 'absent' },
    });

    const result = forfeit(state);

    expect(result.hiddenWord).toBe('HELLO');
    expect(result.guesses).toEqual(['WORLD', 'PLANE']);
    expect(result.currentGuess).toBe('QU');
    expect(result.evaluations).toEqual(state.evaluations);
    expect(result.virtualKeyboardState).toEqual({ W: 'absent', P: 'absent' });
  });
});

describe('roundPoints', () => {
  it('computes points from streak and remaining time', () => {
    const streak = 3;
    const timeLimit = 60; // hard mode
    const elapsed = 10;
    const remaining = timeLimit - elapsed;

    vi.spyOn(Date, 'now').mockReturnValue(90_000 + elapsed * 1000);
    const state = makeState({
      difficulty: 'hard',
      streak,
      startedAt: 90_000,
      timeBonus: 0,
    });

    const points = roundPoints(state);

    expect(points).toBe(streak * remaining);
  });
});

describe('roundWin', () => {
  it('increments streak', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    const state = makeState({ streak: 2 });

    const nextRound = roundWin(state);

    expect(nextRound.streak).toBe(3);
  });

  it('adds points to sessionPoints', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    const state = makeState({ sessionPoints: 50, startedAt: 90_000, difficulty: 'hard' });

    const nextRound = roundWin(state);

    expect(nextRound.sessionPoints).toBeGreaterThan(50);
  });

  it('adds timeBonus from difficulty config', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    const state = makeState({ difficulty: 'insane', timeBonus: 0 });

    const nextRound = roundWin(state);

    expect(nextRound.timeBonus).toBe(30);
  });

  it('sets new hiddenWord', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    const state = makeState({ hiddenWord: 'HELLO' });

    const nextRound = roundWin(state);

    expect(nextRound.hiddenWord).toBeDefined();
    expect(nextRound.hiddenWord).toHaveLength(5);
  });

  it('clears guesses and currentGuess', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    const state = makeState({ guesses: ['AAAAA', 'BBBBB'], currentGuess: 'HEL' });

    const nextRound = roundWin(state);

    expect(nextRound.guesses).toEqual([]);
    expect(nextRound.currentGuess).toBe('');
  });

  it('clears evaluations', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    const state = makeState({ evaluations: [[{ letter: 'A', status: 'absent' }]] });

    const nextRound = roundWin(state);

    expect(nextRound.evaluations).toEqual([]);
  });

  it('clears virtualKeyboardState', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    const state = makeState({ virtualKeyboardState: { A: 'absent', B: 'correct' } });

    const nextRound = roundWin(state);

    expect(nextRound.virtualKeyboardState).toEqual({});
  });

  it('stays playing', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);

    const nextRound = roundWin(makeState());

    expect(nextRound.gameStatus).toBe('playing');
  });
});

describe('statusPriority', () => {
  it('returns 3 for correct', () => expect(statusPriority('correct')).toBe(3));
  it('returns 2 for present', () => expect(statusPriority('present')).toBe(2));
  it('returns 1 for absent', () => expect(statusPriority('absent')).toBe(1));
  it('returns 0 for default', () => expect(statusPriority('default')).toBe(0));
});

describe('mergeKeyboardState', () => {
  it('adds all letters from evaluation to empty state', () => {
    const evaluation: LetterResult[] = [
      { letter: 'A', status: 'correct' },
      { letter: 'B', status: 'present' },
      { letter: 'C', status: 'absent' },
    ];

    const result = mergeKeyboardState({}, evaluation);

    expect(result['A']).toBe('correct');
    expect(result['B']).toBe('present');
    expect(result['C']).toBe('absent');
  });

  it('upgrades absent to present', () => {
    const current: Record<string, LetterStatus> = { A: 'absent' };

    const result = mergeKeyboardState(current, [{ letter: 'A', status: 'present' }]);

    expect(result['A']).toBe('present');
  });

  it('upgrades present to correct', () => {
    const current: Record<string, LetterStatus> = { A: 'present' };

    const result = mergeKeyboardState(current, [{ letter: 'A', status: 'correct' }]);

    expect(result['A']).toBe('correct');
  });

  it('does not downgrade correct to present', () => {
    const current: Record<string, LetterStatus> = { A: 'correct' };

    const result = mergeKeyboardState(current, [{ letter: 'A', status: 'present' }]);

    expect(result['A']).toBe('correct');
  });

  it('does not downgrade present to absent', () => {
    const current: Record<string, LetterStatus> = { A: 'present' };

    const result = mergeKeyboardState(current, [{ letter: 'A', status: 'absent' }]);

    expect(result['A']).toBe('present');
  });

  it('does not downgrade correct to absent', () => {
    const current: Record<string, LetterStatus> = { A: 'correct' };

    const result = mergeKeyboardState(current, [{ letter: 'A', status: 'absent' }]);

    expect(result['A']).toBe('correct');
  });

  it('merges multiple evaluations progressively', () => {
    let keyboard: Record<string, LetterStatus> = {};

    keyboard = mergeKeyboardState(keyboard, [{ letter: 'A', status: 'absent' }]);
    expect(keyboard['A']).toBe('absent');

    keyboard = mergeKeyboardState(keyboard, [{ letter: 'A', status: 'present' }]);
    expect(keyboard['A']).toBe('present');

    keyboard = mergeKeyboardState(keyboard, [{ letter: 'A', status: 'correct' }]);
    expect(keyboard['A']).toBe('correct');
  });
});

describe('calculatePoints', () => {
  it('multiplies streak by remainingTime', () => expect(calculatePoints(3, 50)).toBe(150));
  it('returns 0 when remainingTime is 0', () => expect(calculatePoints(5, 0)).toBe(0));
  it('returns 0 when streak is 0', () => expect(calculatePoints(0, 100)).toBe(0));
});

describe('getRemainingTime', () => {
  it('calculates remaining time from offset', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);

    const remaining = getRemainingTime(70_000, 60);

    expect(remaining).toBe(30);
  });

  it('returns full timeLimit when just started', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);

    const remaining = getRemainingTime(100_000, 60);

    expect(remaining).toBe(60);
  });

  it('clamps to 0 when elapsed exceeds timeLimit', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);

    const remaining = getRemainingTime(30_000, 60);

    expect(remaining).toBe(0);
  });

  it('floors partial seconds', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_500);

    const remaining = getRemainingTime(100_000, 60);

    expect(remaining).toBe(59);
  });
});

describe('buildScoreRecord', () => {
  it('maps GameState fields to ScoreRecord', () => {
    const state = makeState({ difficulty: 'hard', streak: 7, sessionPoints: 420 });

    const record = buildScoreRecord(state);

    expect(record.id).toBe('test-game-id');
    expect(record.difficulty).toBe('hard');
    expect(record.maxStreak).toBe(7);
    expect(record.totalPoints).toBe(420);
  });

  it('sets id from gameId and date to current timestamp', () => {
    const state = makeState({ gameId: 'test-id' });

    const record = buildScoreRecord(state);

    expect(record.id).toBe('test-id');
    expect(record.date).toBeGreaterThanOrEqual(Date.now() - 1000);
  });
});

describe('isPersonalBest', () => {
  const records: ScoreRecord[] = [
    { id: '1', difficulty: 'hard', maxStreak: 3, totalPoints: 100, date: 1000 },
    { id: '2', difficulty: 'hard', maxStreak: 5, totalPoints: 200, date: 2000 },
    { id: '3', difficulty: 'relaxed', maxStreak: 2, totalPoints: 50, date: 1500 },
  ];

  it('returns true for empty records array', () => {
    const result = isPersonalBest([], 'hard', 10);

    expect(result).toBe(true);
  });

  it('returns true when totalPoints beats all same-difficulty records', () => {
    const result = isPersonalBest(records, 'hard', 300);

    expect(result).toBe(true);
  });

  it('returns false when totalPoints is lower', () => {
    const result = isPersonalBest(records, 'hard', 150);

    expect(result).toBe(false);
  });

  it('ignores records from other difficulties', () => {
    const result = isPersonalBest(records, 'insane', 30);

    expect(result).toBe(true);
  });
});

describe('finalizeGameScore', () => {
  const store = new Map<string, string>();

  const localStorageMock = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
    removeItem: vi.fn((key: string) => { store.delete(key); }),
  };

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when gameStatus is not lost', () => {
    const state = makeState({ gameStatus: 'playing' });

    const result = finalizeGameScore(state);

    expect(result).toBeNull();
    expect(store.has('shmordle-scores')).toBe(false);
  });

  it('returns null when difficulty is zen', () => {
    const state = makeState({ gameStatus: 'lost', difficulty: 'zen' });

    const result = finalizeGameScore(state);

    expect(result).toBeNull();
    expect(store.has('shmordle-scores')).toBe(false);
  });

  it('returns true when it is a personal best', () => {
    localStorage.setItem('shmordle-scores', JSON.stringify({
      records: [{ id: 'old', difficulty: 'hard', maxStreak: 2, totalPoints: 50, date: 1000 }]
    }));

    const state = makeState({
      gameStatus: 'lost',
      difficulty: 'hard',
      streak: 7,
      sessionPoints: 200,
    });

    const result = finalizeGameScore(state);

    expect(result).toBe(true);
  });

  it('returns false when not a personal best', () => {
    localStorage.setItem('shmordle-scores', JSON.stringify({
      records: [{ id: 'old', difficulty: 'hard', maxStreak: 5, totalPoints: 300, date: 1000 }]
    }));

    const state = makeState({
      gameStatus: 'lost',
      difficulty: 'hard',
      streak: 3,
      sessionPoints: 100,
    });

    const result = finalizeGameScore(state);

    expect(result).toBe(false);
  });

  it('saves a score record to localStorage', () => {
    const state = makeState({
      gameStatus: 'lost',
      difficulty: 'hard',
      streak: 4,
      sessionPoints: 180,
    });

    finalizeGameScore(state);

    const saved = JSON.parse(store.get('shmordle-scores')!);
    expect(saved.records).toHaveLength(1);
    expect(saved.records[0].id).toBe(state.gameId);
    expect(saved.records[0].maxStreak).toBe(4);
    expect(saved.records[0].totalPoints).toBe(180);
  });
});
