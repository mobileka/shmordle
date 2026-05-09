# 0007 — Difficulty Selection & Timer

## 1. Overview

Before each new game the user picks a difficulty from a modal overlay. Non-Easy modes show a countdown timer in the header. Time runs out → game over.

## 2. Requirements

### Difficulty Levels

| Level  | Label  | Time Limit   |
|--------|--------|-------------|
| Insane | Insane | 30 seconds  |
| Hard   | Hard   | 1 minute    | ← default
| Normal | Normal | 3 minutes   |
| Easy   | Easy   | None        |

- **Default**: Hard (highlighted on first visit)
- **Persistence**: Last chosen difficulty stored in `localStorage` (key: `shmordle-preferred-difficulty`), highlighted as default next time
- **On Play Again**: Always show the picker modal
- **Immediate start**: Clicking a button or pressing Enter starts the game — no extra "Start" button

### Keyboard Navigation (Picker)

- **↑ / ↓** arrows cycle selection up/down through the 4 buttons (wrapping: ↓ on Easy → Insane, ↑ on Insane → Easy)
- **Enter** selects the highlighted difficulty and starts the game

### Timer Behavior

- **Easy**: No timer shown
- **Normal / Hard / Insane**: Countdown timer visible in the header during gameplay
- **Time runs out** → `gameStatus = 'lost'` → `GameOverOverlay` (same "Game Over" title for timeout and normal loss)
- **Timer stops**: When game ends (won/lost), timer halts
- **Persistence across refresh**: `GameState` stores `difficulty` + `startedAt`. On reload, remaining = `timeLimit - elapsed`. If elapsed ≥ timeLimit → game is already lost.
- **No Page Visibility API**: Timer keeps running even if tab is hidden

### Picker Modal Style

- Fullscreen overlay with backdrop (same pattern as `GameOverOverlay` and `ConfirmDialog`)
- Header (logo + title + ThemeToggle) still visible behind the backdrop

### Flow

```
App Load
  ├─ Saved game?
  │    └─ Yes → Resume (difficulty + remaining time from saved state)
  └─ No saved game → DifficultyPicker modal
                        └─ Click / Enter → Game starts immediately
                             ├─ Game ends → GameOverOverlay
                             └─ Play Again → Clear state → DifficultyPicker modal
```

## 3. Implementation Steps

### Step 1: Add types and config

**Modify** `src/types.ts`:

```ts
export type Difficulty = 'easy' | 'normal' | 'hard' | 'insane';

export const DIFFICULTY: Difficulty[] = ['insane', 'hard', 'normal', 'easy'];

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; timeLimit: number | null }> = {
  insane: { label: 'Insane', timeLimit: 30 },
  hard: { label: 'Hard', timeLimit: 60 },
  normal: { label: 'Normal', timeLimit: 180 },
  easy: { label: 'Easy', timeLimit: null },
};
```

Extend `GameState`:

```ts
export interface GameState {
  hiddenWord: string;
  guesses: string[];
  currentGuess: string;
  evaluations: LetterResult[][];
  gameStatus: GameStatus;
  keyboardState: Record<string, LetterStatus>;
  difficulty: Difficulty;
  startedAt: number;
}
```

### Step 2: Update storage

**Modify** `src/utils/storage.ts`:

- `isValidGameState` validates `difficulty` and `startedAt` (difficulty must be one of the valid values, startedAt must be a positive number)
- `createInitialState(difficulty: Difficulty)` accepts difficulty param, sets `startedAt: Date.now()`
- Add `savePreferredDifficulty(difficulty: Difficulty): void` using key `shmordle-preferred-difficulty`
- Add `loadPreferredDifficulty(): Difficulty | null`

### Step 3: Create `useTimer` hook

**New** `src/hooks/useTimer.ts`:

```ts
interface UseTimerResult {
  timeRemaining: number | null;
  isExpired: boolean;
}

function useTimer(startedAt: number, timeLimit: number | null, running: boolean): UseTimerResult
```

