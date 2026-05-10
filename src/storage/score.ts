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

export function saveScore(record: ScoreRecord): void {
  const data = loadScores();
  const idx = data.records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    data.records[idx] = { ...record, date: data.records[idx].date };
  } else {
    data.records.push(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadScores(): ScoresData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
