import { useReducer, useState, useCallback, useEffect } from 'react';
import type { GameState, GameStatus, LetterResult, LetterStatus, Difficulty } from '../domain/types';
import { DIFFICULTY_CONFIG } from '../domain/types';
import { evaluateGuess } from '../domain/evaluation';
import { isValidWord, getRandomWord } from '../domain/dictionary';
import { loadGameState, saveGameState, clearGameState } from '../infrastructure/storage';

const INITIAL_GUESSES = 6;

type Action =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'START_GAME'; difficulty: Difficulty }
  | { type: 'ROUND_WIN'; points: number; newWord: string }
  | { type: 'TIME_UP' }
  | { type: 'FORFEIT' };

function createInitialState(difficulty: Difficulty): GameState {
  return {
    hiddenWord: getRandomWord(),
    guesses: [],
    currentGuess: '',
    evaluations: [],
    gameStatus: 'playing',
    keyboardState: {},
    difficulty,
    startedAt: Date.now(),
    streak: 1,
    sessionPoints: 0,
    timeBonus: 0,
  };
}

export function statusPriority(status: LetterStatus): number {
  switch (status) {
    case 'correct':
      return 3;
    case 'present':
      return 2;
    case 'absent':
      return 1;
    default:
      return 0;
  }
}

export function mergeKeyboardState(
  current: Record<string, LetterStatus>,
  evaluation: LetterResult[]
): Record<string, LetterStatus> {
  const next = { ...current };
  for (const { letter, status } of evaluation) {
    const currentPrio = statusPriority(next[letter] || 'default');
    const newPrio = statusPriority(status);
    if (newPrio > currentPrio) {
      next[letter] = status;
    }
  }
  return next;
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_LETTER': {
      if (state.gameStatus !== 'playing') return state;
      if (state.currentGuess.length >= 5) return state;
      return { ...state, currentGuess: state.currentGuess + action.letter };
    }

    case 'REMOVE_LETTER': {
      if (state.gameStatus !== 'playing') return state;
      if (state.currentGuess.length === 0) return state;
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
    }

    case 'SUBMIT_GUESS': {
      const word = state.currentGuess;
      const evaluation = evaluateGuess(word, state.hiddenWord);
      const newGuesses = [...state.guesses, word];
      const newEvaluations = [...state.evaluations, evaluation];
      const newKeyboardState = mergeKeyboardState(state.keyboardState, evaluation);

      const isWin = word === state.hiddenWord;
      const isLoss = !isWin && newGuesses.length >= INITIAL_GUESSES;
      const gameStatus: GameStatus = isWin ? 'won' : isLoss ? 'lost' : 'playing';

      return {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        evaluations: newEvaluations,
        keyboardState: newKeyboardState,
        gameStatus,
      };
    }

    case 'FORFEIT':
      return { ...state, gameStatus: 'lost' };

    case 'TIME_UP':
      if (state.gameStatus !== 'playing') return state;
      return { ...state, gameStatus: 'lost' };

    case 'START_GAME':
      return createInitialState(action.difficulty);

    case 'ROUND_WIN': {
      const timeLimit = DIFFICULTY_CONFIG[state.difficulty].timeLimit ?? 0;
      return {
        ...state,
        hiddenWord: action.newWord,
        guesses: [],
        currentGuess: '',
        evaluations: [],
        keyboardState: {},
        gameStatus: 'playing',
        streak: state.streak + 1,
        sessionPoints: state.sessionPoints + action.points,
        timeBonus: state.timeBonus + timeLimit,
      };
    }

    default:
      return state;
  }
}

export function useGame(difficulty: Difficulty) {
  const [state, dispatch] = useReducer(reducer, null, () =>
    loadGameState() ?? createInitialState(difficulty)
  );
  const [invalidWord, setInvalidWord] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [streakToast, setStreakToast] = useState<{ points: number; streak: number } | null>(null);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const inputDisabled = state.gameStatus !== 'playing' || animating;

  const addLetter = useCallback(
    (letter: string) => {
      if (inputDisabled) return;
      dispatch({ type: 'ADD_LETTER', letter });
    },
    [inputDisabled]
  );

  const removeLetter = useCallback(() => {
    if (inputDisabled) return;
    dispatch({ type: 'REMOVE_LETTER' });
  }, [inputDisabled]);

  const submitGuess = useCallback(() => {
    if (inputDisabled) return;
    if (state.currentGuess.length !== 5) return;

    if (!isValidWord(state.currentGuess)) {
      setInvalidWord(true);
      setTimeout(() => setInvalidWord(false), 2000);
      return;
    }

    const isWin = state.currentGuess === state.hiddenWord;
    const isNonZen = state.difficulty !== 'zen';

    if (isWin && isNonZen) {
      const timeLimit = DIFFICULTY_CONFIG[state.difficulty].timeLimit!;
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      const remaining = Math.max(0, timeLimit + state.timeBonus - elapsed);
      const points = remaining * state.streak;
      const newWord = getRandomWord();
      dispatch({ type: 'ROUND_WIN', points, newWord });
      setStreakToast({ points, streak: state.streak + 1 });
      return;
    }

    dispatch({ type: 'SUBMIT_GUESS' });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1600);
  }, [inputDisabled, state.currentGuess, state.hiddenWord, state.difficulty, state.startedAt, state.timeBonus, state.streak]);

  const dismissStreakToast = useCallback(() => {
    setStreakToast(null);
  }, []);

  const startGame = useCallback((diff: Difficulty) => {
    clearGameState();
    dispatch({ type: 'START_GAME', difficulty: diff });
    setInvalidWord(false);
    setAnimating(false);
  }, []);

  const forfeit = useCallback(() => {
    dispatch({ type: 'FORFEIT' });
  }, []);

  return {
    ...state,
    invalidWord,
    animating,
    inputDisabled,
    streakToast,
    addLetter,
    removeLetter,
    submitGuess,
    startGame,
    forfeit,
    dismissStreakToast,
  };
}