- `timeLimit === null` → `{ timeRemaining: null, isExpired: false }` (Easy mode — no timer)
- On mount: calculates remaining = `Math.max(0, timeLimit - (Date.now() - startedAt) / 1000)` rounded down
- Uses `useRef` for the interval ID and `useState` for timeRemaining
- 1-second `setInterval` tick while `running` is true; clears interval when `running` becomes false
- At 0 → `isExpired: true`, clears interval
- Cleanup interval on unmount via `useEffect` return
- Returns stable references to avoid unnecessary re-renders

### Step 4: Create `DifficultyPicker` component

**New** `src/components/DifficultyPicker.tsx` + `DifficultyPicker.module.css`:

Props:

```ts
interface Props {
  defaultDifficulty: Difficulty;
  onPick: (difficulty: Difficulty) => void;
}
```

UI:

- Fullscreen modal overlay (backdrop div with `inset: 0`, `z-index` matching existing overlays, semi-transparent background)
- Centered content panel (same layout as `GameOverOverlay` / `ConfirmDialog`)
- Title: "Choose Difficulty"
- 4 buttons stacked vertically: **Insane** → **Hard** → **Normal** → **Easy**
- Uses `DIFFICULTY` array order for rendering
- Selected button gets highlighted style (filled background); others get outline style
- Button styles match existing `.button` pattern from `GameOverOverlay.module.css`

Keyboard:

- `useEffect` adds `keydown` listener on mount
- `ArrowUp`: move selection up (decrement index, wrap to 3 if at 0)
- `ArrowDown`: move selection down (increment index, wrap to 0 if at 3)
- `Enter`: call `onPick(currentlySelectedDifficulty)`
- Cleanup listener on unmount

Layout:

```
┌───────────────────────────────┐
│                               │
│       Choose Difficulty       │
│                               │
│  ┌─────────────────────────┐  │
│  │        Insane           │  │  ← outline
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │        ■ Hard ■         │  │  ← filled (highlighted)
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │        Normal           │  │  ← outline
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │        Easy             │  │  ← outline
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘
```

### Step 5: Create `TimerDisplay` component

**New** `src/components/TimerDisplay.tsx` + `TimerDisplay.module.css`:

Props:

```ts
interface Props {
  timeRemaining: number | null;
}
```

Behavior:

- `null` → renders nothing (Easy mode or no game active)
- `> 0` → formatted as `M:SS` (e.g. `0:30`, `2:45`, `0:05`)
- `≤ 10` seconds → `color: red` + subtle CSS pulse animation
- Compact font size to ensure it fits at 320px alongside centered title and right-side actions

### Step 6: Update Header component

**Modify** `src/components/Header.tsx` + `Header.module.css`:

- Accept optional prop `timeRemaining?: number | null`
- Render `<TimerDisplay timeRemaining={timeRemaining} />` in the header
- Position timer on the left side (absolute position, `left: 0`, mirroring `actions` on the right)
- Ensure no overlap with title at any viewport width (320px–1920px)

Layout:

```
[ 0:45 ]              Shmordle               [🏳️ 🌙]
```

### Step 7: Update `useGame` hook

**Modify** `src/hooks/useGame.ts`:

New actions:

```ts
type Action =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'START_GAME'; difficulty: Difficulty }
  | { type: 'TIME_UP' }
  | { type: 'FORFEIT' };
```

Changes:

- `createInitialState(difficulty: Difficulty)` returns a `GameState` with the given difficulty and `startedAt: Date.now()`
- `START_GAME`: replaces old `NEW_GAME`, dispatches `createInitialState(action.difficulty)`
- `TIME_UP`: sets `gameStatus: 'lost'`
- Loading saved state: the existing initializer `loadGameState() ?? createInitialState('hard')` — note: this fallback is only reached if there's no saved game, which shouldn't happen since App now shows the picker instead
- Remove `restart()` callback
- Expose new `startGame(difficulty: Difficulty)` callback that clears game state and dispatches `START_GAME`
- Return `difficulty` and `startedAt` from the hook

### Step 8: Integrate into `App.tsx`

