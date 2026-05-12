/**
 * Score records persistence layer.
 *
 * CRUD operations for high scores stored in localStorage. Supports
 * deduplication by game ID and per-difficulty clearing.
 *
 * @packageDocumentation
 */

import type { ScoreRecord, ScoresData, Difficulty } from '../domain/types';

const STORAGE_KEY = 'shmordle-scores';

/**
 * Saves or updates a score record.
 *
 * If a record with the same game ID already exists, it is updated in place
 * (deduplication). This prevents duplicate entries when the same game is
 * saved multiple times (e.g., due to re-renders after game over).
 *
 * @param record - The ScoreRecord to save.
 */
export function saveScore(record: ScoreRecord): void {
  const data = loadScores();
  const idx = data.records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    // Update existing record but preserve the original date.
    data.records[idx] = { ...record, date: data.records[idx].date };
  } else {
    data.records.push(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Loads all score records from localStorage.
 *
 * Returns an empty ScoresData if no records exist or if the data is corrupt.
 *
 * @returns ScoresData with the records array.
 */
export function loadScores(): ScoresData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { records: [] };

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.records)) return { records: [] };

    return parsed;
  } catch {
    // JSON parse error — return empty records.
    return { records: [] };
  }
}

/**
 * Removes all score records for a specific difficulty.
 *
 * @param difficulty - The difficulty whose scores should be cleared.
 */
export function clearScores(difficulty: Difficulty): void {
  const data = loadScores();
  data.records = data.records.filter((r) => r.difficulty !== difficulty);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
