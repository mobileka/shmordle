import { useState, useEffect, useCallback } from 'react';
import type { Difficulty } from '../domain/types';
import { DIFFICULTY, DIFFICULTY_CONFIG } from '../domain/types';
import styles from './DifficultyPicker.module.css';

interface Props {
  defaultDifficulty: Difficulty;
  onPick: (difficulty: Difficulty) => void;
}

export function DifficultyPicker({ defaultDifficulty, onPick }: Props) {
  const defaultIndex = DIFFICULTY.indexOf(defaultDifficulty);
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex >= 0 ? defaultIndex : 1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % DIFFICULTY.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + DIFFICULTY.length) % DIFFICULTY.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onPick(DIFFICULTY[selectedIndex]);
      }
    },
    [onPick, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h2 className={styles.title}>Choose Difficulty</h2>
        {DIFFICULTY.map((diff, index) => (
          <button
            key={diff}
            className={`${styles.button} ${index === selectedIndex ? styles.selected : ''}`}
            onClick={() => onPick(diff)}
            data-difficulty={diff}
          >
            {DIFFICULTY_CONFIG[diff].label}
          </button>
        ))}
      </div>
    </div>
  );
}
