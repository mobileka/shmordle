import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null timeRemaining and false isExpired for null timeLimit', async () => {
    const { useTimer } = await import('./useTimer');
    const now = Date.now();
    const { result } = renderHook(() => useTimer(now, null, true));
    expect(result.current.timeRemaining).toBeNull();
    expect(result.current.isExpired).toBe(false);
  });

  it('calculates remaining time from startedAt offset', async () => {
    const { useTimer } = await import('./useTimer');
    const now = Date.now();
    const startedAt = now - 30_000;
    const { result } = renderHook(() => useTimer(startedAt, 60, true));
    expect(result.current.timeRemaining).toBe(30);
  });

  it('decrements timeRemaining every second', async () => {
    const { useTimer } = await import('./useTimer');
    const now = Date.now();
    const { result } = renderHook(() => useTimer(now, 60, true));
    expect(result.current.timeRemaining).toBe(60);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.timeRemaining).toBe(55);
  });

  it('sets isExpired when timeRemaining reaches 0', async () => {
    const { useTimer } = await import('./useTimer');
    const now = Date.now();
    const { result } = renderHook(() => useTimer(now, 2, true));
    expect(result.current.timeRemaining).toBe(2);
    expect(result.current.isExpired).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.timeRemaining).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  it('clamps remaining time to 0 when elapsed exceeds timeLimit', async () => {
    const { useTimer } = await import('./useTimer');
    const now = Date.now();
    const startedAt = now - 100_000;
    const { result } = renderHook(() => useTimer(startedAt, 60, true));
    expect(result.current.timeRemaining).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  it('does not tick when running is false', async () => {
    const { useTimer } = await import('./useTimer');
    const now = Date.now();
    const { result } = renderHook(() => useTimer(now, 60, false));
    expect(result.current.timeRemaining).toBe(60);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.timeRemaining).toBe(60);
  });

  it('cleans up interval on unmount', async () => {
    const { useTimer } = await import('./useTimer');
    const now = Date.now();
    const { result, unmount } = renderHook(() => useTimer(now, 60, true));
    unmount();
    expect(result.current.timeRemaining).toBe(60);
  });
});
