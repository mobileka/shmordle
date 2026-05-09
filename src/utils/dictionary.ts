import wordsRaw from '../data/words.txt?raw';

const dictionary: Set<string> = new Set(
  wordsRaw
    .split('\n')
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w.length === 5)
);

export function isValidWord(word: string): boolean {
  return dictionary.has(word.toUpperCase());
}

export function getRandomWord(): string {
  const arr = Array.from(dictionary);
  return arr[Math.floor(Math.random() * arr.length)];
}
