# 0006 — Give-Up Confirmation Dialog

## 1. Overview

Currently clicking the Give Up button immediately forfeits the game. This can be very annoying if clicked accidentally. We add a confirmation step.

## 2. Implementation Steps

### Step 1: Create `ConfirmDialog` Component

New files: `src/components/ConfirmDialog.tsx`, `src/components/ConfirmDialog.module.css`

Props:
- `open: boolean` — whether the dialog is visible
- `message: string` — confirmation text
- `confirmLabel: string` — text for the confirm button
- `cancelLabel: string` — text for the cancel button
- `onConfirm: () => void` — called when user confirms
- `onCancel: () => void` — called when user cancels

Behavior:
- Renders a centered modal overlay (similar to GameOverOverlay but simpler)
- Shows message and two action buttons
- Escape key triggers `onCancel`
- Click outside the dialog content (on the backdrop) triggers `onCancel`
- Focus trap: when open, focus is trapped inside the dialog
- Accessible: `role="alertdialog"`, `aria-modal="true"`

Layout:
```
┌───────────────────────────┐
│                           │
│  Are you sure you want    │
│  to give up?              │
│                           │
│   [ Cancel ] [ Give Up ]  │
│                           │
└───────────────────────────┘
```

### Step 2: Integrate into `App.tsx`

- Add a `pendingGiveUp` state (boolean, defaults to `false`)
- When Give Up button in Header is clicked → set `pendingGiveUp` to `true` (show ConfirmDialog instead of calling `forfeit()`)
- When ConfirmDialog "Give Up" is clicked → call `forfeit()`, set `pendingGiveUp` to `false`
- When ConfirmDialog "Cancel" is clicked → set `pendingGiveUp` to `false`
- The Header's `showGiveUp` prop should also be `false` when the dialog is open (or we keep the dialog on top and the button hidden behind it — simpler: just show dialog)

### Step 3: TDD — Write Tests

| Test File | Tests |
|-----------|-------|
| `src/components/ConfirmDialog.test.tsx` | Renders message and buttons; clicking confirm calls onConfirm; clicking cancel calls onCancel; Escape key calls onCancel; backdrop click calls onCancel |
| `src/App.test.tsx` | Give-up button shows confirmation dialog instead of immediate forfeit; confirming gives up and shows GameOverOverlay; cancelling returns to game; game-over overlay not shown until confirmed |

## 3. File Changes Summary

| Action | File |
|--------|------|
| **New** | `src/components/ConfirmDialog.tsx` — confirmation modal |
| **New** | `src/components/ConfirmDialog.module.css` — dialog styles |
| **New** | `src/components/ConfirmDialog.test.tsx` — dialog tests |
| **Modify** | `src/App.tsx` — add ConfirmDialog, wire pendingGiveUp state |
| **Modify** | `src/App.test.tsx` — confirmation flow tests |
