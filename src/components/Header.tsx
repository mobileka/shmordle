import { ThemeToggle } from './ThemeToggle';
import { GiveUpButton } from './GiveUpButton';
import styles from './Header.module.css';

interface Props {
  onGiveUp?: () => void;
  showGiveUp?: boolean;
}

export function Header({ onGiveUp, showGiveUp }: Props) {
  return (
    <header className={styles.header}>
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
