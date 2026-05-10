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
    const result = evaluateGuess('RADIO', 'AUDIO');
    expect(result[0]).toEqual({ letter: 'R', status: 'absent' });
    expect(result[1]).toEqual({ letter: 'A', status: 'present' });
    expect(result[2]).toEqual({ letter: 'D', status: 'correct' });
    expect(result[3]).toEqual({ letter: 'I', status: 'correct' });
    expect(result[4]).toEqual({ letter: 'O', status: 'correct' });
  });

  describe('handles duplicate letters in guess', () => {
    describe('with fewer in hidden', () => {
      it('marks only the first instance present', () => {
        const result = evaluateGuess('SPEED', 'HELLO');
        expect(result[2]).toEqual({ letter: 'E', status: 'present' });
        expect(result[3]).toEqual({ letter: 'E', status: 'absent' });
      });

      it('marks only the first instance correct', () => {
        const result = evaluateGuess('SPEED', 'XXEXX');
        expect(result[2]).toEqual({ letter: 'E', status: 'correct' });
        expect(result[3]).toEqual({ letter: 'E', status: 'absent' });
      });

      it('marks only the first instance correct asdasdasd', () => {
        const result = evaluateGuess('SPEED', 'XXXEX');
        expect(result[2]).toEqual({ letter: 'E', status: 'absent' });
        expect(result[3]).toEqual({ letter: 'E', status: 'correct' });
      });
    });

    describe('with matching in guess', () => {
      describe('and mistmatching positions', () => {
        it('marks both as present', () => {
          const result = evaluateGuess('SPEED', 'EEXXX');
          expect(result[2]).toEqual({ letter: 'E', status: 'present' });
          expect(result[3]).toEqual({ letter: 'E', status: 'present' });
        });
      });

      describe('and matching positions', () => {
        it('marks one as correct and the other as present', () => {
          const result = evaluateGuess('SPEED', 'XXXEE');
          expect(result[2]).toEqual({ letter: 'E', status: 'present' });
          expect(result[3]).toEqual({ letter: 'E', status: 'correct' });
        });

        it('marks all as correct', () => {
          const result = evaluateGuess('SPEED', 'XXEEX');
          expect(result[2]).toEqual({ letter: 'E', status: 'correct' });
          expect(result[3]).toEqual({ letter: 'E', status: 'correct' });
        });
      });
    });
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
