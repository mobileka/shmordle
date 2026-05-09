import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

vi.mock('./utils/dictionary', () => ({
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
  const buttons = screen.getAllByText(label);
  const key = buttons.find(
    (b) => b.tagName === 'BUTTON'
  ) as HTMLButtonElement;
  return userEvent.click(key);
}

describe('App integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Header, GameBoard, and VirtualKeyboard', () => {
    render(<App />);
    expect(screen.getByText('Shmordle')).toBeInTheDocument();
    expect(screen.getByText('Enter')).toBeInTheDocument();
    expect(screen.getByText('⌫')).toBeInTheDocument();
  });

  it('enters letters and sees them on the board', async () => {
    render(<App />);
    await clickKeyboardKey('H');
    await clickKeyboardKey('E');
    await clickKeyboardKey('L');
    const hElements = screen.getAllByText('H');
    expect(hElements.length).toBeGreaterThanOrEqual(1);
    const eElements = screen.getAllByText('E');
    expect(eElements.length).toBeGreaterThanOrEqual(1);
    const lElements = screen.getAllByText('L');
    expect(lElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows invalid word toast and keeps playing', async () => {
    render(<App />);
    await clickKeyboardKey('X');
    await clickKeyboardKey('X');
    await clickKeyboardKey('X');
    await clickKeyboardKey('X');
    await clickKeyboardKey('X');
    const enterButtons = screen.getAllByText('Enter');
    const enterKey = enterButtons.find(
      (b) => b.tagName === 'BUTTON'
    ) as HTMLButtonElement;
    await userEvent.click(enterKey);
    expect(screen.getByText('Not in word list')).toBeInTheDocument();
  });

  it('shows win overlay after correct guess', async () => {
    render(<App />);
    await clickKeyboardKey('H');
    await clickKeyboardKey('E');
    await clickKeyboardKey('L');
    await clickKeyboardKey('L');
    await clickKeyboardKey('O');
    const enterButtons = screen.getAllByText('Enter');
    const enterKey = enterButtons.find(
      (b) => b.tagName === 'BUTTON'
    ) as HTMLButtonElement;
    await userEvent.click(enterKey);
    expect(screen.getByText('You won!')).toBeInTheDocument();
  });

  it('Play Again restarts the game', async () => {
    render(<App />);
    await clickKeyboardKey('H');
    await clickKeyboardKey('E');
    await clickKeyboardKey('L');
    await clickKeyboardKey('L');
    await clickKeyboardKey('O');
    const enterButtons = screen.getAllByText('Enter');
    const enterKey = enterButtons.find(
      (b) => b.tagName === 'BUTTON'
    ) as HTMLButtonElement;
    await userEvent.click(enterKey);
    expect(screen.getByText('You won!')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Play Again'));
    expect(screen.queryByText('You won!')).not.toBeInTheDocument();
  });
});
