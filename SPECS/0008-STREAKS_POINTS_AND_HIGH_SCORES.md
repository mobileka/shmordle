# 0008 — Streaks, Points & High Scores

## 1. Overview

This spec introduces a **scoring and streak system** for timed game modes. After guessing a word correctly, the player earns points based on how much time they had left multiplied by their current win streak. The timer then gets a time bonus and the next round begins automatically — the run continues until the player loses. When they finally lose, their session score (total points, max streak) is saved and compared against their personal bests for that difficulty. A new **High Scores** page lets players browse their history per game mode.

### Zen mode

The old Easy mode is renamed to **Zen** (🧘). It has no timer, no streaks, no points, and no automatic round continuation. It's a pressure-free experience: guess the word at your own pace, win or lose, then play again. Nothing is recorded.

### Mode renames

Normal is now **Relaxed**, Hard and Insane stay the same. The old type values (`'easy'`, `'normal'`) are replaced with `'zen'` and `'relaxed'` throughout the codebase.

### Difficulty picker

The picker now lists modes from least to most stressful: Zen (default, top) → Relaxed → Hard → Insane.

## 2. Scoring (Relaxed, Hard, Insane only)

- **Streak**: starts at 1, increments each win, resets to 0 on loss/give-up/time-up
- **Points per round win**: `remainingSeconds × currentStreak`
- **Session points**: sum of all round points in this run
- **Time bonus on win**: remaining timer gets the full difficulty time limit added
- **Timer animation on win**: timer turns red, numbers quickly count up from old value to new (~500ms `requestAnimationFrame` loop)

## 3. Game Flow

### Zen mode

No change. Win/loss → standard overlay → Play Again → picker.

### Relaxed / Hard / Insane

**On win:**
1. Points = `remaining × streak`, accumulate to `sessionPoints`, `streak++`
2. Timer gets bonus — red color, count-up animation
3. Streak toast: "+X pts · streak Y" — fast bounce animation, red flash briefly, auto-dismisses ~1.5s
4. New word, board clears instantly (no tile-flip animation delay), game continues immediately

**On loss / time-up / give-up:**
1. `ScoreRecord` saved to `shmordle-scores`:
   ```ts
   { id: number, difficulty: Difficulty, maxStreak: number, totalPoints: number, date: number }
   ```
2. Check if `totalPoints` > previous best for this difficulty → `isNewBest`
3. `GameOverOverlay` shows:
   - "Scored X points · Streak Y"
   - If `isNewBest`: "New personal best for Insane!"
   - "View High Scores" button → High Scores page
   - "Play Again" button → picker

## 4. High Scores Page

- **Full page** replacing game view
- **3 mode tabs at top**: Insane (default), Hard, Relaxed
- Only one mode's scores visible at a time
- **Table**: Date | Streak | Points, sorted newest first
- **Absolute dates** (e.g. "May 9, 2026")
- **Reset Scores** button per-mode (clears only the selected mode, with confirmation dialog)
- **Back** button → picker
- **Empty state**: "No scores yet. Play Relaxed, Hard, or Insane to record your score!"
- Data key: `shmordle-scores`

## 5. Streak Toast

- Compact, top center, non-blocking (similar to `FeedbackToast`)
- Fast bounce-in animation, red flash for ~300ms, then fades out
- Auto-dismiss ~1.5s total

## 6. Breaking Changes

| Old       | New       | Label       |
|-----------|-----------|-------------|
| `'easy'`  | `'zen'`   | 🧘 Zen      |
| `'normal'`| `'relaxed'`| Relaxed    |

Old values in localStorage become invalid → graceful fallback to defaults.

## 7. Implementation Steps

### Step 1: Rename types everywhere

**Modify** `src/types.ts`:
- `Difficulty`: `'easy'` → `'zen'`, `'normal'` → `'relaxed'`
- `DIFFICULTY`: `['zen', 'relaxed', 'hard', 'insane']`
- `DIFFICULTY_CONFIG`: keys and labels updated

**Modify** `src/utils/storage.ts`: `VALID_DIFFICULTIES` updated

**Modify** all test files: replace `'easy'` → `'zen'`, `'normal'` → `'relaxed'`, update picker order and default expectations

