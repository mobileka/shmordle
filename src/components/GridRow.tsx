import type { LetterResult, LetterStatus } from '../types';
import { GridCell } from './GridCell';

import styles from './GridRow.module.css';

interface Props {
  guess: string;
  evaluation?: LetterResult[];
  shouldAnimate?: boolean;
}

export function GridRow({ guess, evaluation, shouldAnimate }: Props) {
  const cells = [];
  for (let i = 0; i < 5; i++) {
    const letter = guess[i] || '';
    let status: LetterStatus = 'default';
    if (evaluation) {
      status = evaluation[i].status;
    }
    const isFilled = !!letter && !evaluation;
    cells.push(
      <GridCell
        key={i}
        letter={letter}
        status={status}
        delay={i * 300}
        shouldAnimate={!!shouldAnimate && status !== 'default'}
        isFilled={isFilled}
      />
    );
  }

  return <div className={styles.row}>{cells}</div>;
}
