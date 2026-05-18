import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { GameState } from '../domain/types';

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
    expect(result.current.virtualKeyboardState).toEqual({});
    expect(result.current.hiddenWord).toHaveLength(5);
    expect(result.current.difficulty).toBe('hard');
    expect(typeof result.current.startedAt).toBe('number');
    expect(result.current.streak).toBe(1);
    expect(result.current.sessionPoints).toBe(0);
    expect(result.current.timeBonus).toBe(0);
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
      gameId: 'saved-game-id',
      hiddenWord: 'HELLO',
      guesses: ['WORLD'],
      currentGuess: 'QU',
      evaluations: [[
        { letter: 'W', status: 'absent' },
        { letter: 'O', status: 'absent' },
        { letter: 'R', status: 'absent' },
        { letter: 'L', status: 'absent' },
        { letter: 'D', status: 'absent' },
      ]],
      gameStatus: 'playing',
      virtualKeyboardState: { W: 'absent' },
      difficulty: 'hard',
      startedAt: Date.now(),
      streak: 3,
      sessionPoints: 120,
      timeBonus: 60,
    };
    localStorage.setItem('shmordle-game-state', JSON.stringify(savedState));

    const { useGame } = await import('./useGame');
    const { result } = renderHook(() => useGame('zen'));
    expect(result.current.hiddenWord).toBe('HELLO');
    expect(result.current.guesses).toEqual(['WORLD']);
    expect(result.current.currentGuess).toBe('QU');
    expect(result.current.gameStatus).toBe('playing');
    expect(result.current.virtualKeyboardState).toEqual({ W: 'absent' });
    expect(result.current.difficulty).toBe('hard');
    expect(result.current.streak).toBe(3);
    expect(result.current.sessionPoints).toBe(120);
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
    const { result } = renderHook(() => useGame('relaxed'));
    expect(result.current.difficulty).toBe('relaxed');
    expect(typeof result.current.startedAt).toBe('number');
  });
});
