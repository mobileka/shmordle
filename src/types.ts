export type LetterStatus = 'absent' | 'present' | 'correct' | 'default';

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export type Difficulty = 'zen' | 'relaxed' | 'hard' | 'insane';

export const DIFFICULTY: Difficulty[] = ['zen', 'relaxed', 'hard', 'insane'];

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; timeLimit: number | null }> = {
  zen: { label: '🧘 Zen', timeLimit: null },
  relaxed: { label: 'Relaxed', timeLimit: 180 },
  hard: { label: 'Hard', timeLimit: 60 },
  insane: { label: 'Insane', timeLimit: 30 },
};

export interface ScoreRecord {
  id: number;
  difficulty: Difficulty;
  maxStreak: number;
  totalPoints: number;
  date: number;
}

export interface ScoresData {
  records: ScoreRecord[];
}

export interface GameState {
  hiddenWord: string;
  guesses: string[];
  currentGuess: string;
  evaluations: LetterResult[][];
  gameStatus: GameStatus;
  keyboardState: Record<string, LetterStatus>;
  difficulty: Difficulty;
  startedAt: number;
  streak: number;
  sessionPoints: number;
  timeBonus: number;
}
