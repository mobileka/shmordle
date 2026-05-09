# Changelog

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
