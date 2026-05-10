import type { GameState, GameStatus, LetterResult, LetterStatus, Difficulty, ScoreRecord } from './types';
import { DIFFICULTY_CONFIG } from './types';
import { evaluateGuess } from './evaluation';
import { getRandomWord } from './dictionary';

const MAX_GUESSES = 6;

export function createGame(difficulty: Difficulty): GameState {
  return {
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

export function addLetter(state: GameState, letter: string): GameState {
  if (state.gameStatus !== 'playing') return state;
  if (state.currentGuess.length >= 5) return state;
  return { ...state, currentGuess: state.currentGuess + letter };
}

export function removeLetter(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state;
  if (state.currentGuess.length === 0) return state;
  return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
}

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

export function forfeit(state: GameState): GameState {
  return { ...state, gameStatus: 'lost' };
}

export function roundPoints(state: GameState): number {
  const timeLimit = DIFFICULTY_CONFIG[state.difficulty].timeLimit ?? 0;
  const remainingTime = getRemainingTime(state.startedAt, timeLimit + state.timeBonus);
  return calculatePoints(state.streak, remainingTime);
}

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

export function calculatePoints(streak: number, remainingTime: number): number {
  return streak * remainingTime;
}

export function getRemainingTime(startedAt: number, timeLimit: number): number {
  const elapsed = (Date.now() - startedAt) / 1000;
  return Math.max(0, Math.floor(timeLimit - elapsed));
}

export function buildScoreRecord(state: GameState): ScoreRecord {
  return {
    id: Date.now(),
    difficulty: state.difficulty,
    maxStreak: state.streak,
    totalPoints: state.sessionPoints,
    date: Date.now(),
  };
}

export function isPersonalBest(records: ScoreRecord[], record: ScoreRecord): boolean {
  const bestForDiff = records
    .filter((r) => r.difficulty === record.difficulty)
    .reduce((max, r) => Math.max(max, r.totalPoints), 0);
  return record.totalPoints > bestForDiff;
}
