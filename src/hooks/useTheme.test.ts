import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  const localStorageMock = {
    getItem: vi.fn<() => string | null>(),
    setItem: vi.fn<() => void>(),
  };

  const matchMediaMock = vi.fn<() => { matches: boolean; addEventListener: () => void; removeEventListener: () => void }>();

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('matchMedia', matchMediaMock);
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns light theme by default when no preference is stored', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('returns dark theme when localStorage has dark stored', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('falls back to system preference when no localStorage value exists', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('sets data-theme attribute on document element on mount', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    renderHook(() => useTheme());
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('sets dark data-theme when initial theme is dark', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    renderHook(() => useTheme());
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('toggleTheme switches from light to dark and updates localStorage', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('toggleTheme switches from dark to light and updates localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });
});
