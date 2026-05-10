import { useState, useEffect, useMemo } from 'react';
import { useGame } from './hooks/useGame';
import { useKeyboard } from './hooks/useKeyboard';
import { useTimer } from './hooks/useTimer';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { FeedbackToast } from './components/FeedbackToast';
import { GameOverOverlay } from './components/GameOverOverlay';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DifficultyPicker } from './components/DifficultyPicker';
import { StreakToast } from './components/StreakToast';
import { HighScoresPage } from './components/HighScoresPage';
import { loadGameState, clearGameState, savePreferredDifficulty, loadPreferredDifficulty, loadScores, saveScore } from './utils/storage';
import { DIFFICULTY_CONFIG } from './types';
import type { Difficulty } from './types';

import styles from './App.module.css';

// Which screen the app is currently showing.
type PageView = 'picker' | 'game' | 'scores';

// Props passed from the top-level App router into the active game view.
interface GameAreaProps {
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onViewScores: () => void;
}

// Wraps the game board, keyboard, overlays, and timer for a single game run.
// Handles game-over flows (time-up, give-up), score saving, keyboard input,
// and visual state like new-best and streak toasts.
function GameArea({ difficulty, onPlayAgain, onViewScores }: GameAreaProps) {
  const {
    hiddenWord,
    guesses,
    currentGuess,
    evaluations,
    gameStatus,
    keyboardState,
    invalidWord,
    animating,
    inputDisabled,
    startedAt,
    sessionPoints,
    streak,
    timeBonus,
    streakToast,
    addLetter,
    removeLetter,
    submitGuess,
    forfeit,
    dismissStreakToast,
  } = useGame(difficulty);

  // Whether the give-up confirmation dialog is open.
  const [pendingGiveUp, setPendingGiveUp] = useState(false);
  // Prevents the time-up score-save effect from firing more than once.
  const [timeUpHandled, setTimeUpHandled] = useState(false);
  // Whether this session beats the player's previous best for this difficulty.
  const [isNewBest, setIsNewBest] = useState(false);

  const baseTimeLimit = DIFFICULTY_CONFIG[difficulty].timeLimit;
  // The player's accumulated time bonus extends the base time limit.
  const effectiveTimeLimit = useMemo(
    () => (baseTimeLimit !== null ? baseTimeLimit + timeBonus : null),
    [baseTimeLimit, timeBonus]
  );

  const { timeRemaining, isExpired } = useTimer(
    startedAt,
    effectiveTimeLimit,
    gameStatus === 'playing'
  );

  // When the timer expires: forfeit, save the score, and flag if it's a new best.
  useEffect(() => {
    if (isExpired && !timeUpHandled) {
      setTimeUpHandled(true);
      forfeit();
      if (difficulty !== 'zen') {
        const existing = loadScores();
        const bestForDiff = existing.records
          .filter((r) => r.difficulty === difficulty)
          .reduce((max, r) => Math.max(max, r.totalPoints), 0);
        if (sessionPoints > bestForDiff) setIsNewBest(true);
        saveScore({
          id: Date.now(),
          difficulty,
          maxStreak: streak,
          totalPoints: sessionPoints,
          date: Date.now(),
        });
      }
    }
  }, [isExpired, timeUpHandled, forfeit, difficulty, sessionPoints, streak]);

  // Listen for physical keyboard input (letters, Enter, Backspace).
  // Greyed-out keys on the virtual keyboard are also blocked on physical input.
  useKeyboard({
    onLetter: addLetter,
    onEnter: submitGuess,
    onBackspace: removeLetter,
    keyboardState,
    disabled: inputDisabled,
  });

  // Open the give-up confirmation dialog.
  const handleGiveUpClick = () => setPendingGiveUp(true);

  // User confirms give-up: forfeit the game and persist the session score.
  const handleConfirmGiveUp = () => {
    setPendingGiveUp(false);
    forfeit();
    if (difficulty !== 'zen') {
      const existing = loadScores();
      const bestForDiff = existing.records
        .filter((r) => r.difficulty === difficulty)
        .reduce((max, r) => Math.max(max, r.totalPoints), 0);
      if (sessionPoints > bestForDiff) setIsNewBest(true);
      saveScore({
        id: Date.now(),
        difficulty,
        maxStreak: streak,
        totalPoints: sessionPoints,
        date: Date.now(),
      });
    }
  };

  // User cancels the give-up dialog — just close it.
  const handleCancelGiveUp = () => setPendingGiveUp(false);

  const isOver = gameStatus === 'won' || gameStatus === 'lost';
  const showScores = isOver && difficulty !== 'zen';

  return (
    <div className={styles.app}>
      <Header
        onGiveUp={handleGiveUpClick}
        showGiveUp={gameStatus === 'playing'}
        timeRemaining={timeRemaining}
      />
      <main className={styles.main}>
        <StreakToast
          show={streakToast !== null}
          points={streakToast?.points ?? 0}
          streak={streakToast?.streak ?? 0}
          onDone={dismissStreakToast}
        />
        <GameBoard
          guesses={guesses}
          currentGuess={currentGuess}
          evaluations={evaluations}
          animating={animating}
        />
        <VirtualKeyboard
          keyboardState={keyboardState}
          onLetter={addLetter}
          onEnter={submitGuess}
          onBackspace={removeLetter}
          disabled={inputDisabled}
        />
      </main>
      <FeedbackToast message="Not in word list" show={invalidWord} />
      {isOver && (
        <GameOverOverlay
          status={gameStatus}
          hiddenWord={hiddenWord}
          onPlayAgain={onPlayAgain}
          score={showScores ? sessionPoints : undefined}
          streak={showScores ? streak : undefined}
          isNewBest={showScores ? isNewBest : undefined}
          onViewScores={showScores ? onViewScores : undefined}
          difficulty={showScores ? difficulty : undefined}
        />
      )}
      <ConfirmDialog
        open={pendingGiveUp}
        message="Are you sure you want to give up?"
        confirmLabel="Give Up"
        cancelLabel="Cancel"
        onConfirm={handleConfirmGiveUp}
        onCancel={handleCancelGiveUp}
      />
    </div>
  );
}

