import type { GameState, GameStatus, Difficulty, ScoreRecord, ScoresData } from '../types';

const STORAGE_KEY = 'shmordle-game-state';
const PREFERRED_KEY = 'shmordle-preferred-difficulty';
const SCORES_KEY = 'shmordle-scores';

const VALID_STATUSES: GameStatus[] = ['playing', 'won', 'lost'];
const VALID_DIFFICULTIES: Difficulty[] = ['zen', 'relaxed', 'hard', 'insane'];

function isValidGameState(data: unknown): data is GameState {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  if (typeof obj.hiddenWord !== 'string' || obj.hiddenWord.length !== 5) return false;
  if (!Array.isArray(obj.guesses)) return false;
  if (typeof obj.currentGuess !== 'string') return false;
  if (!Array.isArray(obj.evaluations)) return false;
  if (!VALID_STATUSES.includes(obj.gameStatus as GameStatus)) return false;
  if (typeof obj.keyboardState !== 'object' || obj.keyboardState === null) return false;
  if (!VALID_DIFFICULTIES.includes(obj.difficulty as Difficulty)) return false;
  if (typeof obj.startedAt !== 'number' || obj.startedAt <= 0) return false;
  if (typeof obj.streak !== 'number') return false;
  if (typeof obj.sessionPoints !== 'number') return false;
  if (typeof obj.timeBonus !== 'number') return false;

  return true;
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidGameState(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function savePreferredDifficulty(difficulty: Difficulty): void {
  localStorage.setItem(PREFERRED_KEY, difficulty);
}

export function loadPreferredDifficulty(): Difficulty | null {
  const raw = localStorage.getItem(PREFERRED_KEY);
  if (!raw) return null;
  if (!VALID_DIFFICULTIES.includes(raw as Difficulty)) return null;
  return raw as Difficulty;
}

export function saveScore(record: ScoreRecord): void {
  const data = loadScores();
  data.records.push(record);
  localStorage.setItem(SCORES_KEY, JSON.stringify(data));
}

export function loadScores(): ScoresData {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return { records: [] };

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.records)) return { records: [] };

    return parsed;
  } catch {
    return { records: [] };
  }
}

export function clearScores(difficulty: Difficulty): void {
  const data = loadScores();
  data.records = data.records.filter((r) => r.difficulty !== difficulty);
  localStorage.setItem(SCORES_KEY, JSON.stringify(data));
}
