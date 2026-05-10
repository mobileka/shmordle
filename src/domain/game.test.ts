import { describe, it, expect, vi } from 'vitest';
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
} from './game';
import type { GameState, LetterResult, LetterStatus, ScoreRecord } from './types';

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
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
    expect(addLetter(state, 'L').currentGuess).toBe('HELL');
  });

  it('caps currentGuess at 5 letters', () => {
    const state = makeState({ currentGuess: 'HELLO' });
    expect(addLetter(state, 'X').currentGuess).toBe('HELLO');
  });

  it('does nothing when game is won', () => {
    const state = makeState({ gameStatus: 'won', currentGuess: 'HE' });
    expect(addLetter(state, 'L').currentGuess).toBe('HE');
  });

  it('does nothing when game is lost', () => {
    const state = makeState({ gameStatus: 'lost', currentGuess: 'HE' });
    expect(addLetter(state, 'L').currentGuess).toBe('HE');
  });
});

describe('removeLetter', () => {
  it('removes last letter when playing', () => {
    const state = makeState({ currentGuess: 'HELL' });
    expect(removeLetter(state).currentGuess).toBe('HEL');
  });

  it('does nothing when currentGuess is empty', () => {
    const state = makeState({ currentGuess: '' });
    expect(removeLetter(state).currentGuess).toBe('');
  });

  it('does nothing when game is won', () => {
    const state = makeState({ gameStatus: 'won', currentGuess: 'HE' });
    expect(removeLetter(state).currentGuess).toBe('HE');
  });

  it('does nothing when game is lost', () => {
    const state = makeState({ gameStatus: 'lost', currentGuess: 'HE' });
    expect(removeLetter(state).currentGuess).toBe('HE');
  });
});

describe('submitGuess', () => {
  it('evaluates guess and adds to guesses and evaluations', () => {
    const state = makeState({ currentGuess: 'HELLP' });
    const next = submitGuess(state);
    expect(next.guesses).toEqual(['HELLP']);
    expect(next.evaluations).toHaveLength(1);
    expect(next.evaluations[0]).toHaveLength(5);
    expect(next.currentGuess).toBe('');
  });

  it('detects win condition', () => {
    const state = makeState({ hiddenWord: 'HELLO', currentGuess: 'HELLO' });
    expect(submitGuess(state).gameStatus).toBe('won');
  });

  it('detects loss condition on 6th wrong guess', () => {
    const state = makeState({
      hiddenWord: 'HELLO',
      currentGuess: 'WORLD',
      guesses: ['AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE'],
      evaluations: [[], [], [], [], []],
    });
    expect(submitGuess(state).gameStatus).toBe('lost');
  });

  it('clears currentGuess after submission', () => {
    const state = makeState({ currentGuess: 'HELLP' });
    expect(submitGuess(state).currentGuess).toBe('');
  });

  it('updates virtualKeyboardState', () => {
    const state = makeState({ currentGuess: 'WORLD' });
    const next = submitGuess(state);
    expect(Object.keys(next.virtualKeyboardState).length).toBeGreaterThan(0);
  });
});

describe('forfeit', () => {
  it('sets gameStatus to lost', () => {
    const state = makeState({ gameStatus: 'playing' });
    expect(forfeit(state).gameStatus).toBe('lost');
  });

  it('keeps all other state intact', () => {
    const state = makeState({
      hiddenWord: 'HELLO',
      guesses: ['WORLD', 'PLANE'],
      currentGuess: 'QU',
      evaluations: [[{ letter: 'W', status: 'absent' }], [{ letter: 'P', status: 'absent' }]],
      virtualKeyboardState: { W: 'absent', P: 'absent' },
    });
    const next = forfeit(state);
    expect(next.hiddenWord).toBe('HELLO');
    expect(next.guesses).toEqual(['WORLD', 'PLANE']);
    expect(next.currentGuess).toBe('QU');
    expect(next.evaluations).toEqual(state.evaluations);
    expect(next.virtualKeyboardState).toEqual({ W: 'absent', P: 'absent' });
  });
});

describe('roundPoints', () => {
  it('computes points from streak and remaining time', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    const state = makeState({
      difficulty: 'hard',
      streak: 3,
      startedAt: 90_000,
      timeBonus: 0,
    });
    const points = roundPoints(state);
    expect(points).toBe(150);
  });
});

