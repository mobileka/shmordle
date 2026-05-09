# 0005 — Responsive Design and Favicon

## 1. Overview

Two improvements:

1. **Responsive design** — Game works on all screens from 320px to desktop
2. **Favicon** — Browser tab icon

## 2. Modern Device Sizes Reference

| Category | Width | Examples |
|----------|-------|----------|
| Small phone | 320-374px | iPhone SE (gen 1) |
| Medium phone | 375-389px | iPhone 6/7/8/X–16, Galaxy S |
| Large phone | 390-430px | iPhone Pro Max, Pixel |
| Tablet / Desktop | 600px+ | iPad, monitors |

**Goal:** No horizontal scroll, no overlap, full game visible without scrolling at **320px** and above.

## 3. Responsive CSS Techniques

We will use:

- **`clamp()`** for fluid font sizes and spacing that scale with viewport width
- **`min()`** to cap sizes at their desktop values while allowing shrinkage
- **`dvh`** (dynamic viewport height) so the game board doesn't get hidden behind mobile browser toolbars
- **`env(safe-area-inset-*)`** for notched devices (iPhone X+)
- **Mobile-first CSS** — base styles target the smallest screen (320px), then `@media (min-width:)` adds back desktop sizing
- **`flex: 1` and percentage-based widths** for the keyboard — no fixed pixel widths on keys, scaled proportionally

## 4. Implementation Steps

### Step 1: Update index.html

- Add `viewport-fit=cover` to the viewport meta tag (needed for safe-area-inset to work)
- Add `<link rel="icon">` with an inline SVG favicon (a simple "S" letter on a rounded square, using a green color matching `--bg-correct` / `#6aaa64`)
- Add `<meta name="theme-color">` for browser chrome coloring

### Step 2: Responsive Grid Cells

In `GridCell.module.css`:
- Replace fixed `width: 62px; height: 62px` with fluid sizing
- Cell width: `min(62px, calc((100vw - 2 * 8px - 4 * 5px) / 5))` — fits 5 cells + gaps within the padded viewport
- Cell height equals width (square), maintained via `aspect-ratio: 1` and width-only rules
- Font size: `clamp(1rem, 3.5vw, 2rem)` — scales down on narrow screens
- Gap between cells scales similarly

### Step 3: Responsive Keyboard

In `VirtualKeyboard.module.css`:
- Replace `min-width: 43px` on `.key` with proportional sizing
- Each key row uses `display: flex; width: 100%`
- Each key: `flex: 1; min-width: 0;` — they split available width equally
- The wide keys (Enter, Backspace) use `flex: 1.5` (50% wider than regular keys)
- Middle and bottom row use empty spacer divs with `flex: 0.5` for QWERTY stagger offset
- Font size: `clamp(0.6rem, 2vw, 0.85rem)`
- Key height: `clamp(44px, 10vh, 58px)`
- Touch targets stay ≥44px (WCAG minimum) on all but the tiniest screens where unavoidable
- Row gap scales with viewport

### Step 4: Responsive App Layout

In `App.module.css`:
- Replace `max-width: 500px` with `max-width: min(500px, 100%)`
- Padding: `clamp(4px, 2vw, 8px)`
- Bottom padding: `clamp(16px, 4vw, 32px)`
- Add `safe-area-inset-bottom` to bottom padding

In `index.css`:
- Add `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)` to body
- Set `min-height: 100dvh` on root/app container
- Scale root font size slightly on mobile: `font-size: clamp(14px, 3.5vw, 16px)`

### Step 5: Responsive Overlay & Toast

In `GameOverOverlay.module.css`:
- Content padding: reduce on narrow screens via media query or `clamp()`
- Keep dialog from overflowing viewport

In `FeedbackToast.module.css`:
- Already centered, mostly fine — adjust top position from fixed `80px` to be relative to header height

In `Header.module.css`:
- Title font size: `clamp(1.5rem, 5vw, 2rem)`
- Reduce padding on mobile

### Step 6: Add Favicon

- Create `public/favicon.svg` — a simple SVG: green rounded rectangle (#6aaa64) with white "SH" text
- Link it in `index.html` with `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`
- Optionally add a 32×32 PNG fallback (but SVG is supported in all modern browsers)

### Step 7: TDD — Write Tests

| Test File | Tests |
|-----------|-------|
| Existing tests | Grid cells, keyboard, overlays — update size assertions to use fluid values where needed |

## 5. File Changes Summary

| Action | File |
|--------|------|
| **Modify** | `index.html` — viewport-fit, favicon link, theme-color meta |
| **Modify** | `src/index.css` — safe-area padding, dvh, responsive font-size |
| **Modify** | `src/App.module.css` — responsive width/padding |
| **Modify** | `src/components/Header.module.css` — responsive title/header |
| **Modify** | `src/components/GridCell.module.css` — fluid cell sizing, responsive font |
| **Modify** | `src/components/VirtualKeyboard.module.css` — proportional key sizing |
| **Modify** | `src/components/GameOverOverlay.module.css` — responsive dialog |
| **Modify** | `src/components/FeedbackToast.module.css` — responsive toast position |
| **New** | `public/favicon.svg` — SVG favicon |
