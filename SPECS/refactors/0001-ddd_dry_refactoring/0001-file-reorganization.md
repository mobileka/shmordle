# 0001 — File Reorganization (Phase 1 of DDD refactor)

## Goal

Move files into the new layer structure. Zero logic changes. Only import paths change.

## Moves

| Old | New |
|-----|-----|
| `src/types.ts` | `src/domain/types.ts` |
| `src/utils/evaluation.ts` | `src/domain/evaluation.ts` |
| `src/utils/dictionary.ts` | `src/domain/dictionary.ts` |
| `src/utils/storage.ts` | `src/infrastructure/storage.ts` |

## Import updates — source files

### `src/domain/evaluation.ts` (old: `src/utils/evaluation.ts`)

| Old import | New import |
|------------|------------|
| `'../types'` | `'./types'` |

### `src/infrastructure/storage.ts` (old: `src/utils/storage.ts`)

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |

### `src/hooks/useGame.ts`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |
| `'../utils/evaluation'` | `'../domain/evaluation'` |
| `'../utils/dictionary'` | `'../domain/dictionary'` |
| `'../utils/storage'` | `'../infrastructure/storage'` |

### `src/hooks/useKeyboard.ts`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |

### `src/hooks/useTimer.ts`

No changes needed (no imports from moved files).

### `src/App.tsx`

| Old import | New import |
|------------|------------|
| `'./types'` | `'./domain/types'` |
| `'./utils/storage'` | `'./infrastructure/storage'` |

### `src/components/DifficultyPicker.tsx`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |

### `src/components/GameOverOverlay.tsx`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |

### `src/components/HighScoresPage.tsx`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |
| `'../utils/storage'` | `'../infrastructure/storage'` |

### `src/components/VirtualKeyboard.tsx`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |

### `src/components/GameBoard.tsx`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |

### `src/components/GridRow.tsx`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |

### `src/components/GridCell.tsx`

| Old import | New import |
|------------|------------|
| `'../types'` | `'../domain/types'` |

## Import updates — test files

Same pattern for every test file: replace `'../types'` → `'../domain/types'`, `'./types'` → `'./domain/types'`, `'../utils/*'` → `'../infrastructure/*'` or `'../domain/*'`.

Tests affected: `storage.test.ts`, `useGame.test.ts`, `evaluation.test.ts`, `dictionary.test.ts`, `App.test.tsx`, `DifficultyPicker.test.tsx`, `GameOverOverlay.test.tsx`, `HighScoresPage.test.tsx`, `VirtualKeyboard.test.tsx`, `GameBoard.test.tsx`, `GridRow.test.tsx`, `GridCell.test.tsx`, `useKeyboard.test.ts`.

## Deletion

Remove `src/utils/` directory entirely after all moves and import updates are verified.

## Verification

`npm run check` must pass. No test assertions change. No logic changes. The diff should be only import paths and file locations.
