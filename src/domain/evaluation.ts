import type { LetterResult, LetterStatus } from './types';

export function evaluateGuess(guess: string, hidden: string, size: number = 5): LetterResult[] {
  // Hardcoding the size to 5 for now, but might decide to make dynamic if we decide to make this configurable.
  const results: LetterResult[] = Array(size)
    .fill(null)
    .map((_, i) => ({ letter: guess[i], status: 'absent' as LetterStatus }));

  let hiddenChars = hidden.split('');

  for (let i = 0; i < size; i++) {
    if (guess[i] === hidden[i]) {
      results[i].status = 'correct' as LetterStatus;
      hiddenChars.splice(i, 1);
    }
  }

  for (let i = 0; i < size; i++) {
    if (results[i].status === 'correct') continue;

    let index = hiddenChars.indexOf(guess[i])
    if (index !== -1) {
      results[i].status = 'present' as LetterStatus;

      hiddenChars[index] = '';
    }
  }

  return results;
}
