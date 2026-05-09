import { useGame } from './hooks/useGame';
import { useKeyboard } from './hooks/useKeyboard';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { FeedbackToast } from './components/FeedbackToast';
import { GameOverOverlay } from './components/GameOverOverlay';

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
    inputDisabled,
    addLetter,
    removeLetter,
    submitGuess,
    restart,
  } = useGame();

  useKeyboard({
    onLetter: addLetter,
    onEnter: submitGuess,
    onBackspace: removeLetter,
    keyboardState,
    disabled: inputDisabled,
  });

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <GameBoard
          guesses={guesses}
          currentGuess={currentGuess}
          evaluations={evaluations}
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
    </div>
  );
}
