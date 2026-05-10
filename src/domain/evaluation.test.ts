import { evaluateGuess } from './evaluation';

describe('evaluateGuess', () => {
  it('returns all correct when guess matches hidden exactly', () => {
    const result = evaluateGuess('HELLO', 'HELLO');
    expect(result).toHaveLength(5);
    result.forEach((r) => expect(r.status).toBe('correct'));
  });

  it('returns all absent when no letters match', () => {
    const result = evaluateGuess('ABCDE', 'FGHIJ');
    expect(result).toHaveLength(5);
    result.forEach((r) => expect(r.status).toBe('absent'));
  });

  it('returns mixed correct, absent, and present', () => {
    const result = evaluateGuess('HELPS', 'HELLO');
    expect(result[0]).toEqual({ letter: 'H', status: 'correct' });
    expect(result[1]).toEqual({ letter: 'E', status: 'correct' });
    expect(result[2]).toEqual({ letter: 'L', status: 'correct' });
    expect(result[3]).toEqual({ letter: 'P', status: 'absent' });
    expect(result[4]).toEqual({ letter: 'S', status: 'absent' });
  });

  it('handles duplicate letters in guess with fewer in hidden', () => {
    const result = evaluateGuess('SPEED', 'HELLO');
    expect(result[0]).toEqual({ letter: 'S', status: 'absent' });
    expect(result[1]).toEqual({ letter: 'P', status: 'absent' });
    // One E is present (HELLO has one E), the other is absent
    const eLetters = result.filter((r) => r.letter === 'E');
    expect(eLetters).toHaveLength(2);
    const statuses = eLetters.map((r) => r.status).sort();
    expect(statuses).toEqual(['absent', 'present']);
    expect(result[4]).toEqual({ letter: 'D', status: 'absent' });
  });

  it('handles duplicate letters in hidden with fewer in guess', () => {
    const result = evaluateGuess('SLIME', 'SPEED');
    expect(result[0]).toEqual({ letter: 'S', status: 'correct' });
    expect(result[1]).toEqual({ letter: 'L', status: 'absent' });
    expect(result[2]).toEqual({ letter: 'I', status: 'absent' });
    expect(result[3]).toEqual({ letter: 'M', status: 'absent' });
    expect(result[4]).toEqual({ letter: 'E', status: 'present' });
  });

  it('handles overlapping duplicate letters in correct positions', () => {
    const result = evaluateGuess('SLEEP', 'SPEED');
    expect(result[0]).toEqual({ letter: 'S', status: 'correct' });
    expect(result[1]).toEqual({ letter: 'L', status: 'absent' });
    expect(result[2]).toEqual({ letter: 'E', status: 'correct' });
    expect(result[3]).toEqual({ letter: 'E', status: 'correct' });
    expect(result[4]).toEqual({ letter: 'P', status: 'present' });
  });

  it('handles cross-position duplicate matching with priority to position', () => {
    const result = evaluateGuess('PAPER', 'APPLE');
    expect(result[0]).toEqual({ letter: 'P', status: 'present' });
    expect(result[1]).toEqual({ letter: 'A', status: 'present' });
    expect(result[2]).toEqual({ letter: 'P', status: 'correct' });
    expect(result[3]).toEqual({ letter: 'E', status: 'present' });
    expect(result[4]).toEqual({ letter: 'R', status: 'absent' });
  });

  it('returns exactly 5 results', () => {
    const result = evaluateGuess('ABCDE', 'FGHIJ');
    expect(result).toHaveLength(5);
  });

  it('each result has letter and status properties', () => {
    const result = evaluateGuess('ABCDE', 'FGHIJ');
    result.forEach((r) => {
      expect(r).toHaveProperty('letter');
      expect(r).toHaveProperty('status');
      expect(typeof r.letter).toBe('string');
      expect(['absent', 'present', 'correct', 'default']).toContain(r.status);
    });
  });
});
