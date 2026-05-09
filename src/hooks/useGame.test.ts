import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  statusPriority,
  mergeKeyboardState,
  reducer,
} from './useGame';
import type { GameState, LetterResult, LetterStatus, Difficulty } from '../types';

describe('statusPriority', () => {
  it('returns 3 for correct', () => {
    expect(statusPriority('correct')).toBe(3);
  });

  it('returns 2 for present', () => {
    expect(statusPriority('present')).toBe(2);
  });

  it('returns 1 for absent', () => {
    expect(statusPriority('absent')).toBe(1);
  });

  it('returns 0 for default', () => {
    expect(statusPriority('default')).toBe(0);
  });
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
    const evaluation: LetterResult[] = [{ letter: 'A', status: 'present' }];
    const result = mergeKeyboardState(current, evaluation);
    expect(result['A']).toBe('present');
  });

  it('upgrades present to correct', () => {
    const current: Record<string, LetterStatus> = { A: 'present' };
    const evaluation: LetterResult[] = [{ letter: 'A', status: 'correct' }];
    const result = mergeKeyboardState(current, evaluation);
    expect(result['A']).toBe('correct');
  });

  it('does not downgrade correct to present', () => {
    const current: Record<string, LetterStatus> = { A: 'correct' };
    const evaluation: LetterResult[] = [{ letter: 'A', status: 'present' }];
    const result = mergeKeyboardState(current, evaluation);
    expect(result['A']).toBe('correct');
  });

  it('does not downgrade present to absent', () => {
    const current: Record<string, LetterStatus> = { A: 'present' };
    const evaluation: LetterResult[] = [{ letter: 'A', status: 'absent' }];
    const result = mergeKeyboardState(current, evaluation);
    expect(result['A']).toBe('present');
  });

  it('does not downgrade correct to absent', () => {
    const current: Record<string, LetterStatus> = { A: 'correct' };
    const evaluation: LetterResult[] = [{ letter: 'A', status: 'absent' }];
    const result = mergeKeyboardState(current, evaluation);
    expect(result['A']).toBe('correct');
  });

  it('merges multiple evaluations progressively', () => {
    let state: Record<string, LetterStatus> = {};
    const eval1: LetterResult[] = [{ letter: 'A', status: 'absent' }];
    const eval2: LetterResult[] = [{ letter: 'A', status: 'present' }];
    const eval3: LetterResult[] = [{ letter: 'A', status: 'correct' }];

    state = mergeKeyboardState(state, eval1);
    expect(state['A']).toBe('absent');

    state = mergeKeyboardState(state, eval2);
    expect(state['A']).toBe('present');

    state = mergeKeyboardState(state, eval3);
    expect(state['A']).toBe('correct');
  });
});

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  hiddenWord: 'HELLO',
  guesses: [],
  currentGuess: '',
  evaluations: [],
  gameStatus: 'playing',
  keyboardState: {},
  difficulty: 'hard' as Difficulty,
  startedAt: Date.now(),
  ...overrides,
});

