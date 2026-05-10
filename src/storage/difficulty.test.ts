import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { savePreferredDifficulty, loadPreferredDifficulty } from './difficulty';

const PREFERRED_KEY = 'shmordle-preferred-difficulty';

describe('difficulty', () => {
  const store = new Map<string, string>();

  const localStorageMock = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
    removeItem: vi.fn((key: string) => { store.delete(key); }),
  };

  beforeEach(() => {
    store.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves and loads preferred difficulty', () => {
    savePreferredDifficulty('insane');

    const result = loadPreferredDifficulty();

    expect(result).toBe('insane');
  });

  it('returns null when no preference is saved', () => {
    const result = loadPreferredDifficulty();

    expect(result).toBeNull();
  });

  it('returns null for invalid saved value', () => {
    localStorage.setItem(PREFERRED_KEY, 'legendary');

    const result = loadPreferredDifficulty();

    expect(result).toBeNull();
  });

  it('overwrites previous preference', () => {
    savePreferredDifficulty('hard');
    savePreferredDifficulty('zen');

    const result = loadPreferredDifficulty();

    expect(result).toBe('zen');
  });
});
