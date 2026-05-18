# 0009-AUTOMATED_SCREENSHOT

## Goal

Replace the manual screenshot process with an automated script that an AI agent can run to capture the current state of the app and overwrite `screenshot.png` (which is embedded in the README).

## Current State

The README already embeds `./screenshot.png` via `<img src="./screenshot.png" width="400">`. The file is manually created by running the dev server, navigating to the app, and taking a screenshot by hand.

## Implementation

### 1. Install Puppeteer

```
npm install -D puppeteer
```

Headless Chromium, no external dependencies.

### 2. Create `scripts/screenshot.mjs`

The script performs these steps:

1. **Start Vite dev server** on port 5173 (spawn as child process)
2. **Wait for server ready** — poll `http://localhost:5173` with fetch until it responds
3. **Launch headless Chromium** — viewport 400×800 (mobile-sized, matches README width)
4. **Inject state before page load** via `page.evaluateOnNewDocument`:
   - `shmordle-game-state` — a realistic in-progress game (see table below)
   - `shmordle-theme` = `'light'` — forces light mode for README visibility
5. **Navigate** to `http://localhost:5173`, wait for `networkidle0`
6. **Wait for game board** — `page.waitForSelector('main')`
7. **Take screenshot** → save as `screenshot.png` at project root
8. **Cleanup** — close browser, kill dev server

### Injected Game State

| Detail | Value |
|--------|-------|
| Hidden word | `HELLO` |
| Submitted guesses | `WORLD` (W-absent, O-present, R-absent, L-present, D-absent) |
|  | `PLANE` (P-absent, L-present, A-absent, N-absent, E-present) |
| Current guess | `HE` (2 filled tiles in the current row) |
| Difficulty | `hard` (timer visible in header) |
| Theme | `light` (forced via localStorage) |

This produces a visually rich screenshot showing:
- 2 completed rows with mixed tile colors (grey, orange)
- 1 row with partial input (2 filled tiles)
- Keyboard with colored keys (some absent, some present)
- Timer in the header
- Give-up button and theme toggle

### 3. Add npm script

```json
"screenshot": "node scripts/screenshot.mjs"
```

### 4. Update AGENTS.md

Add a note that `npm run screenshot` updates the README screenshot.

## No README Changes Needed

The README already references `./screenshot.png`. Overwriting the file is sufficient.
