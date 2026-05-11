/**
 * Guess evaluation algorithm.
 *
 * Compares a player's guess against the hidden word and produces per-letter
 * results (`correct`, `present`, `absent`) following Wordle-style rules.
 *
 * Uses a two-pass approach:
 *   1. First pass: mark exact matches (correct position) and remove those
 *      letters from the pool so they are not double-counted.
 *   2. Second pass: mark misplaced letters (present but wrong position)
 *      from the remaining pool, consuming each match only once.
 *
 * This correctly handles duplicate letters. For example, if the hidden word
 * is "APPLE" and the guess is "PAPER", only one 'P' can be 'correct' and
 * the other can be 'present' or 'absent' depending on what is left.
 *
 * @packageDocumentation
 */

import type { LetterResult, LetterStatus } from './types';

/**
 * Evaluates a guess against the hidden word.
 *
 * @param guess - The 5-letter word the player submitted.
 * @param hidden - The hidden target word.
 * @param size - Word length (defaults to 5, reserved for future configurability).
 * @returns An array of LetterResult, one per position, with status set to
 *          'correct', 'present', or 'absent'.
 */
export function evaluateGuess(guess: string, hidden: string, size: number = 5): LetterResult[] {
  // Initialize all positions as 'absent'. We will upgrade them in the passes below.
  const results: LetterResult[] = Array(size)
    .fill(null)
    .map((_, i) => ({ letter: guess[i], status: 'absent' as LetterStatus }));

  // Working copy of the hidden word's letters. We splice out matched letters
  // so that duplicate letters in the guess cannot overclaim.
  let hiddenChars = hidden.split('');

  // Pass 1: find exact matches (correct position).
  // These take priority over 'present' and consume the letter from the pool.
  for (let i = 0; i < size; i++) {
    if (guess[i] === hidden[i]) {
      results[i].status = 'correct' as LetterStatus;
      // Blank out this letter from the pool so it cannot be reused in pass 2.
      hiddenChars[i] = '';
    }
  }

  // Pass 2: find misplaced letters (present but wrong position).
  // Skip positions already marked 'correct'.
  for (let i = 0; i < size; i++) {
    if (results[i].status === 'correct') continue;

    let index = hiddenChars.indexOf(guess[i]);
    if (index !== -1) {
      results[i].status = 'present' as LetterStatus;
      // Blank out the used letter so it cannot be matched again.
      // We use '' instead of splice to keep indices stable.
      hiddenChars[index] = '';
    }
  }

  return results;
}
