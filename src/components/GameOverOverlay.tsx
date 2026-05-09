import styles from './GameOverOverlay.module.css';

interface Props {
  status: 'won' | 'lost';
  hiddenWord: string;
  onPlayAgain: () => void;
}

export function GameOverOverlay({ status, hiddenWord, onPlayAgain }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          {status === 'won' ? 'You won!' : 'Game Over'}
        </h2>
        <p className={styles.word}>
          The word was <strong>{hiddenWord}</strong>
        </p>
        <button className={styles.button} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}
