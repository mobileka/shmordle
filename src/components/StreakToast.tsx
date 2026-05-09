import { useEffect } from 'react';
import styles from './StreakToast.module.css';

interface Props {
  show: boolean;
  points: number;
  streak: number;
  onDone?: () => void;
}

export function StreakToast({ show, points, streak, onDone }: Props) {
  useEffect(() => {
    if (show && onDone) {
      const timer = setTimeout(onDone, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div className={styles.toast}>
      <span className={styles.text}>
        +{points} pts · streak {streak}
      </span>
    </div>
  );
}
