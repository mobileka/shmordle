# Shmordle — Wordle-like Game Specification

---

## Game Overview

Shmordle is a word-guessing game inspired by Wordle (NY Times). The game has a large pool of 5-letter words. The player sees a 5×6 grid (5 columns, 6 rows) and a QWERTY on-screen keyboard. The computer picks a hidden word. The player guesses 5-letter words to figure out the hidden word. After each guess, the game colors each letter tile to give feedback: green (correct position), orange (wrong position), grey (not in word at all).

---

## Tech Stack

- **React 19 + TypeScript + Vite**
- **CSS Modules** for scoped styling
- No router, no extra libraries, no state management library

---

## Core Types

```typescript
type LetterStatus = 'absent' | 'present' | 'correct' | 'default';

interface LetterResult {
  letter: string;
  status: LetterStatus;
}

interface GameState {
  hiddenWord: string;
  guesses: string[];
  currentGuess: string;
  evaluations: LetterResult[][];
  gameStatus: 'playing' | 'won' | 'lost';
  keyboardState: Record<string, LetterStatus>;
}
```

---

## Step-by-step Game Logic

### Step 1: Initialization

1. Load a dictionary of 5-letter words from `src/data/words.json
2. The word list will be provided separately (public domain 5-letter word list).
2. On game start, pick a random word from the dictionary — this is the **hidden word**. Do NOT show it to the player.
3. Reset all game state: empty guesses, empty current guess, clear evaluations, reset keyboard to default.

### Step 2: Player Input

The player types a 5-letter word. Both input methods work:

**On-screen keyboard:**
- Shows a QWERTY layout with rows:
  ```
  Q W E R T Y U I O P
   A S D F G H J K L
    Z X C V B N M   ⌫
  ```
- Bottom row also includes a wide `Enter` key.
- Clicking a letter adds it to `currentGuess`.
- Clicking `⌫` (Backspace) removes the last letter.
- Clicking `Enter` submits the guess.

**Physical keyboard:**
- A `keydown` listener on `window` captures physical keypresses.
- Only these keys are processed: `a-z` / `A-Z` (treated as uppercase), `Backspace`, `Enter`.
- All other keys (numbers, punctuation, symbols, etc.) are ignored completely. The user should be able to press anything they want — only English letters, Backspace, and Enter have an effect.

**Both keyboards:**
- Grey (`absent`) keys are **disabled and unclickable** on the on-screen keyboard. If the user presses a grey key on the physical keyboard, the input is **blocked** — nothing happens.
- Green (`correct`) and Orange (`present`) keys **remain clickable and typeable**.
- `currentGuess` is capped at 5 characters. Extra letters are ignored.
- `Enter` does nothing if `currentGuess` has fewer than 5 letters.

### Step 3: Submission — Dictionary Validation

When the player presses `Enter` with exactly 5 letters in `currentGuess`:

1. **Check if `currentGuess` exists in the dictionary.**
2. **If the word is NOT in the dictionary:**
   - Show feedback to the player: "Not in word list" (a toast that auto-dismisses after ~2 seconds).
   - Do **NOT** evaluate any letters.
   - Do **NOT** advance to the next row.
   - The player can edit the word and try again.
3. **If the word IS in the dictionary:**
   - Proceed to Step 4 (Letter Evaluation).

### Step 4: Letter Evaluation

Compare each letter of the player's guess to the hidden word using a **frequency-counter algorithm**:

**Example: hidden word is `AUDIO`, player guesses `RADIO`.**

- `R` at position 0: Does `R` exist anywhere in `AUDIO`? No → **Grey (absent)**. The R key on the keyboard also becomes grey and disabled.
- `A` at position 1: Does `A` exist in `AUDIO`? Yes. Is it at position 1? No (it's at position 0 in `AUDIO`) → **Orange (present)**. The A key on the keyboard becomes orange.
- `D` at position 2: Does `D` exist in `AUDIO`? Yes. Is it at position 2? Yes → **Green (correct)**. The D key on the keyboard becomes green.
- `I` at position 3: Does `I` exist in `AUDIO`? Yes. Is it at position 3? Yes → **Green (correct)**.
- `O` at position 4: Does `O` exist in `AUDIO`? Yes. Is it at position 4? Yes → **Green (correct)**.

Result: `RADIO` → `[absent, present, correct, correct, correct]`

**Algorithm (handles duplicate letters correctly):**

```
1. Build a frequency map of letters in hiddenWord (e.g., hidden "SPEED" → {S:1, P:1, E:2, D:1}).
2. First pass — mark CORRECT (green):
   For each position i:
     if guess[i] === hiddenWord[i] → mark 'correct', decrement freq[guess[i]]
3. Second pass — mark PRESENT (orange):
   For each remaining unmarked position i:
     if freq[guess[i]] > 0 → mark 'present', decrement freq[guess[i]]
