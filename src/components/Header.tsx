import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Shmordle</h1>
      <div className={styles.toggle}>
        <ThemeToggle />
      </div>
    </header>
  );
}
