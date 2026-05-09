import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameBoard } from './GameBoard';

describe('GameBoard', () => {
  it('renders 6 rows', () => {
    render(
      <GameBoard guesses={[]} currentGuess="" evaluations={[]} animating={false} />
    );
    const rows = document.querySelectorAll('[class*="row"]');
    expect(rows).toHaveLength(6);
  });

  it('renders past guesses with evaluations', () => {
    render(
      <GameBoard
        guesses={['HELLO']}
        currentGuess=""
        evaluations={[
          [
            { letter: 'H', status: 'correct' },
            { letter: 'E', status: 'absent' },
            { letter: 'L', status: 'present' },
            { letter: 'L', status: 'absent' },
            { letter: 'O', status: 'correct' },
          ],
        ]}
        animating={false}
      />
    );
    const cells = document.querySelectorAll('[class*="cell"]');
    expect(cells).toHaveLength(30);
  });

  it('renders active row with currentGuess', () => {
    render(
      <GameBoard guesses={[]} currentGuess="HEL" evaluations={[]} animating={false} />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('renders future rows empty', () => {
    render(
      <GameBoard
        guesses={['HELLO']}
        currentGuess="WO"
        evaluations={[[{ letter: 'H', status: 'absent' }, { letter: 'E', status: 'absent' }, { letter: 'L', status: 'absent' }, { letter: 'L', status: 'absent' }, { letter: 'O', status: 'absent' }]]}
        animating={false}
      />
    );
    const rows = document.querySelectorAll('[class*="row"]');
    expect(rows).toHaveLength(6);
  });
});