4. All remaining unmarked positions → mark 'absent' (grey).
```

**Example: hidden `"SPEED"`, guess `"SLEEP"`:**
- Pass 1: S→correct (freq S→0), L→unmarked, E→correct (freq E→1), E→unmarked (freq E→0 now, both E's used), P→unmarked
- Pass 2: L→absent (freq L→0), E→absent (freq E→0), P→absent (freq P→0)
- Result: `['correct', 'absent', 'correct', 'absent', 'absent']`

### Step 5: Animation

After evaluation, animate the tiles before showing the result:

1. **Block all input** during animation.
2. Process tiles **left to right**, one by one.
3. Each tile takes **300ms** to flip (CSS `rotateX` 3D transform for a physical flip effect):
   - Face shows the letter → flips 90deg (disappears) → background color changes to green/orange/grey → flips back to show the colored face.
4. Total animation time: 5 tiles × 300ms = 1500ms.
5. After all tiles have flipped, input is unblocked and the game advances.

### Step 6: Advance to Next Row

1. Append the evaluated `currentGuess` and its `LetterResult[]` to `guesses` and `evaluations`.
2. Clear `currentGuess` for the next row.
3. Update `keyboardState` using **best-status-wins** priority:
   - `correct` (green) > `present` (orange) > `absent` (grey) > `default`
   - Once a letter is `absent`, it is greyed and disabled.
   - A later guess can **upgrade** the status (e.g., grey → orange → green), re-enabling the key.
4. Set the active row to the next row (row index + 1).

### Step 7: Win / Lose Conditions

**Win condition:** The player's guess matches the hidden word exactly (`currentGuess === hiddenWord`).
- Show a congratulations overlay/message.
- Show a "Play Again" button.

**Lose condition:** The player has filled all 6 rows without guessing the hidden word.
- Show "Game Over" and reveal the hidden word.
- Show a "Play Again" button.

When "Play Again" is clicked: pick a new random hidden word, reset all state (board, keyboard, guesses, etc.).

---

## Component Tree

```
<App>
  <Header />                          — Title bar
  <GameBoard>                         — The 5×6 grid
    <GridRow /> ×6                    — One row per guess
      <GridCell /> ×5                — One tile per letter
  </GameBoard>
  <FeedbackToast />                   — "Not in word list" notification
  <VirtualKeyboard />                 — QWERTY on-screen keyboard
  <GameOverOverlay />                 — Win/lose overlay with Play Again
</App>
```

---

## File Structure

```
src/
  main.tsx
  index.css                     — Global resets, fonts
  App.tsx
  App.module.css
  types.ts                      — Shared types
  components/
    Header.tsx + .module.css
    GameBoard.tsx + .module.css
    GridRow.tsx + .module.css
    GridCell.tsx + .module.css
    VirtualKeyboard.tsx + .module.css
    FeedbackToast.tsx + .module.css
    GameOverOverlay.tsx + .module.css
  hooks/
    useGame.ts                  — All game state & logic
    useKeyboard.ts              — Physical keyboard listener
  utils/
    evaluation.ts               — evaluateGuess() function
    dictionary.ts               — Load dictionary, validate, pick random
  data/
    words.txt                   — Public domain 5-letter word list
```

---

## UI States Summary

| State | What the player sees |
|-------|---------------------|
| Playing | 5×6 grid with active row (cursor), on-screen keyboard, all letters default |
| Typing | Letters appear in active row squares, one per cell |
| Invalid word | Toast: "Not in word list" appears, auto-dismisses after ~2s, no evaluation |
| Animating (submission) | Tiles flip one by one with color reveal, input blocked |
| Row complete | Colored tiles, cursor moves to next row |
| Won | Congratulations overlay, hidden word revealed, Play Again button |
| Lost | "Game Over" overlay, hidden word revealed, Play Again button |
| Post-game | All input ignored until Play Again is clicked |

---

## Edge Cases

1. **Duplicate letters in guess, single in hidden**: Only the first match (position-wise) gets green or orange. The duplicate gets grey. (Handled by the frequency-counter algorithm.)
2. **Duplicate letter in hidden, single in guess**: The one match gets green/orange correctly. The extra hidden letter is irrelevant since it's not guessed.
3. **Enter pressed with <5 letters**: No-op.
4. **Pressing a grey (absent) key on physical keyboard**: The keydown handler returns early. Nothing happens.
5. **Clicking a grey (absent) key on on-screen keyboard**: The click handler does nothing.
6. **All 6 guesses used without a correct guess**: Game lost.
7. **Pressing keys after game over**: All input is ignored until "Play Again" is clicked.
8. **Word not in dictionary**: Show "Not in word list" feedback only. No letter evaluation happens. The player edits the current word and resubmits.
9. **Only grey letters become unclickable/blocked.** Green and Orange letters remain fully functional on both keyboards.
