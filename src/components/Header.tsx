/**
 * Top navigation bar.
 *
 * Contains the timer display (left), logo and title (center),
 * and action buttons — give-up and theme toggle (right).
 *
 * @packageDocumentation
 */

import { ThemeToggle } from './ThemeToggle';
import { GiveUpButton } from './GiveUpButton';
import { TimerDisplay } from './TimerDisplay';
import styles from './Header.module.css';

interface Props {
  onGiveUp?: () => void;
  showGiveUp?: boolean;
  timeRemaining?: number | null;
}

export function Header({ onGiveUp, showGiveUp, timeRemaining }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.timerSlot}>
        <TimerDisplay timeRemaining={timeRemaining ?? null} />
      </div>
      <div className={styles.titleGroup}>
        <img src="/favicon.svg" alt="" className={styles.logo} />
        <h1 className={styles.title}>Shmordle</h1>
      </div>
      <div className={styles.actions}>
        {showGiveUp && onGiveUp && <GiveUpButton onGiveUp={onGiveUp} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
