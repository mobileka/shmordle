import { useReducer, useState, useCallback, useEffect } from 'react';
import type { GameState, GameStatus, LetterResult, LetterStatus, Difficulty } from '../types';
import { evaluateGuess } from '../utils/evaluation';
import { isValidWord, getRandomWord } from '../utils/dictionary';
import { loadGameState, saveGameState, clearGameState } from '../utils/storage';

const INITIAL_GUESSES = 6;

type Action =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'START_GAME'; difficulty: Difficulty }
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

    dispatch({ type: 'SUBMIT_GUESS' });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1600);
  }, [inputDisabled, state.currentGuess]);

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
    addLetter,
    removeLetter,
    submitGuess,
    startGame,
    forfeit,
  };
}
