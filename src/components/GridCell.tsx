/**
 * Single tile in the game grid.
 *
 * Displays one letter with status-based background color
 * (default/absent/present/correct) and supports staggered
 * reveal animation.
 *
 * @packageDocumentation
 */

import type { LetterStatus } from '../domain/types';

import styles from './GridCell.module.css';

interface Props {
  letter: string;
  status: LetterStatus;
  delay: number;
  shouldAnimate: boolean;
  isFilled: boolean;
}

export function GridCell({ letter, status, delay, shouldAnimate, isFilled }: Props) {
  const className = [
    styles.cell,
    status !== 'default' ? styles[status] : '',
    isFilled ? styles.filled : '',
    shouldAnimate ? styles.animating : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} style={{ animationDelay: `${delay}ms` }}>
      {letter || ''}
    </div>
  );
}
