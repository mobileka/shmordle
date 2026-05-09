import type { LetterResult, LetterStatus } from '../types';

export function evaluateGuess(guess: string, hidden: string): LetterResult[] {
  const results: LetterResult[] = Array(5)
    .fill(null)
    .map((_, i) => ({ letter: guess[i], status: 'absent' as LetterStatus }));

  const freq: Record<string, number> = {};
  for (const ch of hidden) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  for (let i = 0; i < 5; i++) {
    if (guess[i] === hidden[i]) {
      results[i].status = 'correct';
      freq[guess[i]]--;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (results[i].status === 'correct') continue;
    if (freq[guess[i]] > 0) {
      results[i].status = 'present';
      freq[guess[i]]--;
    }
  }

  return results;
}
