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

type PageView = 'picker' | 'game' | 'scores';

interface GameAreaProps {
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onViewScores: () => void;
}

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

  const [pendingGiveUp, setPendingGiveUp] = useState(false);
  const [timeUpHandled, setTimeUpHandled] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const baseTimeLimit = DIFFICULTY_CONFIG[difficulty].timeLimit;
  const effectiveTimeLimit = useMemo(
    () => (baseTimeLimit !== null ? baseTimeLimit + timeBonus : null),
    [baseTimeLimit, timeBonus]
  );

  const { timeRemaining, isExpired } = useTimer(
    startedAt,
    effectiveTimeLimit,
    gameStatus === 'playing'
  );

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

  useKeyboard({
    onLetter: addLetter,
    onEnter: submitGuess,
    onBackspace: removeLetter,
    keyboardState,
    disabled: inputDisabled,
  });

  const handleGiveUpClick = () => setPendingGiveUp(true);
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

  const handleDifficultyPick = (diff: Difficulty) => {
    savePreferredDifficulty(diff);
    setDifficulty(diff);
    setPageView('game');
  };

  const handlePlayAgain = () => {
    clearGameState();
    setPageView('picker');
  };

  const handleViewScores = () => {
    setPreviousView(pageView);
    setPageView('scores');
  };

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
