import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerResult {
  timeRemaining: number | null;
  isExpired: boolean;
}

function calcRemaining(startedAt: number, timeLimit: number): number {
  const elapsed = (Date.now() - startedAt) / 1000;
  return Math.max(0, Math.floor(timeLimit - elapsed));
}

export function useTimer(
  startedAt: number,
  timeLimit: number | null,
  running: boolean
): UseTimerResult {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(() => {
    if (timeLimit === null) return null;
    return calcRemaining(startedAt, timeLimit);
  });

  const [isExpired, setIsExpired] = useState(() => {
    if (timeLimit === null) return false;
    return calcRemaining(startedAt, timeLimit) <= 0;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    if (timeLimit === null) return;
    setTimeRemaining((prev) => {
      if (prev === null || prev <= 1) {
        return 0;
      }
      return prev - 1;
    });
  }, [timeLimit]);

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
