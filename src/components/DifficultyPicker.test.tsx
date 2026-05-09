import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DifficultyPicker } from './DifficultyPicker';

describe('DifficultyPicker', () => {
  it('renders 4 difficulty buttons in correct order', () => {
    render(<DifficultyPicker defaultDifficulty="zen" onPick={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(buttons[0]).toHaveTextContent('Zen');
    expect(buttons[1]).toHaveTextContent('Relaxed');
    expect(buttons[2]).toHaveTextContent('Hard');
    expect(buttons[3]).toHaveTextContent('Insane');
  });

  it('renders the title', () => {
    render(<DifficultyPicker defaultDifficulty="zen" onPick={vi.fn()} />);
    expect(screen.getByText('Choose Difficulty')).toBeInTheDocument();
  });

  it('calls onPick with correct difficulty on click', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="zen" onPick={onPick} />);
    await userEvent.click(screen.getByText('Insane'));
    expect(onPick).toHaveBeenCalledWith('insane');
  });

  it('calls onPick with Hard when Hard is clicked', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="zen" onPick={onPick} />);
    await userEvent.click(screen.getByText('Hard'));
    expect(onPick).toHaveBeenCalledWith('hard');
  });

  it('calls onPick with Relaxed when Relaxed is clicked', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="zen" onPick={onPick} />);
    await userEvent.click(screen.getByText('Relaxed'));
    expect(onPick).toHaveBeenCalledWith('relaxed');
  });

  it('calls onPick with Zen when Zen is clicked', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="zen" onPick={onPick} />);
    await userEvent.click(screen.getByText('🧘 Zen'));
    expect(onPick).toHaveBeenCalledWith('zen');
  });

  it('moves selection down with ArrowDown and confirms with Enter', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="zen" onPick={onPick} />);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('relaxed');
  });

  it('moves selection up with ArrowUp and confirms with Enter', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="zen" onPick={onPick} />);
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('insane');
  });

  it('wraps from Insane to Zen with ArrowDown', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="insane" onPick={onPick} />);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('zen');
  });

  it('wraps from Zen to Insane with ArrowUp', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="zen" onPick={onPick} />);
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('insane');
  });

  it('highlights default difficulty', () => {
    render(<DifficultyPicker defaultDifficulty="hard" onPick={vi.fn()} />);
    const hardButton = screen.getByText('Hard');
    expect(hardButton.className).toContain('selected');
  });
});
