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

export function useTimer(
  startedAt: number,
  timeLimit: number | null,
  running: boolean
): UseTimerResult {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(() => {
    if (timeLimit === null) return null;
    return getRemainingTime(startedAt, timeLimit);
  });

  const [isExpired, setIsExpired] = useState(() => {
    if (timeLimit === null) return false;
    return getRemainingTime(startedAt, timeLimit) <= 0;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev === null || prev <= 1) {
        return 0;
      }
      return prev - 1;
    });
  }, []);

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
