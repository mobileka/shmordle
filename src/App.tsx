/**
 * Top-level application router.
 *
 * Decides which screen to show — difficulty picker, game, or high scores —
 * based on saved game state and user navigation. Holds the mutually-agreed
 * difficulty between App and GameArea.
 *
 * @packageDocumentation
 */

import { useState } from 'react';
import { GameArea } from './components/GameArea';
import { DifficultyPicker } from './components/DifficultyPicker';
import { HighScoresPage } from './components/HighScoresPage';
import { Header } from './components/Header';
import { loadGameState, clearGameState } from './storage/gameState';
import { savePreferredDifficulty, loadPreferredDifficulty } from './storage/difficulty';
import type { Difficulty } from './domain/types';

import styles from './App.module.css';

type PageView = 'picker' | 'game' | 'scores';

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
