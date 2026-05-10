# 0002 — Extract Pure Domain Logic (Phase 2 of DDD refactor)

## Goal

Create `src/domain/game.ts` containing all pure game logic extracted from hooks. Hooks become thin adapters. Zero behavior changes.

## New file: `src/domain/game.ts`

### Functions extracted

| Function | Source | Description |
|----------|--------|-------------|
| `createGame(difficulty)` | `useGame.ts:createInitialState` | Fresh `GameState` with random word |
| `gameReducer(state, action)` | `useGame.ts:reducer` | State machine for all game actions |
| `statusPriority(status)` | `useGame.ts:statusPriority` | Numeric priority for letter status (3→correct, 2→present, 1→absent, 0→default) |
| `mergeKeyboardState(current, evaluation)` | `useGame.ts:mergeKeyboardState` | Upgrade-only keyboard state merge |
| `calculatePoints(streak, remainingTime)` | inline in `useGame.ts:submitGuess` | `streak × remainingTime` |
| `getRemainingTime(startedAt, timeLimit)` | `useTimer.ts:calcRemaining` | `Math.max(0, Math.floor(timeLimit - elapsed))` |
| `buildScoreRecord(state)` | inline in `App.tsx` | Builds `ScoreRecord` from `GameState` fields |
| `isPersonalBest(records, record)` | inline in `App.tsx` | Check if score record beats same-difficulty best |

`Action` union type also moves to `game.ts`.

Imports from other domain files: `types.ts` (types, config), `evaluation.ts` (`evaluateGuess`), `dictionary.ts` (`getRandomWord`).

No React. No localStorage. All functions pure.

## Modifications

### `src/hooks/useGame.ts`

| Remove | Add |
|--------|-----|
| `createInitialState` definition | `import { createGame } from '../domain/game'` |
| `statusPriority`, `mergeKeyboardState` definitions | `import { statusPriority, mergeKeyboardState } from '../domain/game'` |
| `reducer` definition | `import { gameReducer } from '../domain/game'` |
| `Action` type | No longer needed in hook (inferred from reducer) |
| `import { evaluateGuess }` | Removed (now inside domain) |
| `import type { GameState, LetterResult, LetterStatus }` | Removed (unused in hook) |
| Inline `remaining * state.streak` | `import { calculatePoints } from '../domain/game'` |

Kept: `isValidWord`, `getRandomWord` from `dictionary` (used in hook's `submitGuess` callback).

### `src/hooks/useTimer.ts`

| Remove | Add |
|--------|-----|
| `calcRemaining` definition | `import { getRemainingTime } from '../domain/game'` |
| All calls to `calcRemaining(...)` | Replace with `getRemainingTime(...)` |

### `src/App.tsx`

No changes in Phase 2.

## Tests

### New: `src/domain/game.test.ts`

Unit tests for all exported functions: `createGame`, `gameReducer` (all 7 actions + unknown action), `statusPriority`, `mergeKeyboardState`, `calculatePoints`, `getRemainingTime`, `buildScoreRecord`, `isPersonalBest`.

### Modified: `src/hooks/useGame.test.ts`

- Removed tests for `statusPriority`, `mergeKeyboardState`, `reducer` (moved to `game.test.ts`)
- Removed `makeState` helper (only used by removed reducer tests)
- Simplified imports

### `src/hooks/useTimer.test.ts`

No test changes needed.

## Files

| Action | File |
|--------|------|
| **New** | `src/domain/game.ts` |
| **New** | `src/domain/game.test.ts` |
| **Modify** | `src/hooks/useGame.ts` |
| **Modify** | `src/hooks/useGame.test.ts` |
| **Modify** | `src/hooks/useTimer.ts` |

## Verification

`npm run check` passes. All tests green. No behavioral changes.
