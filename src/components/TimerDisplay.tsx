/**
 * Countdown timer display.
 *
 * Shows remaining time in `M:SS` format with a smooth animated
 * count-up when time bonus is added. Applies urgent styling when
 * 10 seconds or fewer remain.
 *
 * @packageDocumentation
 */

import { useState, useEffect, useRef } from 'react';
import styles from './TimerDisplay.module.css';

interface Props {
  timeRemaining: number | null;
}

/**
 * Formats seconds into a human-readable M:SS string.
 *
 * @param seconds - The number of seconds to format.
 * @returns A string like "2:05" or "0:30".
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Displays the remaining time with optional smooth animation.
 *
 * When the time limit increases (e.g., from a streak time bonus), the
 * display animates from the old value to the new value over 500ms using
 * requestAnimationFrame, rather than jumping instantly.
 */
export function TimerDisplay({ timeRemaining }: Props) {
  const prevRef = useRef(timeRemaining);
  const [displayValue, setDisplayValue] = useState<number | null>(timeRemaining);
  const [counting, setCounting] = useState(false);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeRemaining === null) {
      setDisplayValue(null);
      prevRef.current = null;
      return;
    }

    // If the time increased (time bonus from streak), animate the transition.
    if (prevRef.current !== null && timeRemaining > prevRef.current) {
      const start = prevRef.current;
      const end = timeRemaining;
      const startTime = Date.now();

      setCounting(true);

      // Smoothly interpolate from start to end over 500ms.
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 500, 1);
        const current = Math.round(start + (end - start) * progress);
        setDisplayValue(current);

        if (progress < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          setCounting(false);
          animRef.current = null;
        }
      };

      animRef.current = requestAnimationFrame(tick);
    } else {
      setDisplayValue(timeRemaining);
    }

    prevRef.current = timeRemaining;

    // Clean up any running animation on unmount or dependency change.
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [timeRemaining]);

  // Don't render anything in Zen mode (no timer).
  if (displayValue === null) return null;

  // Urgent styling when 10 seconds or fewer remain (and not mid-animation).
  const isUrgent = !counting && displayValue <= 10;

  return (
    <span
      className={`${styles.timer} ${counting ? styles.counting : ''} ${isUrgent ? styles.urgent : ''}`}
    >
      {formatTime(displayValue)}
    </span>
  );
}
