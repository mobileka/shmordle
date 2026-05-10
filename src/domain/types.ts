/**
 * Core type definitions and difficulty configuration.
 *
 * Contains all shared types used across the application: letter statuses,
 * game state shape, difficulty levels, score records, and DTO schemas.
 *
 * @packageDocumentation
 */

// Feedback shown on a single tile after a guess is evaluated.
// 'default' — no evaluation yet (tile/key shows default styling).
// 'absent' — letter not in hidden word (grey tile, key becomes disabled).
// 'present' — letter is in hidden word but wrong position (orange).
// 'correct' — letter is in the right position (green).
export type LetterStatus = 'absent' | 'present' | 'correct' | 'default';

// One tile result produced by evaluateGuess.
export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

// High-level state of the current game run.
export type GameStatus = 'playing' | 'won' | 'lost';

// Play modes. Zen is pressure-free (no timer, no streaks, no scores).
// Relaxed, Hard, and Insane have time limits, streaks, and scoring.
export type Difficulty = 'zen' | 'relaxed' | 'hard' | 'insane';

// Ordered list of difficulties shown in the picker (least to most stressful).
export const DIFFICULTY: Difficulty[] = ['zen', 'relaxed', 'hard', 'insane'];

// Per-difficulty display label and base time limit (seconds). null = no timer.
export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; timeLimit: number | null }> = {
  zen: { label: 'Zen 🧘', timeLimit: null },
  relaxed: { label: 'Relaxed', timeLimit: 180 },
  hard: { label: 'Hard', timeLimit: 60 },
  insane: { label: 'Insane', timeLimit: 30 },
};

// One entry in the high score history, persisted to localStorage under 'shmordle-scores'.
export interface ScoreRecord {
  id: string;
  difficulty: Difficulty;
  maxStreak: number;
  totalPoints: number;
  date: number;
}

// Wrapper around the scores array so localStorage has a stable shape.
export interface ScoresData {
  records: ScoreRecord[];
}

// Full game state serialised to localStorage under 'shmordle-game-state'.
// Restored on page load so the player can continue (or resume a lost game).
export interface GameState {
  gameId: string;
  hiddenWord: string;
  guesses: string[];
  currentGuess: string;
  evaluations: LetterResult[][];
  gameStatus: GameStatus;
  virtualKeyboardState: Record<string, LetterStatus>;
  difficulty: Difficulty;
  startedAt: number;
  streak: number;
  sessionPoints: number;
  timeBonus: number;
}
