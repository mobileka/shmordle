import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DifficultyPicker } from './DifficultyPicker';

describe('DifficultyPicker', () => {
  it('renders 4 difficulty buttons in correct order', () => {
    render(<DifficultyPicker defaultDifficulty="hard" onPick={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(buttons[0]).toHaveTextContent('Insane');
    expect(buttons[1]).toHaveTextContent('Hard');
    expect(buttons[2]).toHaveTextContent('Normal');
    expect(buttons[3]).toHaveTextContent('Easy');
  });

  it('renders the title', () => {
    render(<DifficultyPicker defaultDifficulty="hard" onPick={vi.fn()} />);
    expect(screen.getByText('Choose Difficulty')).toBeInTheDocument();
  });

  it('calls onPick with correct difficulty on click', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="hard" onPick={onPick} />);
    await userEvent.click(screen.getByText('Insane'));
    expect(onPick).toHaveBeenCalledWith('insane');
  });

  it('calls onPick with Hard when Hard is clicked', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="hard" onPick={onPick} />);
    await userEvent.click(screen.getByText('Hard'));
    expect(onPick).toHaveBeenCalledWith('hard');
  });

  it('calls onPick with Normal when Normal is clicked', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="hard" onPick={onPick} />);
    await userEvent.click(screen.getByText('Normal'));
    expect(onPick).toHaveBeenCalledWith('normal');
  });

  it('calls onPick with Easy when Easy is clicked', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="hard" onPick={onPick} />);
    await userEvent.click(screen.getByText('Easy'));
    expect(onPick).toHaveBeenCalledWith('easy');
  });

  it('moves selection down with ArrowDown and confirms with Enter', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="hard" onPick={onPick} />);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('normal');
  });

  it('moves selection up with ArrowUp and confirms with Enter', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="hard" onPick={onPick} />);
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('insane');
  });

  it('wraps from Easy to Insane with ArrowDown', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="easy" onPick={onPick} />);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('insane');
  });

  it('wraps from Insane to Easy with ArrowUp', async () => {
    const onPick = vi.fn();
    render(<DifficultyPicker defaultDifficulty="insane" onPick={onPick} />);
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('easy');
  });
});
