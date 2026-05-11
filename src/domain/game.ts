/**
 * Game state machine and scoring logic.
 *
 * Pure functions that implement the core game rules: creating games,
 * adding/removing letters, submitting guesses, forfeiting, streak-based
 * round scoring, and building score records.
 *
 * Scoring formula:
 *   points = streak × remainingTime
 *
 * On a correct guess in a timed mode, the player earns points based on
 * their current streak multiplied by the seconds left on the clock. The
 * streak increments for the next round, and a full time limit is added
 * as a bonus to the clock.
 *
 * @packageDocumentation
 */

import type { GameState, GameStatus, LetterResult, LetterStatus, Difficulty, ScoreRecord } from './types';
import { DIFFICULTY_CONFIG } from './types';
import { evaluateGuess } from './evaluation';
import { getRandomWord } from './dictionary';
import { loadScores, saveScore } from '../storage/score';

// Maximum number of guesses allowed per round (Wordle standard).
const MAX_GUESSES = 6;

/**
 * Creates a fresh game state for the given difficulty.
 *
 * @param difficulty - The chosen difficulty level.
 * @returns A new GameState with a random hidden word and default values.
 */
export function createGame(difficulty: Difficulty): GameState {
  return {
    gameId: crypto.randomUUID(),
    hiddenWord: getRandomWord(),
    guesses: [],
    currentGuess: '',
    evaluations: [],
    gameStatus: 'playing',
    virtualKeyboardState: {},
    difficulty,
    startedAt: Date.now(),
    streak: 1,
    sessionPoints: 0,
    timeBonus: 0,
  };
}

/**
 * Appends a letter to the current guess.
 *
 * @param state - The current game state.
 * @param letter - A single uppercase letter (A–Z).
 * @returns A new state with the letter appended, or the original state
 *          if the game is not playing or the guess is already 5 letters.
 */
export function addLetter(state: GameState, letter: string): GameState {
  if (state.gameStatus !== 'playing') return state;
  if (state.currentGuess.length >= 5) return state;
  return { ...state, currentGuess: state.currentGuess + letter };
}

/**
 * Removes the last letter from the current guess.
 *
 * @param state - The current game state.
 * @returns A new state with the last letter removed, or the original
 *          state if the game is not playing or the guess is empty.
 */
export function removeLetter(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state;
  if (state.currentGuess.length === 0) return state;
  return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
}

/**
 * Submits the current guess for evaluation.
 *
 * Evaluates the guess against the hidden word, updates the keyboard state,
 * and determines if the game is won, lost, or still in progress.
 *
 * @param state - The current game state (must have a 5-letter currentGuess).
 * @returns A new state with the guess recorded and game status updated.
 */
export function submitGuess(state: GameState): GameState {
  const word = state.currentGuess;
  const evaluation = evaluateGuess(word, state.hiddenWord);
  const newGuesses = [...state.guesses, word];
  const newEvaluations = [...state.evaluations, evaluation];
  const merged = mergeKeyboardState(state.virtualKeyboardState, evaluation);

  const isWin = word === state.hiddenWord;
  const isLoss = !isWin && newGuesses.length >= MAX_GUESSES;
  const gameStatus: GameStatus = isWin ? 'won' : isLoss ? 'lost' : 'playing';

  return {
    ...state,
    guesses: newGuesses,
    currentGuess: '',
    evaluations: newEvaluations,
    virtualKeyboardState: merged,
    gameStatus,
  };
}

/**
 * Forfeits the current round, marking it as lost.
 *
 * @param state - The current game state.
 * @returns A new state with gameStatus set to 'lost', or the original
 *          state if the game is already over.
 */
export function forfeit(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state;
  return { ...state, gameStatus: 'lost' };
}

/**
 * Calculates the points the player would earn for the current round.
 *
 * Points = streak × remainingTime.
 *
 * @param state - The current game state.
 * @returns The number of points for this round.
 */
export function roundPoints(state: GameState): number {
  const timeLimit = DIFFICULTY_CONFIG[state.difficulty].timeLimit ?? 0;
  const remainingTime = getRemainingTime(state.startedAt, timeLimit + state.timeBonus);
  return calculatePoints(state.streak, remainingTime);
}

