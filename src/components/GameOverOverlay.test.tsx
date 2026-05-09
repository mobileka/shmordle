import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameOverOverlay } from './GameOverOverlay';

describe('GameOverOverlay', () => {
  it('shows "You won!" for won status', () => {
    render(
      <GameOverOverlay status="won" hiddenWord="HELLO" onPlayAgain={vi.fn()} />
    );
    expect(screen.getByText('You won!')).toBeInTheDocument();
  });

  it('shows "Game Over" for lost status', () => {
    render(
      <GameOverOverlay status="lost" hiddenWord="HELLO" onPlayAgain={vi.fn()} />
    );
    expect(screen.getByText('Game Over')).toBeInTheDocument();
  });

  it('reveals hidden word', () => {
    render(
      <GameOverOverlay status="lost" hiddenWord="HELLO" onPlayAgain={vi.fn()} />
    );
    expect(screen.getByText('HELLO')).toBeInTheDocument();
  });

  it('calls onPlayAgain when button is clicked', async () => {
    const onPlayAgain = vi.fn();
    render(
      <GameOverOverlay status="won" hiddenWord="HELLO" onPlayAgain={onPlayAgain} />
    );
    await userEvent.click(screen.getByText('Play Again'));
    expect(onPlayAgain).toHaveBeenCalled();
  });
});
