/**
 * High scores page.
 *
 * Displays past game records in a paginated table with difficulty tabs
 * (Insane, Hard, Relaxed). Supports per-difficulty score reset with
 * a confirmation dialog.
 *
 * @packageDocumentation
 */

import { useState } from 'react';
import { loadScores, clearScores } from '../storage/score';
import { DIFFICULTY, DIFFICULTY_CONFIG } from '../domain/types';
import type { Difficulty } from '../domain/types';
import { ConfirmDialog } from './ConfirmDialog';
import styles from './HighScoresPage.module.css';

// Difficulties that support scoring (Zen is excluded — no scores).
const MODES = DIFFICULTY.filter((d) => d !== 'zen').reverse();

interface Props {
  onBack: () => void;
}

/**
 * Formats a Unix timestamp into a short human-readable date.
 *
 * @param ts - Milliseconds since epoch.
 * @returns A string like "Jan 15, 2024".
 */
function formatDate(ts: number): string {
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Renders the high scores page with per-difficulty tabs.
 *
 * Records are sorted by date (newest first). The header uses a three-part
 * flex layout (back button, title, empty spacer) for centering the title.
 */
export function HighScoresPage({ onBack }: Props) {
  const [mode, setMode] = useState<Difficulty>('insane');
  const [showReset, setShowReset] = useState(false);
  const [scores, setScores] = useState(() => loadScores());

  /** Reloads scores from localStorage into local state. */
  const reload = () => setScores(loadScores());

  // Filter records for the active difficulty, sorted newest first.
  const filteredRecords = scores.records
    .filter((r) => r.difficulty === mode)
    .sort((a, b) => b.date - a.date);

  /** Clears all scores for the current difficulty after confirmation. */
  const handleReset = () => {
    clearScores(mode);
    reload();
    setShowReset(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          Back
        </button>
        <h1 className={styles.title}>High Scores</h1>
        {/* Empty spacer to balance the flex layout and center the title. */}
        <div />
      </div>

      <div className={styles.tabs}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`${styles.tab} ${m === mode ? styles.active : ''}`}
            onClick={() => setMode(m)}
            data-mode={m}
          >
            {DIFFICULTY_CONFIG[m].shortLabel}
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <p className={styles.empty}>
          No scores yet. Play Relaxed, Hard, or Insane to record your score!
        </p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Streak</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.maxStreak}</td>
                  <td>{r.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className={styles.resetBtn} onClick={() => setShowReset(true)}>
            Reset Scores
          </button>
        </>
      )}

      <ConfirmDialog
        open={showReset}
        message={`Clear all ${DIFFICULTY_CONFIG[mode].shortLabel} scores?`}
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={handleReset}
        onCancel={() => setShowReset(false)}
      />
    </div>
  );
}
