export type LetterStatus = 'absent' | 'present' | 'correct' | 'default';

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'insane';

export const DIFFICULTY: Difficulty[] = ['insane', 'hard', 'normal', 'easy'];

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; timeLimit: number | null }> = {
  insane: { label: 'Insane', timeLimit: 30 },
  hard: { label: 'Hard', timeLimit: 60 },
  normal: { label: 'Normal', timeLimit: 180 },
  easy: { label: 'Easy', timeLimit: null },
};

export interface GameState {
  hiddenWord: string;
  guesses: string[];
  currentGuess: string;
  evaluations: LetterResult[][];
  gameStatus: GameStatus;
  keyboardState: Record<string, LetterStatus>;
  difficulty: Difficulty;
  startedAt: number;
}
