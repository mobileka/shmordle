/**
 * Countdown timer hook.
 *
 * Tracks remaining time based on the game's start timestamp and difficulty
 * time limit. Signals expiration when time runs out and supports time-bonus
 * extensions from streak rewards.
 *
 * @packageDocumentation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getRemainingTime } from '../domain/game';

interface UseTimerResult {
  timeRemaining: number | null;
  isExpired: boolean;
}

/**
 * A countdown timer that ticks every second.
 *
 * @param startedAt - The game start timestamp (ms since epoch).
 * @param timeLimit - The total time limit in seconds, or null for no timer (Zen mode).
 * @param running - Whether the timer should actively tick.
 * @returns An object with:
 *   - timeRemaining: seconds left (null if Zen mode),
 *   - isExpired: true when the timer has reached zero.
 */
export function useTimer(
  startedAt: number,
  timeLimit: number | null,
  running: boolean
): UseTimerResult {
  // Initialize timeRemaining from the domain calculation.
  const [timeRemaining, setTimeRemaining] = useState<number | null>(() => {
    if (timeLimit === null) return null;
    return getRemainingTime(startedAt, timeLimit);
  });

  // Initialize isExpired based on whether time has already run out.
  const [isExpired, setIsExpired] = useState(() => {
    if (timeLimit === null) return false;
    return getRemainingTime(startedAt, timeLimit) <= 0;
  });

  // Ref to store the interval ID so we can clear it on cleanup or pause.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Decrements the timer by 1 second, stopping at 0. */
  const tick = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev === null || prev <= 1) {
        return 0;
      }
      return prev - 1;
    });
  }, []);

  // Effect 1: Detect when the timer reaches zero and signal expiration.
  // Also cleans up the interval to prevent further ticks.
  useEffect(() => {
    if (timeLimit === null) return;

    if (timeRemaining !== null && timeRemaining <= 0) {
      setIsExpired(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [timeRemaining, timeLimit]);

  // Effect 2: Re-sync the timer when the start time or time limit changes.
  // This handles time-bonus extensions from streak rewards.
  useEffect(() => {
    if (timeLimit !== null) {
      const remaining = getRemainingTime(startedAt, timeLimit);
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    }
  }, [startedAt, timeLimit]);

  // Effect 3: Start or stop the 1-second interval based on running state.
  useEffect(() => {
    if (timeLimit === null || !running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeLimit, running, tick]);

  return { timeRemaining, isExpired };
}
