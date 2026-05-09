import { isValidWord, getRandomWord } from './dictionary';

describe('isValidWord', () => {
  it('returns true for a known valid word', () => {
    expect(isValidWord('HELLO')).toBe(true);
  });

  it('returns false for a non-dictionary word', () => {
    expect(isValidWord('XXXXX')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isValidWord('hello')).toBe(true);
    expect(isValidWord('Hello')).toBe(true);
    expect(isValidWord('HELLO')).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(isValidWord('')).toBe(false);
  });

  it('returns false for strings of wrong length', () => {
    expect(isValidWord('HI')).toBe(false);
    expect(isValidWord('TOOLSS')).toBe(false);
  });
});

describe('getRandomWord', () => {
  it('returns a string', () => {
    const word = getRandomWord();
    expect(typeof word).toBe('string');
  });

  it('returns a 5-letter word', () => {
    const word = getRandomWord();
    expect(word).toHaveLength(5);
  });

  it('returns a word from the dictionary', () => {
    const word = getRandomWord();
    expect(isValidWord(word)).toBe(true);
  });
});