### Step 2: Add new types

**Modify** `src/types.ts`:
```ts
export interface ScoreRecord {
  id: number;
  difficulty: Difficulty;
  maxStreak: number;
  totalPoints: number;
  date: number;
}

export interface ScoresData {
  records: ScoreRecord[];
}
```

Extend `GameState`:
```ts
streak: number;
sessionPoints: number;
timeBonus: number;
```

### Step 3: Add score storage functions

**Modify** `src/utils/storage.ts`:
- `saveScore(record)` — append to `shmordle-scores` array
- `loadScores()` — returns `ScoresData`
- `clearScores(difficulty)` — removes records for given difficulty only
- Update `isValidGameState` for new fields
- `createInitialState`: streak=1, sessionPoints=0, timeBonus=0

### Step 4: Make `useTimer` reactive

**Modify** `src/hooks/useTimer.ts`:
- Add `useEffect` watching `startedAt` and `timeLimit` — recalculates `timeRemaining`
- This enables the growing effective time limit from accumulated bonus

### Step 5: Add `ROUND_WIN` action

**Modify** `src/hooks/useGame.ts`:

```ts
{ type: 'ROUND_WIN'; points: number; newWord: string }
```

Handler: `streak++`, `sessionPoints += points`, `timeBonus += timeLimit`, new word, clear guesses/evaluations, keep keyboardState, status → `'playing'`

### Step 6: Restructure `submitGuess` for auto-continue

**Modify** `src/hooks/useGame.ts`:

In callback, after validation:
```ts
const isWin = state.currentGuess === state.hiddenWord;
const isNonZen = state.difficulty !== 'zen';

if (isWin && isNonZen) {
  // calculate remaining, points, dispatch ROUND_WIN
  // show streak toast, no animation lock
  return;
}
// normal SUBMIT_GUESS + animation for zen/non-win
```

### Step 7: Create `StreakToast` component

**New**: `src/components/StreakToast.tsx` + `.module.css` + tests
- Bounce-in animation, red flash, auto-dismiss 1.5s
- Show/hide controlled by parent

### Step 8: Update `TimerDisplay` for win animation

**Modify** `src/components/TimerDisplay.tsx` + `.module.css`:
- Ref-based prev-value tracking
- Count-up animation on increase (~500ms, red flash)
- `requestAnimationFrame` interpolation

### Step 9: Create `HighScoresPage` component

**New**: `src/components/HighScoresPage.tsx` + `.module.css` + tests

### Step 10: Update `GameOverOverlay`

**Modify** `src/components/GameOverOverlay.tsx` + `.module.css` + tests:
- Optional `score`, `streak`, `isNewBest`, `onViewScores`, `difficulty` props
- Display when provided (non-Zen loss only)

### Step 11: Integrate into App

**Modify** `src/App.tsx` + `src/App.test.tsx`:
- `currentView` state: `'picker' | 'game' | 'scores'`
- `effectiveTimeLimit = baseTimeLimit + timeBonus` → `useTimer`
- Compute `isNewBest` on game over, wire to overlay
- Navigate between views

## 8. File Changes Summary

| Action | File |
|--------|------|
| **Modify** | `src/types.ts` |
| **Modify** | `src/utils/storage.ts` |
| **Modify** | `src/hooks/useTimer.ts` |
| **Modify** | `src/hooks/useGame.ts` |
| **New**    | `src/components/StreakToast.tsx` + `.css` + `.test.tsx` |
| **Modify** | `src/components/TimerDisplay.tsx` + `.css` + `.test.tsx` |
| **New**    | `src/components/HighScoresPage.tsx` + `.css` + `.test.tsx` |
| **Modify** | `src/components/GameOverOverlay.tsx` + `.css` + `.test.tsx` |
| **Modify** | `src/components/DifficultyPicker.test.tsx` |
| **Modify** | `src/components/Header.test.tsx` |
| **Modify** | `src/hooks/useGame.test.ts` |
| **Modify** | `src/hooks/useTimer.test.ts` |
| **Modify** | `src/utils/storage.test.ts` |
| **Modify** | `src/App.tsx` + `src/App.test.tsx` |