describe('reducer', () => {
  describe('ADD_LETTER', () => {
    it('appends letter to currentGuess when playing', () => {
      const state = makeState({ currentGuess: 'HEL' });
      const next = reducer(state, { type: 'ADD_LETTER', letter: 'L' });
      expect(next.currentGuess).toBe('HELL');
    });

    it('caps currentGuess at 5 letters', () => {
      const state = makeState({ currentGuess: 'HELLO' });
      const next = reducer(state, { type: 'ADD_LETTER', letter: 'X' });
      expect(next.currentGuess).toBe('HELLO');
    });

    it('does nothing when game is won', () => {
      const state = makeState({ gameStatus: 'won', currentGuess: 'HE' });
      const next = reducer(state, { type: 'ADD_LETTER', letter: 'L' });
      expect(next.currentGuess).toBe('HE');
    });

    it('does nothing when game is lost', () => {
      const state = makeState({ gameStatus: 'lost', currentGuess: 'HE' });
      const next = reducer(state, { type: 'ADD_LETTER', letter: 'L' });
      expect(next.currentGuess).toBe('HE');
    });
  });

  describe('REMOVE_LETTER', () => {
    it('removes last letter when playing', () => {
      const state = makeState({ currentGuess: 'HELL' });
      const next = reducer(state, { type: 'REMOVE_LETTER' });
      expect(next.currentGuess).toBe('HEL');
    });

    it('does nothing when currentGuess is empty', () => {
      const state = makeState({ currentGuess: '' });
      const next = reducer(state, { type: 'REMOVE_LETTER' });
      expect(next.currentGuess).toBe('');
    });

    it('does nothing when game is won', () => {
      const state = makeState({ gameStatus: 'won', currentGuess: 'HE' });
      const next = reducer(state, { type: 'REMOVE_LETTER' });
      expect(next.currentGuess).toBe('HE');
    });

    it('does nothing when game is lost', () => {
      const state = makeState({ gameStatus: 'lost', currentGuess: 'HE' });
      const next = reducer(state, { type: 'REMOVE_LETTER' });
      expect(next.currentGuess).toBe('HE');
    });
  });

  describe('SUBMIT_GUESS', () => {
    it('evaluates guess adds to guesses and evaluations', () => {
      const state = makeState({ currentGuess: 'HELLP' });
      const next = reducer(state, { type: 'SUBMIT_GUESS' });
      expect(next.guesses).toEqual(['HELLP']);
      expect(next.evaluations).toHaveLength(1);
      expect(next.evaluations[0]).toHaveLength(5);
      expect(next.currentGuess).toBe('');
    });

    it('detects win condition', () => {
      const state = makeState({ hiddenWord: 'HELLO', currentGuess: 'HELLO' });
      const next = reducer(state, { type: 'SUBMIT_GUESS' });
      expect(next.gameStatus).toBe('won');
    });

    it('detects loss condition on 6th wrong guess', () => {
      const state = makeState({
        hiddenWord: 'HELLO',
        currentGuess: 'WORLD',
        guesses: ['AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE'],
        evaluations: [[], [], [], [], []],
      });
      const next = reducer(state, { type: 'SUBMIT_GUESS' });
      expect(next.gameStatus).toBe('lost');
    });

    it('clears currentGuess after submission', () => {
      const state = makeState({ currentGuess: 'HELLP' });
      const next = reducer(state, { type: 'SUBMIT_GUESS' });
      expect(next.currentGuess).toBe('');
    });

    it('updates keyboardState', () => {
      const state = makeState({ currentGuess: 'WORLD' });
      const next = reducer(state, { type: 'SUBMIT_GUESS' });
      expect(Object.keys(next.keyboardState).length).toBeGreaterThan(0);
    });
  });

  describe('FORFEIT', () => {
    it('sets gameStatus to lost', () => {
      const state = makeState({ gameStatus: 'playing' });
      const next = reducer(state, { type: 'FORFEIT' });
      expect(next.gameStatus).toBe('lost');
    });

    it('keeps all other state intact', () => {
      const state = makeState({
        hiddenWord: 'HELLO',
        guesses: ['WORLD', 'PLANE'],
        currentGuess: 'QU',
        evaluations: [[{ letter: 'W', status: 'absent' }], [{ letter: 'P', status: 'absent' }]],
        keyboardState: { W: 'absent', P: 'absent' },
      });
      const next = reducer(state, { type: 'FORFEIT' });
      expect(next.hiddenWord).toBe('HELLO');
      expect(next.guesses).toEqual(['WORLD', 'PLANE']);
      expect(next.currentGuess).toBe('QU');
      expect(next.evaluations).toEqual(state.evaluations);
      expect(next.keyboardState).toEqual({ W: 'absent', P: 'absent' });
    });
  });

  describe('START_GAME', () => {
    it('resets all state with given difficulty', () => {
      const state = makeState({
        guesses: ['AAAAA'],
        currentGuess: 'HEL',
        evaluations: [[{ letter: 'A', status: 'absent' }]],
        gameStatus: 'playing',
        keyboardState: { A: 'absent' },
      });
      const next = reducer(state, { type: 'START_GAME', difficulty: 'insane' });
      expect(next.guesses).toEqual([]);
      expect(next.currentGuess).toBe('');
      expect(next.evaluations).toEqual([]);
      expect(next.gameStatus).toBe('playing');
      expect(next.keyboardState).toEqual({});
      expect(next.difficulty).toBe('insane');
    });

    it('picks a new hidden word', () => {
      const state = makeState({ hiddenWord: 'HELLO' });
      const next = reducer(state, { type: 'START_GAME', difficulty: 'easy' });
      expect(typeof next.hiddenWord).toBe('string');
      expect(next.hiddenWord).toHaveLength(5);
    });

    it('sets startedAt to current time', () => {
      const before = Date.now();
      const state = makeState();
      const next = reducer(state, { type: 'START_GAME', difficulty: 'normal' });
      expect(next.startedAt).toBeGreaterThanOrEqual(before);
    });

    it('works with easy difficulty', () => {
      const state = makeState();
      const next = reducer(state, { type: 'START_GAME', difficulty: 'easy' });
      expect(next.difficulty).toBe('easy');
    });
  });

  describe('TIME_UP', () => {
    it('sets gameStatus to lost', () => {
      const state = makeState({ gameStatus: 'playing' });
      const next = reducer(state, { type: 'TIME_UP' });
      expect(next.gameStatus).toBe('lost');
    });

    it('keeps current state intact', () => {
      const state = makeState({
        guesses: ['WORLD'],
        currentGuess: 'QU',
      });
      const next = reducer(state, { type: 'TIME_UP' });
      expect(next.guesses).toEqual(['WORLD']);
      expect(next.currentGuess).toBe('QU');
    });

    it('does nothing if game is already over', () => {
      const state = makeState({ gameStatus: 'won' });
      const next = reducer(state, { type: 'TIME_UP' });
      expect(next.gameStatus).toBe('won');
    });
  });
});

