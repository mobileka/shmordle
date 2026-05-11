/**
 * Word dictionary and random word selection.
 *
 * Loads the embedded word list from `words.json` into a Set for O(1)
 * lookups, provides validation of user guesses, and selects random
 * hidden words for new games.
 *
 * @packageDocumentation
 */

import wordsDict from '../data/words.json';

// In-memory dictionary stored as a Set for fast O(1) lookups.
// All words are normalized to uppercase at load time.
const dictionary: Set<string> = new Set(
  wordsDict.map((w: string) => w.trim().toUpperCase())
);

/**
 * Checks whether a word exists in the game's dictionary.
 *
 * @param word - The word to validate (case-insensitive).
 * @returns True if the word is in the dictionary, false otherwise.
 */
export function isValidWord(word: string): boolean {
  return dictionary.has(word.toUpperCase());
}

/**
 * Selects a random word from the dictionary to use as the hidden word.
 *
 * @returns A random 5-letter word in uppercase.
 */
export function getRandomWord(): string {
  return wordsDict[Math.floor(Math.random() * wordsDict.length)].toUpperCase();
}