// Top-level router. Decides which screen to show based on pageView:
//   'picker' — difficulty selection
//   'game'   — active game (GameArea)
//   'scores' — high scores table (HighScoresPage)
// Also holds the mutually-agreed difficulty between App and GameArea
// and remembers the previous view so "Back" from scores works correctly.
export function App() {
  const [pageView, setPageView] = useState<PageView>(() => {
    const saved = loadGameState();
    return saved ? 'game' : 'picker';
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const saved = loadGameState();
    return (saved ? saved.difficulty : null) as Difficulty ?? 'zen';
  });
  const [previousView, setPreviousView] = useState<PageView>('picker');

  // Picked a difficulty from the picker — save preference, start the game.
  const handleDifficultyPick = (diff: Difficulty) => {
    savePreferredDifficulty(diff);
    setDifficulty(diff);
    setPageView('game');
  };

  // Play Again — wipe the saved game state and return to the picker.
  const handlePlayAgain = () => {
    clearGameState();
    setPageView('picker');
  };

  // Navigate to the high scores page, remembering where we came from.
  const handleViewScores = () => {
    setPreviousView(pageView);
    setPageView('scores');
  };

  // Go back from scores to the previous screen.
  const handleBackFromScores = () => {
    setPageView(previousView);
  };

  if (pageView === 'scores') {
    return <HighScoresPage onBack={handleBackFromScores} />;
  }

  if (pageView === 'picker') {
    return (
      <div className={styles.app}>
        <Header />
        <DifficultyPicker
          defaultDifficulty={loadPreferredDifficulty() ?? 'zen'}
          onPick={handleDifficultyPick}
        />
      </div>
    );
  }

  return (
    <GameArea
      difficulty={difficulty}
      onPlayAgain={handlePlayAgain}
      onViewScores={handleViewScores}
    />
  );
}