/**
 * Handles a correct guess in a timed mode.
 *
 * Awards points, increments the streak, resets the board for a new word,
 * and adds a full time-limit bonus to the clock.
 *
 * @param state - The current game state (on a correct guess).
 * @returns A new state ready for the next round.
 */
export function roundWin(state: GameState): GameState {
  const timeLimit = DIFFICULTY_CONFIG[state.difficulty].timeLimit ?? 0;
  const points = roundPoints(state);
  return {
    ...state,
    hiddenWord: getRandomWord(),
    guesses: [],
    currentGuess: '',
    evaluations: [],
    virtualKeyboardState: {},
    gameStatus: 'playing',
    streak: state.streak + 1,
    sessionPoints: state.sessionPoints + points,
    timeBonus: state.timeBonus + timeLimit,
  };
}

/**
 * Returns a numeric priority for a letter status.
 *
 * Used when merging keyboard state: a new evaluation should only
 * upgrade a key's color, never downgrade it. The priority order is:
 *   correct (3) > present (2) > absent (1) > default (0).
 *
 * For example, if a key is already green ('correct'), a later guess
 * that marks the same letter as 'absent' should not turn it grey.
 *
 * @param status - The letter status to rank.
 * @returns A numeric priority (0–3).
 */
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

/**
 * Merges a new evaluation into the existing keyboard state.
 *
 * Each letter's status is upgraded only if the new status has a higher
 * priority (see statusPriority). This ensures that once a key turns
 * green, it never reverts to orange or grey.
 *
 * @param current - The current keyboard state (letter → status map).
 * @param evaluation - The latest guess evaluation.
 * @returns A new keyboard state with upgraded statuses.
 */
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

/**
 * Calculates points from streak and remaining time.
 *
 * @param streak - The current consecutive-correct-guess streak.
 * @param remainingTime - Seconds remaining on the clock.
 * @returns The product of streak and remainingTime.
 */
export function calculatePoints(streak: number, remainingTime: number): number {
  return streak * remainingTime;
}

/**
 * Computes the remaining time for a game.
 *
 * @param startedAt - The game start timestamp (ms since epoch).
 * @param timeLimit - The total time limit in seconds.
 * @returns The number of whole seconds remaining, or 0 if expired.
 */
export function getRemainingTime(startedAt: number, timeLimit: number): number {
  const elapsed = (Date.now() - startedAt) / 1000;
  return Math.max(0, Math.floor(timeLimit - elapsed));
}

/**
 * Builds a ScoreRecord from the final game state.
 *
 * @param state - The completed game state.
 * @returns A ScoreRecord suitable for persistence.
 */
export function buildScoreRecord(state: GameState): ScoreRecord {
  return {
    id: state.gameId,
    difficulty: state.difficulty,
    maxStreak: state.streak,
    totalPoints: state.sessionPoints,
    date: Date.now(),
  };
}

/**
 * Checks if the given score is a new personal best for the difficulty.
 *
 * @param records - All existing score records.
 * @param difficulty - The difficulty to check against.
 * @param totalPoints - The score to compare.
 * @returns True if totalPoints exceeds the best existing score for that difficulty.
 */
export function isPersonalBest(records: ScoreRecord[], difficulty: Difficulty, totalPoints: number): boolean {
  const bestForDiff = records
    .filter((r) => r.difficulty === difficulty)
    .reduce((max, r) => Math.max(max, r.totalPoints), 0);
  return totalPoints > bestForDiff;
}

/**
 * Finalizes scoring at game end: saves the score record and checks
 * if it is a new personal best.
 *
 * Only applies to 'lost' games in timed modes (not Zen, not won games).
 * Won games do not save scores because the player keeps playing rounds.
 *
 * @param state - The completed game state.
 * @returns True if this is a new personal best, false if not,
 *          or null if the game does not qualify for scoring.
 */
export function finalizeGameScore(state: GameState): boolean | null {
  if (state.gameStatus !== 'lost' || state.difficulty === 'zen') return null;
  const records = loadScores().records;
  const record = buildScoreRecord(state);
  const isNewBest = isPersonalBest(records, state.difficulty, state.sessionPoints);
  saveScore(record);
  return isNewBest;
}
