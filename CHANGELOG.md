# Changelog

## [0.3.0] — 2026-05-09

### Added

- Difficulty picker modal before each game with 4 modes: Zen, Relaxed, Hard, Insane.
- Countdown timer in the header for timed modes (Hard: 1 min, Insane: 30 sec, Relaxed: 3 min). Timer turns red and pulses when ≤10 seconds.
- Keyboard navigation (↑/↓/Enter) in the difficulty picker. Preference persisted to localStorage.
- Streaks and scoring system for non-Zen modes. Points = remaining seconds × streak on each correct guess. Streak increments on each win and resets on loss.
- Auto-continue: winning a round on non-Zen modes awards a time bonus (equal to the difficulty time limit), clears the board, and starts a new word immediately.
- Timer count-up animation (turns red, numbers climb) when time bonus is awarded.
- Streak toast: "+X pts · streak Y" with bounce and red flash animation, shown on each non-Zen win.
- High Scores page with per-mode tabs (Insane, Hard, Relaxed). Table shows Date, Streak, and Points. Filter by mode, reset scores per mode.
- Game-over overlay now shows score and streak info on non-Zen losses. "New personal best" badge when beating a previous high score.
- 91 new tests, bringing total to 231 across 22 test files.

### Changed

- Easy mode renamed to Zen (🧘).
- Normal mode renamed to Relaxed.
- Difficulty picker order: Zen (default) → Relaxed → Hard → Insane.
- Zen mode has no timer, no streaks, no points — untouched from the original experience.

### Fixed

- Keyboard state now resets between rounds in auto-continue (absent letters no longer block input on the next word).
- Back from High Scores now returns to the game-over screen instead of the difficulty picker.
- Score saving now triggers correctly on give-up and time-up.

## [0.2.0] — 2026-05-09

### Added

- Game state persistence via localStorage. The game continues after a page refresh (Cmd+R).
- Give Up button (flag icon in the header, next to theme toggle). Forfeits and shows the game-over overlay with the hidden word revealed.
- 44 new tests across 5 files, bringing total to 138.

## [0.1.0] — 2026-05-09

### Added

- Full test suite: 94 tests across 12 files using Vitest + Testing Library. Covers pure functions (evaluateGuess, isValidWord, getRandomWord), state machine (statusPriority, mergeKeyboardState, reducer), hooks (useGame, useKeyboard), all 7 components, and App integration.

### Fixed

- Re-triggering tile flip animation when typing and clearing the next row. The animation on the previous row no longer replays when the current guess becomes empty again. Fixed by guarding the animation trigger with the `animating` flag from `useGame`, which is only true during the 1600ms window after a genuine submission.
