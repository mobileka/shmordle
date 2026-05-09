export type LetterStatus = 'absent' | 'present' | 'correct' | 'default';

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  hiddenWord: string;
  guesses: string[];
  currentGuess: string;
  evaluations: LetterResult[][];
  gameStatus: GameStatus;
  keyboardState: Record<string, LetterStatus>;
}
