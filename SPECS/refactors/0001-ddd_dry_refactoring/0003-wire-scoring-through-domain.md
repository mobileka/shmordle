# 0003 — Wire Scoring Through the Domain (Phase 3 of DDD refactor)

## Goal

Move all scoring logic out of App.tsx and into the domain layer. Fix the bug where losing by 6 wrong guesses never saves a score. Remove guard flags and duplication.

## Bugs fixed

- 6-wrong-guesses loss path doesn't save a score — only timer expiry and give-up saved scores. With a single `useEffect` on `gameStatus === 'lost'`, all three loss paths are covered.

## Domain changes (`src/domain/game.ts`)

### New: `gameId` on GameState

`createGame()` generates it: `gameId: crypto.randomUUID()`.

### Changed: ScoreRecord.id

From `number` to `string`. Set to `state.gameId` in `buildScoreRecord`.

### Changed: `buildScoreRecord`

Uses `state.gameId` instead of `Date.now()` for id.

### Changed: `isPersonalBest` signature

```ts
isPersonalBest(records: ScoreRecord[], difficulty: Difficulty, totalPoints: number): boolean
```

Takes difficulty and totalPoints directly instead of a ScoreRecord.

### New: `finalizeGameScore`

Orchestrates the full scoring flow (domain calls infrastructure):

```ts
export function finalizeGameScore(state: GameState): boolean | null
```

Returns `null` for zen or non-lost states, `boolean` (isNewBest) otherwise.

### Changed: `forfeit`

Added guard: returns state unchanged if `gameStatus !== 'playing'` — prevents redundant re-renders from repeated calls.

## Infrastructure changes (`src/infrastructure/storage.ts`)

### Changed: `saveScore` deduplicates by gameId

Finds existing record by id → overwrites if found, appends otherwise.

### Changed: `isValidGameState` — optional gameId

Accepts missing gameId for backward compat with legacy saved states.

### Changed: `loadGameState` — migration

Assigns `gameId = crypto.randomUUID()` to loaded states that lack one.

## Application changes (`src/hooks/useGame.ts`)

Added `isNewBest` state and scoring effect:

```ts
useEffect(() => {
  const result = finalizeGameScore(state);
  if (result !== null) setIsNewBest(result);
}, [state]);
```

No direct `loadScores`/`saveScore` import needed.

## UI changes (`src/App.tsx`)

**Removed:**
- `timeUpHandled` guard state
- `isNewBest` local state — comes from hook now
- Timer expiry score-saving block (forfeit-only now)
- `handleConfirmGiveUp` score-saving block
- `loadScores` and `saveScore` imports

**Added:**
- `isNewBest` from `useGame()` destructuring

## Files

| Action | File |
|--------|------|
| **Modify** | `src/domain/types.ts` |
| **Modify** | `src/domain/game.ts` |
| **Modify** | `src/domain/game.test.ts` |
| **Modify** | `src/infrastructure/storage.ts` |
| **Modify** | `src/infrastructure/storage.test.ts` |
| **Modify** | `src/hooks/useGame.ts` |
| **Modify** | `src/hooks/useGame.test.ts` |
| **Modify** | `src/App.tsx` |
| **Modify** | `src/components/HighScoresPage.test.tsx` |

## Verification

`npm run check` passes. All tests green. All three loss paths save scores via one effect.