**Modify** `src/App.tsx`:

State management:

```tsx
export function App() {
  const {
    // ... existing destructured values ...
    difficulty,
    startedAt,
    startGame,
  } = useGame();

  const [showPicker, setShowPicker] = useState(() => {
    const saved = loadGameState();
    return saved === null;
  });
```

- `showPicker` initializer: if `loadGameState()` returns null (no saved game), show the picker

Picker handler:

```tsx
const handleDifficultyPick = (diff: Difficulty) => {
  savePreferredDifficulty(diff);
  startGame(diff);
  setShowPicker(false);
};
```

Play Again handler:

```tsx
const handlePlayAgain = () => {
  clearGameState();
  setShowPicker(true);
};
```

Timer:

```tsx
const timeLimit = difficulty ? DIFFICULTY_CONFIG[difficulty].timeLimit : null;
const { timeRemaining, isExpired } = useTimer(
  startedAt,
  timeLimit,
  gameStatus === 'playing'
);

useEffect(() => {
  if (isExpired) {
    // dispatch TIME_UP (need to expose timeUp callback from useGame)
  }
}, [isExpired]);
```

Render:

- Always render the app layout (Header + main area)
- `DifficultyPicker` rendered on top when `showPicker` is true
- `GameOverOverlay` rendered on top when game is over (won/lost)

Wait — need to handle the case where picker is shown AND game hasn't started yet. The game state is empty/invalid. App should conditionally render the game board + keyboard only when a game is active (not in picker mode). The simplest approach:

```
<DifficultyPicker ... />              // shown when showPicker = true
<div className={styles.app} style={{ display: showPicker ? 'none' : undefined }}>
  <Header timeRemaining={timeRemaining} ... />
  <main>...game board + keyboard...</main>
  <GameOverOverlay ... />
</div>
```

Or render both as siblings, both fullscreen overlays managed by z-index:

- Game is always rendered (but hidden when picker shows)
- Picker overlays on top

### Step 9: TDD — Write Tests

| Test File | Tests |
|-----------|-------|
| `src/hooks/useTimer.test.ts` | Counts down from timeLimit each second; returns null for null timeLimit; sets `isExpired` at 0; calculates remaining from startedAt offset; cleans interval on unmount; stops when `running` becomes false |
| `src/components/DifficultyPicker.test.tsx` | Renders 4 buttons in Insane→Hard→Normal→Easy order; highlights default difficulty; clicking a button calls `onPick` with that difficulty; ArrowDown moves selection forward (wrapping); ArrowUp moves selection backward (wrapping); Enter calls `onPick` with selected difficulty |
| `src/components/TimerDisplay.test.tsx` | Renders nothing when `timeRemaining` is null; renders formatted M:SS for normal values; applies red style when ≤10 seconds; does not apply red when >10 seconds |
| `src/App.test.tsx` | Shows picker on fresh start (no saved game); starts game on difficulty click; passes `timeRemaining` to Header for timed modes; does NOT show timer for Easy mode; time-up triggers GameOverOverlay; Play Again dismisses overlay and shows picker |

## 4. File Changes Summary

| Action | File |
|--------|------|
| **Modify** | `src/types.ts` |
| **Modify** | `src/utils/storage.ts` |
| **New**    | `src/hooks/useTimer.ts` |
| **New**    | `src/hooks/useTimer.test.ts` |
| **New**    | `src/components/DifficultyPicker.tsx` |
| **New**    | `src/components/DifficultyPicker.module.css` |
| **New**    | `src/components/DifficultyPicker.test.tsx` |
| **New**    | `src/components/TimerDisplay.tsx` |
| **New**    | `src/components/TimerDisplay.module.css` |
| **New**    | `src/components/TimerDisplay.test.tsx` |
| **Modify** | `src/hooks/useGame.ts` |
| **Modify** | `src/components/Header.tsx` |
| **Modify** | `src/components/Header.module.css` |
| **Modify** | `src/App.tsx` |
| **Modify** | `src/App.test.tsx` |
