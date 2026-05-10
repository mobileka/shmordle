import { useReducer, useState, useCallback, useEffect } from 'react';
import type { GameState, Difficulty } from '../domain/types';
import { isValidWord } from '../domain/dictionary';
import { loadGameState, saveGameState, clearGameState } from '../infrastructure/storage';
import { createGame, addLetter, removeLetter, submitGuess, forfeit, roundWin, roundPoints } from '../domain/game';

function passThrough(_prev: GameState, next: GameState): GameState {
  return next;
}

export function useGame(difficulty: Difficulty) {
  const [state, setState] = useReducer(passThrough, null, () =>
    loadGameState() ?? createGame(difficulty)
  );
  const [invalidWord, setInvalidWord] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [streakToast, setStreakToast] = useState<{ points: number; streak: number } | null>(null);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const inputDisabled = state.gameStatus !== 'playing' || animating;

  const handleAddLetter = useCallback(
    (letter: string) => {
      if (inputDisabled) return;
      setState(addLetter(state, letter));
    },
    [inputDisabled, state]
  );

  const handleRemoveLetter = useCallback(() => {
    if (inputDisabled) return;
    setState(removeLetter(state));
  }, [inputDisabled, state]);

  const handleSubmitGuess = useCallback(() => {
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
      const points = roundPoints(state);
      setState(roundWin(state));
      setStreakToast({ points, streak: state.streak + 1 });
      return;
    }

    setState(submitGuess(state));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1600);
  }, [inputDisabled, state]);

  const handleDismissStreakToast = useCallback(() => {
    setStreakToast(null);
  }, []);

  const handleStartGame = useCallback((diff: Difficulty) => {
    clearGameState();
    setState(createGame(diff));
    setInvalidWord(false);
    setAnimating(false);
  }, []);

  const handleForfeit = useCallback(() => {
    setState(forfeit(state));
  }, [state]);

  return {
    ...state,
    invalidWord,
    animating,
    inputDisabled,
    streakToast,
    addLetter: handleAddLetter,
    removeLetter: handleRemoveLetter,
    submitGuess: handleSubmitGuess,
    startGame: handleStartGame,
    forfeit: handleForfeit,
    dismissStreakToast: handleDismissStreakToast,
  };
}