describe('useGame hook', () => {
  const store = new Map<string, string>();

  const localStorageMock = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
    removeItem: vi.fn((key: string) => { store.delete(key); }),
  };

  beforeEach(() => {
    store.clear();
    vi.resetModules();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initial state is correct', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    expect(result.current.guesses).toEqual([]);
    expect(result.current.currentGuess).toBe('');
    expect(result.current.gameStatus).toBe('playing');
    expect(result.current.keyboardState).toEqual({});
    expect(result.current.hiddenWord).toHaveLength(5);
    expect(result.current.difficulty).toBe('hard');
    expect(typeof result.current.startedAt).toBe('number');
  });

  it('addLetter appends to currentGuess', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    act(() => result.current.addLetter('H'));
    act(() => result.current.addLetter('E'));
    expect(result.current.currentGuess).toBe('HE');
  });

  it('addLetter caps at 5 letters', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    act(() => result.current.addLetter('H'));
    act(() => result.current.addLetter('E'));
    act(() => result.current.addLetter('L'));
    act(() => result.current.addLetter('L'));
    act(() => result.current.addLetter('O'));
    act(() => result.current.addLetter('X'));
    expect(result.current.currentGuess).toBe('HELLO');
  });

  it('removeLetter removes last letter', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    act(() => result.current.addLetter('H'));
    act(() => result.current.addLetter('E'));
    act(() => result.current.removeLetter());
    expect(result.current.currentGuess).toBe('H');
  });

  it('submitGuess does nothing with fewer than 5 letters', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    act(() => result.current.addLetter('H'));
    act(() => result.current.addLetter('E'));
    act(() => result.current.submitGuess());
    expect(result.current.guesses).toEqual([]);
  });

  it('submitGuess handles invalid word with toast', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    act(() => result.current.addLetter('X'));
    act(() => result.current.addLetter('X'));
    act(() => result.current.addLetter('X'));
    act(() => result.current.addLetter('X'));
    act(() => result.current.addLetter('X'));
    act(() => result.current.submitGuess());
    expect(result.current.invalidWord).toBe(true);
    expect(result.current.gameStatus).toBe('playing');
  });

  it('startGame starts a new game with given difficulty', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('easy'));
    act(() => result.current.addLetter('H'));
    act(() => result.current.addLetter('E'));
    act(() => result.current.addLetter('L'));
    act(() => result.current.addLetter('L'));
    act(() => result.current.addLetter('O'));
    act(() => result.current.submitGuess());
    act(() => result.current.startGame('insane'));
    expect(result.current.guesses).toEqual([]);
    expect(result.current.currentGuess).toBe('');
    expect(result.current.gameStatus).toBe('playing');
    expect(result.current.invalidWord).toBe(false);
    expect(result.current.difficulty).toBe('insane');
  });

  it('forfeit sets gameStatus to lost', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    act(() => result.current.addLetter('H'));
    act(() => result.current.addLetter('E'));
    act(() => result.current.forfeit());
    expect(result.current.gameStatus).toBe('lost');
  });

  it('loads persisted state from localStorage', async () => {
    const savedState: GameState = {
      hiddenWord: 'HELLO',
      guesses: ['WORLD'],
      currentGuess: 'QU',
      evaluations: [[{ letter: 'W', status: 'absent' }]],
      gameStatus: 'playing',
      keyboardState: { W: 'absent' },
      difficulty: 'hard',
      startedAt: Date.now(),
    };
    localStorage.setItem('shmordle-game-state', JSON.stringify(savedState));

    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('easy'));
    expect(result.current.hiddenWord).toBe('HELLO');
    expect(result.current.guesses).toEqual(['WORLD']);
    expect(result.current.currentGuess).toBe('QU');
    expect(result.current.gameStatus).toBe('playing');
    expect(result.current.keyboardState).toEqual({ W: 'absent' });
    expect(result.current.difficulty).toBe('hard');
  });

  it('saves state to localStorage on change', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    act(() => result.current.addLetter('H'));
    act(() => result.current.addLetter('E'));

    const saved = localStorage.getItem('shmordle-game-state');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.currentGuess).toBe('HE');
  });

  it('saves lost state to localStorage on forfeit', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('hard'));
    act(() => result.current.forfeit());
    const saved = localStorage.getItem('shmordle-game-state');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.gameStatus).toBe('lost');
  });

  it('exposes difficulty and startedAt', async () => {
    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('normal'));
    expect(result.current.difficulty).toBe('normal');
    expect(typeof result.current.startedAt).toBe('number');
  });
});