describe('roundWin', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
  });

  it('increments streak', () => {
    const state = makeState({ streak: 2 });
    expect(roundWin(state).streak).toBe(3);
  });

  it('adds points to sessionPoints', () => {
    const state = makeState({ sessionPoints: 50, startedAt: 90_000, difficulty: 'hard' });
    const next = roundWin(state);
    expect(next.sessionPoints).toBeGreaterThan(50);
  });

  it('adds timeBonus from difficulty config', () => {
    const state = makeState({ difficulty: 'insane', timeBonus: 0 });
    expect(roundWin(state).timeBonus).toBe(30);
  });

  it('sets new hiddenWord', () => {
    const state = makeState({ hiddenWord: 'HELLO' });
    const next = roundWin(state);
    expect(next.hiddenWord).toBeDefined();
    expect(next.hiddenWord).toHaveLength(5);
  });

  it('clears guesses and currentGuess', () => {
    const state = makeState({ guesses: ['AAAAA', 'BBBBB'], currentGuess: 'HEL' });
    const next = roundWin(state);
    expect(next.guesses).toEqual([]);
    expect(next.currentGuess).toBe('');
  });

  it('clears evaluations', () => {
    const state = makeState({ evaluations: [[{ letter: 'A', status: 'absent' }]] });
    expect(roundWin(state).evaluations).toEqual([]);
  });

  it('clears virtualKeyboardState', () => {
    const state = makeState({ virtualKeyboardState: { A: 'absent', B: 'correct' } });
    expect(roundWin(state).virtualKeyboardState).toEqual({});
  });

  it('stays playing', () => {
    expect(roundWin(makeState()).gameStatus).toBe('playing');
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
    expect(getRemainingTime(70_000, 60)).toBe(30);
  });

  it('returns full timeLimit when just started', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    expect(getRemainingTime(100_000, 60)).toBe(60);
  });

  it('clamps to 0 when elapsed exceeds timeLimit', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);
    expect(getRemainingTime(30_000, 60)).toBe(0);
  });

  it('floors partial seconds', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_500);
    expect(getRemainingTime(100_000, 60)).toBe(59);
  });
});

describe('buildScoreRecord', () => {
  it('maps GameState fields to ScoreRecord', () => {
    const state = makeState({ difficulty: 'hard', streak: 7, sessionPoints: 420 });
    const record = buildScoreRecord(state);
    expect(record.difficulty).toBe('hard');
    expect(record.maxStreak).toBe(7);
    expect(record.totalPoints).toBe(420);
  });

  it('sets id and date to current timestamp', () => {
    const before = Date.now();
    const record = buildScoreRecord(makeState());
    expect(record.id).toBeGreaterThanOrEqual(before);
    expect(record.date).toBeGreaterThanOrEqual(before);
  });
});

describe('isPersonalBest', () => {
  const records: ScoreRecord[] = [
    { id: 1, difficulty: 'hard', maxStreak: 3, totalPoints: 100, date: 1000 },
    { id: 2, difficulty: 'hard', maxStreak: 5, totalPoints: 200, date: 2000 },
    { id: 3, difficulty: 'relaxed', maxStreak: 2, totalPoints: 50, date: 1500 },
  ];

  it('returns true for empty records array', () => {
    const record: ScoreRecord = { id: 4, difficulty: 'hard', maxStreak: 1, totalPoints: 10, date: 3000 };
    expect(isPersonalBest([], record)).toBe(true);
  });

  it('returns true when totalPoints beats all same-difficulty records', () => {
    const record: ScoreRecord = { id: 4, difficulty: 'hard', maxStreak: 6, totalPoints: 300, date: 3000 };
    expect(isPersonalBest(records, record)).toBe(true);
  });

  it('returns false when totalPoints is lower', () => {
    const record: ScoreRecord = { id: 4, difficulty: 'hard', maxStreak: 2, totalPoints: 150, date: 3000 };
    expect(isPersonalBest(records, record)).toBe(false);
  });

  it('ignores records from other difficulties', () => {
    const record: ScoreRecord = { id: 4, difficulty: 'insane', maxStreak: 1, totalPoints: 30, date: 3000 };
    expect(isPersonalBest(records, record)).toBe(true);
  });
});
