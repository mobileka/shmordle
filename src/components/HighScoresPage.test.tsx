import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HighScoresPage } from './HighScoresPage';
import { saveScore } from '../utils/storage';
import type { Difficulty } from '../types';

const store = new Map<string, string>();

const localStorageMock = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
  removeItem: vi.fn((key: string) => { store.delete(key); }),
};

function setupScores() {
  saveScore({ id: 1, difficulty: 'insane' as Difficulty, maxStreak: 5, totalPoints: 420, date: 1700000000000 });
  saveScore({ id: 2, difficulty: 'hard' as Difficulty, maxStreak: 3, totalPoints: 180, date: 1700000001000 });
  saveScore({ id: 3, difficulty: 'insane' as Difficulty, maxStreak: 2, totalPoints: 90, date: 1700000002000 });
}

describe('HighScoresPage', () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders mode tabs: Insane, Hard, Relaxed', () => {
    render(<HighScoresPage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: /insane/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /relaxed/i })).toBeInTheDocument();
  });

  it('defaults to Insane tab selected', () => {
    render(<HighScoresPage onBack={vi.fn()} />);
    const insaneBtn = screen.getByRole('button', { name: /insane/i });
    expect(insaneBtn.className).toContain('active');
  });

  it('shows empty state when no scores', () => {
    render(<HighScoresPage onBack={vi.fn()} />);
    expect(screen.getByText(/no scores yet/i)).toBeInTheDocument();
  });

  it('renders score rows for selected mode', () => {
    setupScores();
    render(<HighScoresPage onBack={vi.fn()} />);
    expect(screen.getByText('420')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('filters by mode when tab clicked', async () => {
    setupScores();
    render(<HighScoresPage onBack={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /hard/i }));
    expect(screen.getByText('180')).toBeInTheDocument();
    expect(screen.queryByText('420')).not.toBeInTheDocument();
  });

  it('sorts by date descending', () => {
    setupScores();
    render(<HighScoresPage onBack={vi.fn()} />);
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    const firstPoints = dataRows[0].textContent;
    const secondPoints = dataRows[1].textContent;
    expect(firstPoints).toContain('90');
    expect(secondPoints).toContain('420');
  });

  it('calls onBack when back button clicked', async () => {
    const onBack = vi.fn();
    render(<HighScoresPage onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows reset confirmation when reset clicked', async () => {
    setupScores();
    render(<HighScoresPage onBack={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reset Scores' }));
    expect(screen.getByText(/clear all insane scores/i)).toBeInTheDocument();
  });
});
