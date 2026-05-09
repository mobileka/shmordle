# 0003 — Fix Modifier Key Handling in Keyboard Input

## Problem

When pressing browser shortcuts like **Cmd+R** (refresh), **Cmd+W** (close tab), or any modifier+letter combination, the game's `keydown` handler intercepts the event, prevents the browser action via `e.preventDefault()`, and types the letter into the game instead.

## Root Cause

In `src/hooks/useKeyboard.ts:19-45`, the `handleKeyDown` callback only checks `e.key` without inspecting modifier state (`e.metaKey`, `e.ctrlKey`, `e.altKey`). Since `e.preventDefault()` is called on matching letter keys, browser shortcuts break.

## Fix

Add an early return when any modifier key is held:

```ts
// src/hooks/useKeyboard.ts, inside handleKeyDown, after the disabled check:
if (e.metaKey || e.ctrlKey || e.altKey) return;
```

This allows standard browser shortcuts (Cmd+R, Cmd+W, Ctrl+R, etc.) to pass through uncaptured. Normal typing (no modifiers) is unaffected.

## Tests to Add (in `src/hooks/useKeyboard.test.ts`)

1. **ignores letter keys when metaKey is pressed** — fire `keydown` with `{ key: 'r', metaKey: true }`, assert `onLetter` not called
2. **ignores letter keys when ctrlKey is pressed** — same, with `ctrlKey: true`
3. **ignores letter keys when altKey is pressed** — same, with `altKey: true`
4. **ignores Enter when metaKey is pressed** — fire `{ key: 'Enter', metaKey: true }`, assert `onEnter` not called
5. **ignores Backspace when metaKey is pressed** — fire `{ key: 'Backspace', metaKey: true }`, assert `onBackspace` not called

## Files Changed

- `src/hooks/useKeyboard.ts` — add 1-line guard
- `src/hooks/useKeyboard.test.ts` — add 5 modifier key tests
