import styles from './TimerDisplay.module.css';

interface Props {
  timeRemaining: number | null;
}

export function TimerDisplay({ timeRemaining }: Props) {
  if (timeRemaining === null) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isUrgent = timeRemaining <= 10;

  return (
    <span className={`${styles.timer} ${isUrgent ? styles.urgent : ''}`}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}
