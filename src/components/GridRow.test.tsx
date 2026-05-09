import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GridRow } from './GridRow';

describe('GridRow', () => {
  it('renders 5 cells', () => {
    render(<GridRow guess="HELLO" />);
    const cells = document.querySelectorAll('[class*="cell"]');
    expect(cells).toHaveLength(5);
  });

  it('displays letters from guess', () => {
    render(<GridRow guess="HELLO" />);
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
    const lElements = screen.getAllByText('L');
    expect(lElements).toHaveLength(2);
  });

  it('passes evaluation statuses to cells', () => {
    render(
      <GridRow
        guess="HELLO"
        evaluation={[
          { letter: 'H', status: 'correct' },
          { letter: 'E', status: 'absent' },
          { letter: 'L', status: 'present' },
          { letter: 'L', status: 'absent' },
          { letter: 'O', status: 'correct' },
        ]}
      />
    );
    const cells = document.querySelectorAll('[class*="cell"]');
    expect(cells[0].className).toContain('correct');
    expect(cells[1].className).toContain('absent');
    expect(cells[2].className).toContain('present');
    expect(cells[4].className).toContain('correct');
  });

  it('handles empty guess with empty cells', () => {
    render(<GridRow guess="" />);
    const cells = document.querySelectorAll('[class*="cell"]');
    expect(cells).toHaveLength(5);
    cells.forEach((cell) => {
      expect(cell.textContent).toBe('');
    });
  });

  it('marks filled cells with filled class', () => {
    render(<GridRow guess="HE" />);
    const cells = document.querySelectorAll('[class*="cell"]');
    expect(cells[0].className).toContain('filled');
    expect(cells[1].className).toContain('filled');
    expect(cells[2].className).not.toContain('filled');
  });
});
