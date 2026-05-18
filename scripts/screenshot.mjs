import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = 5173;
const TIMEOUT = 30_000;

const gameState = {
  gameId: 'screenshot-demo',
  hiddenWord: 'HELLO',
  guesses: ['WORLD', 'PLANE'],
  currentGuess: 'HE',
  evaluations: [
    [
      { letter: 'W', status: 'absent' },
      { letter: 'O', status: 'present' },
      { letter: 'R', status: 'absent' },
      { letter: 'L', status: 'correct' },
      { letter: 'D', status: 'absent' },
    ],
    [
      { letter: 'P', status: 'absent' },
      { letter: 'L', status: 'present' },
      { letter: 'A', status: 'absent' },
      { letter: 'N', status: 'absent' },
      { letter: 'E', status: 'present' },
    ],
  ],
  gameStatus: 'playing',
  virtualKeyboardState: {
    W: 'absent', O: 'present', R: 'absent', L: 'correct', D: 'absent',
    P: 'absent', A: 'absent', N: 'absent', E: 'present',
  },
  difficulty: 'hard',
  startedAt: Date.now(),
  streak: 1,
  sessionPoints: 0,
  timeBonus: 0,
};

function waitForServer(url, timeout) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch { /* server not ready yet */ }
      if (Date.now() - start > timeout) {
        return reject(new Error(`Server did not start within ${timeout}ms`));
      }
      setTimeout(check, 500);
    };
    check();
  });
}

async function main() {
  console.log('Starting Vite dev server...');
  const server = spawn('npx', ['vite', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'pipe',
    detached: true,
  });

  let browser = null;
  try {
    await waitForServer(`http://127.0.0.1:${PORT}`, TIMEOUT);
    console.log('Server is ready.');

    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 800, deviceScaleFactor: 3 });

    await page.evaluateOnNewDocument((state, theme) => {
      localStorage.setItem('shmordle-game-state', JSON.stringify(state));
      localStorage.setItem('theme', theme);
    }, gameState, 'light');

    console.log('Navigating to app...');
    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0' });

    await page.waitForSelector('main', { timeout: 10_000 });

    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 200));

    const outputPath = join(ROOT, 'screenshot.png');
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`Screenshot saved to ${outputPath}`);
  } finally {
    if (browser) await browser.close();
    process.kill(-server.pid, 'SIGTERM');
    console.log('Dev server stopped.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
