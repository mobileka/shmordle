import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { useKeyboard } from './hooks/useKeyboard';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { FeedbackToast } from './components/FeedbackToast';
import { GameOverOverlay } from './components/GameOverOverlay';
import { ConfirmDialog } from './components/ConfirmDialog';

import styles from './App.module.css';

export function App() {
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
    addLetter,
    removeLetter,
    submitGuess,
    restart,
    forfeit,
  } = useGame();

  const [pendingGiveUp, setPendingGiveUp] = useState(false);

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
      <Header onGiveUp={handleGiveUpClick} showGiveUp={gameStatus === 'playing'} />
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
          onPlayAgain={restart}
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
