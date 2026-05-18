/**
 * Main game hook.
 *
 * Bridges domain game logic to React state via a reducer-like pattern.
 * Persists game state to localStorage on every change, manages UI-side
 * effects (animations, streak toasts, new-best detection), and exposes
 * action callbacks for the game view.
 *
 * @packageDocumentation
 */

import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Difficulty } from '../domain/types';
import { isValidWord } from '../domain/dictionary';
import { loadGameState, saveGameState } from '../storage/gameState';
import { loadScores, saveScore } from '../storage/score';
import { createGame, addLetter, removeLetter, submitGuess, forfeit, roundWin, roundPoints, buildScoreRecord, isPersonalBest } from '../domain/game';

// Duration of the tile-flip reveal animation (5 tiles × 300ms stagger + 300ms animation).
const REVEAL_ANIMATION_MS = 1600;

/**
 * Identity reducer — always returns the next state as-is.
 *
 * We use useReducer not for complex state transitions but to get a
 * stable setState function that accepts a state-producing function.
 * This avoids stale-closure issues that useState's setter has when
 * the state depends on the previous value.
 */
function passThrough(_prev: GameState, next: GameState): GameState {
  return next;
}

export function useGame(difficulty: Difficulty) {
  // Load saved game from localStorage, or create a new one.
  const [state, setState] = useReducer(passThrough, null, () =>
    loadGameState() ?? createGame(difficulty)
  );

  // UI state: whether the last submitted word was invalid.
  const [invalidWord, setInvalidWord] = useState(false);
  // UI state: whether the tile-flip animation is currently running.
  const [animating, setAnimating] = useState(false);
  // UI state: streak toast data (shown after each correct guess in timed mode).
  const [streakToast, setStreakToast] = useState<{ points: number; streak: number } | null>(null);
  // UI state: whether the current game's score is a new personal best.
  const [isNewBest, setIsNewBest] = useState(false);
  // Ref to track which game ID has already had its score finalized.
  // Prevents duplicate score saves when the state changes after game over.
  const finalizedRef = useRef<string | null>(null);

  // Persist the game state to localStorage on every change.
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // When the game ends (lost), save the score and check for a new personal best.
  // The finalizedRef ensures we only save once per game, even if state changes
  // trigger this effect multiple times after game over.
  useEffect(() => {
    if (finalizedRef.current === state.gameId) return;
    if (state.gameStatus !== 'lost' || state.difficulty === 'zen') return;

    const records = loadScores().records;
    const record = buildScoreRecord(state);
    const result = isPersonalBest(records, state.difficulty, state.sessionPoints);
    saveScore(record);

    finalizedRef.current = state.gameId;
    setIsNewBest(result);
  }, [state]);

  // Input is disabled when the game is not playing or during the tile-flip animation.
  const inputDisabled = state.gameStatus !== 'playing' || animating;

  /** Handles a single letter input from the virtual or physical keyboard. */
  const handleAddLetter = useCallback(
    (letter: string) => {
      if (inputDisabled) return;
      setState(addLetter(state, letter));
    },
    [inputDisabled, state]
  );

  /** Handles backspace input from the virtual or physical keyboard. */
  const handleRemoveLetter = useCallback(() => {
    if (inputDisabled) return;
    setState(removeLetter(state));
  }, [inputDisabled, state]);

  /**
   * Handles Enter / guess submission.
   *
   * Validates the word length and dictionary membership. On a correct
   * guess in a timed mode, awards points and starts a new round. Otherwise,
   * submits the guess and triggers the tile-flip animation.
   */
  const handleSubmitGuess = useCallback(() => {
    if (inputDisabled) return;
    if (state.currentGuess.length !== 5) return;

    // Reject words not in the dictionary.
    if (!isValidWord(state.currentGuess)) {
      setInvalidWord(true);
      setTimeout(() => setInvalidWord(false), 2000);
      return;
    }

    const isWin = state.currentGuess === state.hiddenWord;
    const isNonZen = state.difficulty !== 'zen';

    // Correct guess in a timed mode: award points and start a new round.
    if (isWin && isNonZen) {
      const points = roundPoints(state);
      setState(roundWin(state));
      setStreakToast({ points, streak: state.streak + 1 });
      return;
    }

    // Normal guess submission (wrong word, or Zen mode where scoring is disabled).
    setState(submitGuess(state));
    setAnimating(true);
    setTimeout(() => setAnimating(false), REVEAL_ANIMATION_MS);
  }, [inputDisabled, state]);

  /** Dismisses the streak toast notification. */
  const handleDismissStreakToast = useCallback(() => {
    setStreakToast(null);
  }, []);

  /** Forfeits the current round, ending the game as a loss. */
  const handleForfeit = useCallback(() => {
    setState(forfeit(state));
  }, [state]);

  return {
    ...state,
    invalidWord,
    animating,
    inputDisabled,
    streakToast,
    isNewBest,
    addLetter: handleAddLetter,
    removeLetter: handleRemoveLetter,
    submitGuess: handleSubmitGuess,
    forfeit: handleForfeit,
    dismissStreakToast: handleDismissStreakToast,
  };
}
