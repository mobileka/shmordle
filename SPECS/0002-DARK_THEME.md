# Shmordle — Dark Theme

## 1. Overview

Add a dark theme to Shmordle. Users toggle between light and dark mode via a sun/moon toggle in the header. Preference persists in `localStorage`. All UI colors adapt while maintaining usability and readability. Status feedback colors (`correct`, `present`, `absent`) remain the same in both themes — they contrast well on both backgrounds.

## 2. Implementation Steps

### Step 1: Define CSS Custom Properties

Introduce semantic CSS variables in `src/index.css` under `:root` (light) and `[data-theme="dark"]`:

| Variable | Light | Dark |
|----------|-------|------|
| `--color-bg` | `#ffffff` | `#121213` |
| `--color-text` | `#1a1a1b` | `#d7dadc` |
| `--color-border` | `#d3d6da` | `#3a3a3c` |
| `--color-border-filled` | `#878a8c` | `#565758` |
| `--color-cell-bg` | `#ffffff` | `#121213` |
| `--color-key-bg` | `#d3d6da` | `#818384` |
| `--color-key-text` | `#1a1a1b` | `#d7dadc` |
| `--color-overlay-bg` | `#ffffff` | `#1a1a1b` |
| `--color-overlay-shadow` | `rgba(0,0,0,0.15)` | `rgba(0,0,0,0.3)` |
| `--color-toast-bg` | `#1a1a1b` | `#ffffff` |
| `--color-toast-text` | `#ffffff` | `#1a1a1b` |
| `--color-word-subtitle` | `#787c7e` | `#818384` |
| `--color-header-border` | `#d3d6da` | `#3a3a3c` |

### Step 2: Replace Hardcoded Colors with Variables

Update every `.module.css` file to use `var(--*)` instead of raw hex values:

- `src/index.css` — body background/text color
- `src/components/Header.module.css` — border, title color
- `src/components/GridCell.module.css` — cell bg, border, text; flip animation keyframes
- `src/components/VirtualKeyboard.module.css` — key bg, key text
- `src/components/GameOverOverlay.module.css` — overlay, content, text, shadow
- `src/components/FeedbackToast.module.css` — toast bg, toast text

### Step 3: Create `useTheme` Hook

New file: `src/hooks/useTheme.ts`

```
Exports:
  useTheme(): { theme: 'light' | 'dark'; toggleTheme: () => void; isDark: boolean }

Logic:
  1. On mount: read localStorage.getItem('theme')
  2. If null: check window.matchMedia('(prefers-color-scheme: dark)'), else default 'light'
  3. Set document.documentElement.dataset.theme on every change
  4. toggleTheme: flip, update localStorage, update data-theme
```

### Step 4: Create `ThemeToggle` Component

New files: `src/components/ThemeToggle.tsx`, `src/components/ThemeToggle.module.css`

Design:
- Pill-shaped toggle button with sliding circle indicator
- Sun SVG icon on one side, Moon SVG icon on the other
- Smooth CSS transition for the slider
- Accessible: `role="switch"`, `aria-checked`, `aria-label="Toggle theme"`
- Uses `useTheme` hook and delegates toggle

### Step 5: Integrate into Header

Update `src/components/Header.tsx` — render `<ThemeToggle />` inside header with flexbox layout:

```
┌──────────────────────────────┐
│         SHMORDLE         ☀🌙 │
└──────────────────────────────┘
```

Header becomes flex container with title centered and toggle right-aligned.

### Step 6: Anti-flash Prevention

Add inline `<script>` in `index.html` `<head>` before the stylesheet that reads localStorage and sets `data-theme` on `<html>` before rendering.

### Step 7: TDD — Write Tests

| Test File | Tests |
|-----------|-------|
| `src/hooks/useTheme.test.ts` | Initializes from localStorage, falls back to system/media, defaults to 'light', toggle flips theme and updates DOM/localStorage |
| `src/components/ThemeToggle.test.tsx` | Renders toggle, shows correct state, clicking calls toggle, ARIA attributes |
| `src/components/Header.test.tsx` | Updated: asserts ThemeToggle is rendered |

Existing tests continue to pass unchanged (CSS variables resolve at runtime).

## 3. File Changes Summary

| Action | File |
|--------|------|
| **New** | `src/hooks/useTheme.ts` |
| **New** | `src/hooks/useTheme.test.ts` |
| **New** | `src/components/ThemeToggle.tsx` |
| **New** | `src/components/ThemeToggle.module.css` |
| **New** | `src/components/ThemeToggle.test.tsx` |
| **Modify** | `src/index.css` — add `:root` and `[data-theme="dark"]` CSS variables |
| **Modify** | `src/components/Header.tsx` — add ThemeToggle |
| **Modify** | `src/components/Header.module.css` — flexbox layout |
| **Modify** | `src/components/Header.test.tsx` — assert toggle rendered |
| **Modify** | `src/components/GridCell.module.css` — use `var(--*)` |
| **Modify** | `src/components/VirtualKeyboard.module.css` — use `var(--*)` |
| **Modify** | `src/components/GameOverOverlay.module.css` — use `var(--*)` |
| **Modify** | `src/components/FeedbackToast.module.css` — use `var(--*)` |
| **Modify** | `index.html` — anti-flash inline script |
