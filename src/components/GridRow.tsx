/**
 * Single row of 5 grid cells.
 *
 * Renders a guess or empty row as five GridCell components,
 * optionally with evaluation-based coloring and reveal animation.
 *
 * @packageDocumentation
 */

import type { LetterResult, LetterStatus } from '../domain/types';
import { GridCell } from './GridCell';

import styles from './GridRow.module.css';

interface Props {
  guess: string;
  evaluation?: LetterResult[];
  shouldAnimate?: boolean;
}

/**
 * Renders a single row of 5 cells.
 *
 * When `evaluation` is provided, cells are colored based on the result
 * (correct/present/absent). When absent, the row shows the player's
 * current typing progress with uncolored tiles.
 *
 * The `isFilled` flag distinguishes between a cell that has a letter
 * the player typed (should have a visible border) versus an empty cell
 * in an evaluated row (no border, no letter).
 */
export function GridRow({ guess, evaluation, shouldAnimate }: Props) {
  const cells = [];
  for (let i = 0; i < 5; i++) {
    const letter = guess[i] || '';
    let status: LetterStatus = 'default';
    if (evaluation) {
      status = evaluation[i].status;
    }
    // A cell is "filled" when it has a letter but has not been evaluated yet.
    // This gives the typed letter a visible border before submission.
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
