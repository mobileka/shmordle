import { useState } from 'react';
import { loadScores, clearScores } from '../utils/storage';
import { DIFFICULTY_CONFIG } from '../types';
import type { Difficulty } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import styles from './HighScoresPage.module.css';

const MODES: Difficulty[] = ['insane', 'hard', 'relaxed'];

interface Props {
  onBack: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function HighScoresPage({ onBack }: Props) {
  const [mode, setMode] = useState<Difficulty>('insane');
  const [showReset, setShowReset] = useState(false);
  const [scores, setScores] = useState(() => loadScores());

  const reload = () => setScores(loadScores());

  const filteredRecords = scores.records
    .filter((r) => r.difficulty === mode)
    .sort((a, b) => b.date - a.date);

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
        <div />
      </div>

      <div className={styles.tabs}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`${styles.tab} ${m === mode ? styles.active : ''}`}
            onClick={() => setMode(m)}
          >
            {DIFFICULTY_CONFIG[m].label.replace('🧘 ', '')}
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
        message={`Clear all ${DIFFICULTY_CONFIG[mode].label.replace('🧘 ', '')} scores?`}
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={handleReset}
        onCancel={() => setShowReset(false)}
      />
    </div>
  );
}
