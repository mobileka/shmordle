import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameOverOverlay } from './GameOverOverlay';

describe('GameOverOverlay', () => {
  it('shows "You won!" for won status', () => {
    render(
      <GameOverOverlay status="won" hiddenWord="HELLO" onPlayAgain={vi.fn()} />
    );
    expect(screen.getByRole('heading', { name: 'You won!' })).toBeInTheDocument();
  });

  it('shows "Game Over" for lost status', () => {
    render(
      <GameOverOverlay status="lost" hiddenWord="HELLO" onPlayAgain={vi.fn()} />
    );
    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
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
    await userEvent.click(screen.getByRole('button', { name: 'Play Again' }));
    expect(onPlayAgain).toHaveBeenCalled();
  });

  it('shows score info when provided', () => {
    render(
      <GameOverOverlay
        status="lost"
        hiddenWord="HELLO"
        onPlayAgain={vi.fn()}
        score={420}
        streak={5}
      />
    );
    expect(screen.getByText(/scored 420 points/i)).toBeInTheDocument();
    expect(screen.getByText(/streak 5/i)).toBeInTheDocument();
  });

  it('shows new personal best when isNewBest is true', () => {
    render(
      <GameOverOverlay
        status="lost"
        hiddenWord="HELLO"
        onPlayAgain={vi.fn()}
        score={420}
        streak={5}
        isNewBest={true}
        difficulty="insane"
      />
    );
    expect(screen.getByText(/new personal best/i)).toBeInTheDocument();
    expect(screen.getByText(/insane/i)).toBeInTheDocument();
  });

  it('shows View High Scores button when onViewScores is provided', async () => {
    const onViewScores = vi.fn();
    render(
      <GameOverOverlay
        status="lost"
        hiddenWord="HELLO"
        onPlayAgain={vi.fn()}
        score={420}
        streak={5}
        onViewScores={onViewScores}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'View High Scores' }));
    expect(onViewScores).toHaveBeenCalledOnce();
  });

  it('does not show score info when score is not provided', () => {
    render(
      <GameOverOverlay status="lost" hiddenWord="HELLO" onPlayAgain={vi.fn()} />
    );
    expect(screen.queryByText(/scored/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View High Scores' })).not.toBeInTheDocument();
  });
});
