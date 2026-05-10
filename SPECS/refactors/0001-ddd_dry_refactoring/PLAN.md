# 0001 — DDD & DRY Refactoring

## Motivation

The codebase has no domain model. Game logic, scoring, persistence, and UI are tangled together. Concrete symptoms:

1. Score-saving logic duplicated in two places inside `App.tsx`
2. One loss path (6 wrong guesses) doesn't save at all
3. `saveScore` is a blind `array.push()` with no identity check
4. `useGame` mixes state machine, scoring, persistence, and UI state
5. `useTimer` is separate from `useGame` but deeply coupled
6. `App.tsx` is a god object orchestrating everything

Fixing these one-by-one would be patching symptoms. The real fix is establishing proper layers.

## Architecture

```
src/
  domain/           — Pure logic, zero React, zero localStorage
    types.ts        — All types, config, constants
    game.ts         — State machine, scoring, game rules
    evaluation.ts   — Wordle tile coloring
    dictionary.ts   — Word list, validation, random pick
  infrastructure/   — I/O adapters
    storage.ts      — All localStorage: game state, scores, preferences
  application/      — React hooks (thin wrappers)
    useGame.ts      — Connects domain game to React + storage
    useTimer.ts     — Wraps domain timer calc in React intervals
    useKeyboard.ts  — Physical keyboard listener
    useTheme.ts     — Theme toggle
  components/       — Pure UI rendering
  data/             — Static data (words.json)
```

## Layer responsibilities

### Domain (no side effects, pure functions)

Owns types and game rules. Knows what a valid game state looks like, how to transition it, how to score it, how to build a score record from it. Does NOT know about localStorage, React, or any I/O.

### Infrastructure (I/O only)

Owns localStorage keys and serialization. Knows how to persist and load data. Handles deduplication — it owns the data, so it decides what "duplicate" means. Does NOT know about game rules or React.

### Application (React wiring)

Thin hooks that connect domain to infrastructure. Observe state, delegate to domain for transformations, delegate to infrastructure for persistence. No business logic. No guard flags.

### Components (pure UI)

Render what they're given. Call handlers when clicked. No business logic, no I/O.

## Phases

Each phase passes `npm run check` independently.

---

### Phase 1: File reorganization

Move files into layers. Update all import paths. Zero logic changes.

| From | To |
|------|-----|
| `src/types.ts` | `src/domain/types.ts` |
| `src/utils/evaluation.ts` | `src/domain/evaluation.ts` |
| `src/utils/dictionary.ts` | `src/domain/dictionary.ts` |
| `src/utils/storage.ts` | `src/infrastructure/storage.ts` |

Update all imports across the codebase. Update test imports. Delete old files.

---

### Phase 2: Extract pure domain logic

Pull pure functions out of hooks and into `src/domain/game.ts`:

```
createGame(difficulty)        → GameState
gameReducer(state, action)    → GameState
calculatePoints(state, rem)   → number
getRemainingTime(at, limit)   → number
mergeKeyboardState(...)       → Record<string, LetterStatus>
statusPriority(status)        → number
buildScoreRecord(state)       → ScoreRecord
isPersonalBest(records, r)    → boolean
```

`useGame.ts` updates to import from domain instead of having inline logic. `useTimer.ts` imports `getRemainingTime` instead of its own duplicate `calcRemaining`. All existing behavior preserved.

---

### Phase 3: Wire scoring through the domain

This is where the bugs get fixed — as a natural consequence of the clean architecture.

**Domain changes:**

- `GameState` gets `gameId: string`, generated in `createGame()` via `crypto.randomUUID()`
- `ScoreRecord.id` becomes `string` (was `number`). Set to `gameId` — no separate identity needed
- `buildScoreRecord(state): ScoreRecord` — pure function, builds from game state fields
- `isPersonalBest(records, record): boolean` — pure function, from logic currently in `App.tsx`

**Infrastructure changes:**

- `saveScore()` deduplicates by `gameId`: if a record with this ID exists, overwrite it. Otherwise append.

```ts
export function saveScore(record: ScoreRecord): void {
  const data = loadScores();
  const idx = data.records.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    data.records[idx] = record;
  } else {
    data.records.push(record);
  }
  localStorage.setItem(SCORES_KEY, JSON.stringify(data));
}
```

**Application changes (`useGame.ts`):**

One effect. No guards. No refs. No `timeUpHandled`. The presentation layer is dumb:

```ts
useEffect(() => {
  if (state.gameStatus === 'lost' && state.difficulty !== 'zen') {
    saveScore(buildScoreRecord(state));
  }
}, [state.gameStatus]);
```

If `gameStatus` is `'lost'`, save. Could fire 1000 times — the infrastructure handles duplicates. This covers all three loss paths (timer, give-up, 6 wrong guesses) because they all flow through the same reducer and result in `gameStatus: 'lost'`.

**UI changes (`App.tsx`):**

- Remove both duplicated score-saving blocks (time-up `useEffect`, `handleConfirmGiveUp`)
- Remove `loadScores`/`saveScore` imports
- `isNewBest` computed inline from `loadScores()` when needed (in `GameOverOverlay` context), or moved into `useGame` return value

---

### Summary

After Phase 3:

- All game logic lives in `domain/` — pure, testable, no React
- All I/O lives in `infrastructure/` — one place to change storage strategy
- Hooks are thin adapters — no business logic, no guard flags
- Components are pure rendering — no business logic, no I/O
- Score save fires from one place, covers all loss paths, can't duplicate

## Files

| Action | File | Phase |
|--------|------|-------|
| **Move** | `src/types.ts` → `src/domain/types.ts` | 1 |
| **Move** | `src/utils/evaluation.ts` → `src/domain/evaluation.ts` | 1 |
| **Move** | `src/utils/dictionary.ts` → `src/domain/dictionary.ts` | 1 |
| **Move** | `src/utils/storage.ts` → `src/infrastructure/storage.ts` | 1 |
| **New** | `src/domain/game.ts` | 2 |
| **Modify** | `src/domain/types.ts` — add `gameId` to `GameState`, change `ScoreRecord.id` to `string` | 3 |
| **Modify** | `src/hooks/useGame.ts` — import domain, move score save here | 2,3 |
| **Modify** | `src/hooks/useTimer.ts` — import `getRemainingTime` from domain | 2 |
| **Modify** | `src/infrastructure/storage.ts` — dedup by `gameId` in `saveScore` | 3 |
| **Modify** | `src/App.tsx` — remove duplicate score-saving blocks | 3 |
| **Delete** | `src/utils/` directory (after moves) | 1 |
| **Modify** | All import paths across codebase | 1 |
| **Modify** | All test import paths | 1 |
