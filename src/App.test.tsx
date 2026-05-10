import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

const store = new Map<string, string>();

const localStorageMock = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
  removeItem: vi.fn((key: string) => { store.delete(key); }),
};

vi.mock('./domain/dictionary', () => ({
  isValidWord: vi.fn((w: string) => w !== 'XXXXX'),
  getRandomWord: vi.fn(() => 'HELLO'),
}));

vi.mock('./hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    isDark: false,
    toggleTheme: vi.fn(),
  })),
}));

function clickKeyboardKey(label: string) {
  return userEvent.click(screen.getByRole('button', { name: label }));
}

describe('App integration', () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows DifficultyPicker on fresh start', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Choose Difficulty' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /relaxed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /insane/i })).toBeInTheDocument();
  });

  it('shows Header even when picker is visible', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Shmordle' })).toBeInTheDocument();
  });

  it('starts game on difficulty pick', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '⌫' })).toBeInTheDocument();
  });

  it('enters letters and sees them on the board', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    await clickKeyboardKey('H');
    await clickKeyboardKey('E');
    await clickKeyboardKey('L');
    const hElements = screen.getAllByText('H');
    expect(hElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows invalid word toast and keeps playing', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    await clickKeyboardKey('X');
    await clickKeyboardKey('X');
    await clickKeyboardKey('X');
    await clickKeyboardKey('X');
    await clickKeyboardKey('X');
    await userEvent.click(screen.getByRole('button', { name: 'Enter' }));
    expect(screen.getByText('Not in word list')).toBeInTheDocument();
  });

  it('shows win overlay for Zen mode', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /zen/i }));
    await clickKeyboardKey('H');
    await clickKeyboardKey('E');
    await clickKeyboardKey('L');
    await clickKeyboardKey('L');
    await clickKeyboardKey('O');
    await userEvent.click(screen.getByRole('button', { name: 'Enter' }));
    expect(screen.getByRole('heading', { name: 'You won!' })).toBeInTheDocument();
  });

  it('Play Again returns to picker', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /zen/i }));
    await clickKeyboardKey('H');
    await clickKeyboardKey('E');
    await clickKeyboardKey('L');
    await clickKeyboardKey('L');
    await clickKeyboardKey('O');
    await userEvent.click(screen.getByRole('button', { name: 'Enter' }));
    expect(screen.getByRole('heading', { name: 'You won!' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Play Again' }));
    expect(screen.getByRole('heading', { name: 'Choose Difficulty' })).toBeInTheDocument();
  });

  it('shows confirmation dialog when Give Up is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    await userEvent.click(screen.getByLabelText('Give up'));
    expect(screen.getByText('Are you sure you want to give up?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Give Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Game Over' })).not.toBeInTheDocument();
  });

  it('shows game-over overlay after confirming give-up', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    await userEvent.click(screen.getByLabelText('Give up'));
    await userEvent.click(screen.getByRole('button', { name: 'Give Up' }));
    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
    expect(screen.getByText('HELLO')).toBeInTheDocument();
  });

  it('returns to game when cancelling give-up', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    await userEvent.click(screen.getByLabelText('Give up'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'Game Over' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Give up')).toBeInTheDocument();
  });

  it('Give Up button disappears after game is over', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    await userEvent.click(screen.getByLabelText('Give up'));
    await userEvent.click(screen.getByRole('button', { name: 'Give Up' }));
    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Give up')).not.toBeInTheDocument();
  });

  it('shows timer in header for timed modes', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    expect(screen.getByText(/^\d:\d{2}$/)).toBeInTheDocument();
  });

  it('does not show timer for Zen mode', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /zen/i }));
    expect(screen.queryByText(/^\d+:\d{2}$/)).not.toBeInTheDocument();
  });

  it('shows game over when timer expires', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /insane/i }));
    expect(screen.getByText('0:30')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('back from High Scores returns to game-over screen', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    await userEvent.click(screen.getByLabelText('Give up'));
    await userEvent.click(screen.getByRole('button', { name: 'Give Up' }));
    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'View High Scores' }));
    expect(screen.getByRole('heading', { name: 'High Scores' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Choose Difficulty' })).not.toBeInTheDocument();
  });

  it('saves score to High Scores after non-Zen game over', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    await userEvent.click(screen.getByLabelText('Give up'));
    await userEvent.click(screen.getByRole('button', { name: 'Give Up' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Game Over' })).toBeInTheDocument();
    });

    const raw = localStorage.getItem('shmordle-scores');
    expect(raw).not.toBeNull();
    const data = JSON.parse(raw!);
    expect(data.records).toHaveLength(1);
    expect(data.records[0].difficulty).toBe('hard');
    expect(data.records[0].maxStreak).toBe(1);
  });

  it('resumes saved game without showing picker', () => {
    const savedState = {
      hiddenWord: 'HELLO',
      guesses: ['WORLD'],
      currentGuess: 'QU',
      evaluations: [[
        { letter: 'W', status: 'absent' },
        { letter: 'O', status: 'present' },
        { letter: 'R', status: 'absent' },
        { letter: 'L', status: 'present' },
        { letter: 'D', status: 'absent' },
      ]],
      gameStatus: 'playing',
      virtualKeyboardState: { W: 'absent', O: 'present', R: 'absent', L: 'present', D: 'absent' },
      difficulty: 'relaxed',
      startedAt: Date.now(),
      streak: 1,
      sessionPoints: 0,
      timeBonus: 0,
    };
    localStorage.setItem('shmordle-game-state', JSON.stringify(savedState));

    render(<App />);
    expect(screen.queryByRole('heading', { name: 'Choose Difficulty' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
  });
});
