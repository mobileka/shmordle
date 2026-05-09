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
      <h1 className={styles.title}>Shmordle</h1>
      <div className={styles.actions}>
        {showGiveUp && onGiveUp && <GiveUpButton onGiveUp={onGiveUp} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
