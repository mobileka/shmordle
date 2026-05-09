# 0004 — Give Up Button and State Persistence

## 1. Overview

Currently, the entire game state is kept in-memory. Pressing Cmd+R loses the game and starts a new one. This spec adds:

1. **localStorage persistence** — game state is saved on every change and restored on page load. Cmd+R continues the current game.
2. **Give Up button** — a new icon button in the header (next to the theme toggle) allows the player to give up. This sets the game to `lost`, shows the existing `GameOverOverlay` revealing the hidden word, and the player can click "Play Again" to start fresh.

"Play Again" (from the overlay) clears localStorage and starts a brand new game.

## 2. Implementation Steps

### Step 1: Add localStorage persistence utilities

New file: `src/utils/storage.ts`

- Key: `shmordle-game-state`
- `saveGameState(state: GameState): void` — `JSON.stringify` to localStorage
- `loadGameState(): GameState | null` — parse, validate shape, return `null` if corrupt/missing
- `clearGameState(): void` — `localStorage.removeItem()`

Validation ensures the loaded object has the right properties and types (e.g. `hiddenWord` is a 5-letter string, `guesses` is an array, etc.). If validation fails, return `null` so a fresh game is created.

### Step 2: Update `useGame` to save/load from localStorage

In `src/hooks/useGame.ts`:

- **Initialization**: Instead of `createInitialState`, use the initializer function:
  ```ts
  useReducer(reducer, null, () => loadGameState() ?? createInitialState())
  ```
- **Save on change**: Add a `useEffect` that calls `saveGameState(state)` whenever `state` changes.
- **`forfeit` callback**: New callback that dispatches `{ type: 'FORFEIT' }`. The FORFEIT action in the reducer sets `gameStatus` to `'lost'` (keeps all other state intact — guesses, evaluations, keyboard, hiddenWord).
- **`restart` callback**: Add `clearGameState()` call before dispatching `NEW_GAME`.

The transient UI states (`animating`, `invalidWord`) are NOT persisted — they live in `useState` and are fine to reset on reload.

### Step 3: Add `FORFEIT` action to the reducer

In `src/hooks/useGame.ts`, add a new action:

```ts
case 'FORFEIT':
  return { ...state, gameStatus: 'lost' };
```

### Step 4: Create `GiveUpButton` component

New files: `src/components/GiveUpButton.tsx`, `src/components/GiveUpButton.module.css`

- SVG icon button — a white flag / surrender flag icon using `currentColor` so it adapts to the theme text color (black in light mode, white-ish in dark mode).
- Placed in the header next to the theme toggle (right side).
- Tooltip on hover via `title` attribute: "Give up"
- Visible only when `gameStatus === 'playing'`
- Renders nothing (`null`) otherwise
- Props: `onGiveUp: () => void`
- Accessible: `aria-label="Give up"`

Layout:
```
┌──────────────────────────────────────────┐
│              SHMORDLE           🏳  ☀🌙  │
└──────────────────────────────────────────┘
```

### Step 5: Integrate into `App` and `Header`

**`src/components/Header.tsx`**:
- Accepts new props: `onGiveUp?: () => void` and `showGiveUp?: boolean`
- Renders `<GiveUpButton />` next to `<ThemeToggle />` when `showGiveUp && onGiveUp` is passed

**`src/components/Header.module.css`**:
- The `toggle` class is renamed (or a wrapper div is added) to group both the GiveUp button and ThemeToggle together on the right side.

**`src/App.tsx`**:
- Extracts `forfeit` from `useGame()`
- Passes `onGiveUp={forfeit}` and `showGiveUp={gameStatus === 'playing'}` to `<Header />`

No changes needed to `GameOverOverlay` — it already handles the `lost` state correctly (shows "Game Over", reveals word, shows "Play Again").

### Step 6: TDD — Write Tests

| Test File | Tests |
|-----------|-------|
| `src/utils/storage.test.ts` | Save and load valid state; return null for missing key; return null for corrupt JSON; return null for invalid shape (missing fields, wrong types); clear removes key |
| `src/hooks/useGame.test.ts` | FORFEIT action sets gameStatus to 'lost' while keeping guesses, evaluations, keyboard, and hiddenWord intact; reducer loads from localStorage when available; restart clears localStorage |
| `src/components/GiveUpButton.test.tsx` | Renders button with correct title and aria-label; calls onGiveUp on click; renders nothing when not shown |
| `src/components/Header.test.tsx` | Updated: asserts GiveUpButton rendered when showGiveUp is true; not rendered when false |
| `src/App.test.tsx` | Give-up button appears during play and shows game-over overlay when clicked |

Existing tests should continue to pass (ensure localStorage is clean between tests — use `beforeEach` to clear, or mock localStorage).

## 3. File Changes Summary

| Action | File |
|--------|------|
| **New** | `src/utils/storage.ts` |
| **New** | `src/utils/storage.test.ts` |
| **New** | `src/components/GiveUpButton.tsx` |
| **New** | `src/components/GiveUpButton.module.css` |
| **New** | `src/components/GiveUpButton.test.tsx` |
| **Modify** | `src/hooks/useGame.ts` — add FORFEIT action, localStorage init/save, clear on restart |
| **Modify** | `src/hooks/useGame.test.ts` — FORFEIT tests, persistence tests |
| **Modify** | `src/components/Header.tsx` — accept giveUp props |
| **Modify** | `src/components/Header.module.css` — group right-side actions |
| **Modify** | `src/components/Header.test.tsx` — update assertions |
| **Modify** | `src/App.tsx` — wire forfeit to Header |
| **Modify** | `src/App.test.tsx` — give-up integration test |
