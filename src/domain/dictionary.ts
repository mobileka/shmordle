/**
 * Word dictionary and random word selection.
 *
 * Loads the embedded word list from `words.json`, provides validation
 * of user guesses and random hidden word selection.
 *
 * @packageDocumentation
 */

import wordsDict from '../data/words.json';

const dictionary: Set<string> = new Set(
  wordsDict.map((w: string) => w.trim().toUpperCase())
);

export function isValidWord(word: string): boolean {
  return dictionary.has(word.toUpperCase());
}

export function getRandomWord(): string {
  return wordsDict[Math.floor(Math.random() * wordsDict.length)].toUpperCase();
}
