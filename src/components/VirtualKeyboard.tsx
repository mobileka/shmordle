import type { LetterStatus } from '../domain/types';

import styles from './VirtualKeyboard.module.css';

interface Props {
  virtualKeyboardState: Record<string, LetterStatus>;
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled: boolean;
}

const ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

export function VirtualKeyboard({
  virtualKeyboardState,
  onLetter,
  onEnter,
  onBackspace,
  disabled,
}: Props) {
  const getKeyClass = (letter: string) => {
    const status = virtualKeyboardState[letter] || 'default';
    return [styles.key, styles[status]].join(' ');
  };

  const isAbsent = (letter: string) => virtualKeyboardState[letter] === 'absent';

  return (
    <div className={styles.keyboard}>
      <div className={styles.row}>
        {ROW_1.map((letter) => (
          <button
            key={letter}
            className={getKeyClass(letter)}
            onClick={() => onLetter(letter)}
            disabled={disabled || isAbsent(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className={styles.row}>
        <div className={styles.spacer} />
        {ROW_2.map((letter) => (
          <button
            key={letter}
            className={getKeyClass(letter)}
            onClick={() => onLetter(letter)}
            disabled={disabled || isAbsent(letter)}
          >
            {letter}
          </button>
        ))}
        <div className={styles.spacer} />
      </div>
      <div className={styles.row}>
        <button
          className={`${styles.key} ${styles.wide}`}
          onClick={onEnter}
          disabled={disabled}
        >
          Enter
        </button>
        {ROW_3.map((letter) => (
          <button
            key={letter}
            className={getKeyClass(letter)}
            onClick={() => onLetter(letter)}
            disabled={disabled || isAbsent(letter)}
          >
            {letter}
          </button>
        ))}
        <button
          className={`${styles.key} ${styles.wide}`}
          onClick={onBackspace}
          disabled={disabled}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
