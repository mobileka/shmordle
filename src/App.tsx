import { useState, useEffect } from 'react';
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
import { loadGameState, clearGameState, savePreferredDifficulty, loadPreferredDifficulty } from './utils/storage';
import { DIFFICULTY_CONFIG } from './types';
import type { Difficulty } from './types';

import styles from './App.module.css';

interface GameAreaProps {
  difficulty: Difficulty;
  onPlayAgain: () => void;
}

function GameArea({ difficulty, onPlayAgain }: GameAreaProps) {
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
    addLetter,
    removeLetter,
    submitGuess,
    forfeit,
  } = useGame(difficulty);

  const [pendingGiveUp, setPendingGiveUp] = useState(false);
  const [timeUpHandled, setTimeUpHandled] = useState(false);

  const timeLimit = DIFFICULTY_CONFIG[difficulty].timeLimit;
  const { timeRemaining, isExpired } = useTimer(
    startedAt,
    timeLimit,
    gameStatus === 'playing'
  );

  useEffect(() => {
    if (isExpired && !timeUpHandled) {
      setTimeUpHandled(true);
      forfeit();
    }
  }, [isExpired, timeUpHandled, forfeit]);

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
  };
  const handleCancelGiveUp = () => setPendingGiveUp(false);

  return (
    <div className={styles.app}>
      <Header
        onGiveUp={handleGiveUpClick}
        showGiveUp={gameStatus === 'playing'}
        timeRemaining={timeRemaining}
      />
      <main className={styles.main}>
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
      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <GameOverOverlay
          status={gameStatus}
          hiddenWord={hiddenWord}
          onPlayAgain={onPlayAgain}
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
  const [difficulty, setDifficulty] = useState<Difficulty | null>(() => {
    const saved = loadGameState();
    return saved ? saved.difficulty : null;
  });

  if (difficulty === null) {
    return (
      <div className={styles.app}>
        <Header />
        <DifficultyPicker
          defaultDifficulty={loadPreferredDifficulty() ?? 'hard'}
          onPick={(diff) => {
            savePreferredDifficulty(diff);
            setDifficulty(diff);
          }}
        />
      </div>
    );
  }

  return (
    <GameArea
      difficulty={difficulty}
      onPlayAgain={() => {
        clearGameState();
        setDifficulty(null);
      }}
    />
  );
}
