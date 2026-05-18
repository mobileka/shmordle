/**
 * Game area component.
 *
 * Wraps the game board, keyboard, overlays, and timer for a single game run.
 * Handles game-over flows (time-up, give-up), keyboard input, and visual
 * state like new-best and streak toasts.
 *
 * @packageDocumentation
 */

import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../hooks/useGame';
import { useKeyboard } from '../hooks/useKeyboard';
import { useTimer } from '../hooks/useTimer';
import { Header } from './Header';
import { GameBoard } from './GameBoard';
import { VirtualKeyboard } from './VirtualKeyboard';
import { FeedbackToast } from './FeedbackToast';
import { GameOverOverlay } from './GameOverOverlay';
import { ConfirmDialog } from './ConfirmDialog';
import { StreakToast } from './StreakToast';
import { DIFFICULTY_CONFIG } from '../domain/types';
import type { Difficulty } from '../domain/types';

import styles from '../App.module.css';

interface Props {
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onViewScores: () => void;
}

export function GameArea({ difficulty, onPlayAgain, onViewScores }: Props) {
  const {
    hiddenWord,
    guesses,
    currentGuess,
    evaluations,
    gameStatus,
    virtualKeyboardState,
    invalidWord,
    animating,
    inputDisabled,
    startedAt,
    sessionPoints,
    streak,
    timeBonus,
    streakToast,
    isNewBest,
    addLetter,
    removeLetter,
    submitGuess,
    forfeit,
    dismissStreakToast,
  } = useGame(difficulty);

  const [pendingGiveUp, setPendingGiveUp] = useState(false);

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
    if (isExpired) {
      forfeit();
    }
  }, [isExpired, forfeit]);

  useKeyboard({
    onLetter: addLetter,
    onEnter: submitGuess,
    onBackspace: removeLetter,
    virtualKeyboardState,
    disabled: inputDisabled,
  });

  const handleGiveUpClick = () => setPendingGiveUp(true);
  const handleConfirmGiveUp = () => {
    setPendingGiveUp(false);
    forfeit();
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
          virtualKeyboardState={virtualKeyboardState}
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
