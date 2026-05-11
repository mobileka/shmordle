/**
 * Game board grid.
 *
 * Renders the 6-row wordle grid showing past guesses with evaluations,
 * the current in-progress guess, and empty remaining rows.
 *
 * @packageDocumentation
 */

import type { LetterResult } from '../domain/types';
import { GridRow } from './GridRow';

import styles from './GameBoard.module.css';

interface Props {
  guesses: string[];
  currentGuess: string;
  evaluations: LetterResult[][];
  animating: boolean;
}

const ROWS = 6;

/**
 * Renders the full 6-row game board.
 *
 * Each row can be in one of three states:
 *   1. Submitted guess: a past guess with its evaluation (colored tiles).
 *      The most recent submitted row triggers the flip animation.
 *   2. Current guess: the row the player is actively typing into.
 *   3. Empty row: rows that have not been reached yet.
 */
export function GameBoard({ guesses, currentGuess, evaluations, animating }: Props) {
  const rows = [];

  for (let i = 0; i < ROWS; i++) {
    if (i < guesses.length) {
      // Submitted guess: show the evaluated row.
      // Animate only the most recently submitted row.
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
      // Current row: show what the player has typed so far (no evaluation).
      rows.push(<GridRow key={i} guess={currentGuess} />);
    } else {
      // Future rows: completely empty.
      rows.push(<GridRow key={i} guess="" />);
    }
  }

  return <div className={styles.board}>{rows}</div>;
}
