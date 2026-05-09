import type { LetterResult } from '../types';
import { GridRow } from './GridRow';

import styles from './GameBoard.module.css';

interface Props {
  guesses: string[];
  currentGuess: string;
  evaluations: LetterResult[][];
  animating: boolean;
}

const ROWS = 6;

export function GameBoard({ guesses, currentGuess, evaluations, animating }: Props) {
  const rows = [];

  for (let i = 0; i < ROWS; i++) {
    if (i < guesses.length) {
      const shouldAnimate = i === guesses.length - 1 && currentGuess === '' && animating;
      rows.push(
        <GridRow
          key={i}
          guess={guesses[i]}
          evaluation={evaluations[i]}
          shouldAnimate={shouldAnimate}
        />
      );
    } else if (i === guesses.length) {
      rows.push(<GridRow key={i} guess={currentGuess} />);
    } else {
      rows.push(<GridRow key={i} guess="" />);
    }
  }

  return <div className={styles.board}>{rows}</div>;
}
