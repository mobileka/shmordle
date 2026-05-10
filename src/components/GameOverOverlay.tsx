import { DIFFICULTY_CONFIG } from '../domain/types';
import type { Difficulty } from '../domain/types';
import styles from './GameOverOverlay.module.css';

interface Props {
  status: 'won' | 'lost';
  hiddenWord: string;
  onPlayAgain: () => void;
  score?: number;
  streak?: number;
  isNewBest?: boolean;
  onViewScores?: () => void;
  difficulty?: Difficulty;
}

export function GameOverOverlay({
  status,
  hiddenWord,
  onPlayAgain,
  score,
  streak,
  isNewBest,
  onViewScores,
  difficulty,
}: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          {status === 'won' ? 'You won!' : 'Game Over'}
        </h2>

        {score !== undefined && streak !== undefined && (
          <p className={styles.scoreInfo}>
            Scored {score} points · Streak {streak}
          </p>
        )}

        {isNewBest && difficulty && (
          <p className={styles.bestInfo}>
            New personal best for {DIFFICULTY_CONFIG[difficulty].label.replace('🧘 ', '')}!
          </p>
        )}

        <p className={styles.word}>
          The word was <strong>{hiddenWord}</strong>
        </p>

        {onViewScores && (
          <button className={styles.scoresBtn} onClick={onViewScores}>
            View High Scores
          </button>
        )}

        <button className={styles.button} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}
