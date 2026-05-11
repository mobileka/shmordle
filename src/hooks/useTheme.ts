/**
 * Theme hook.
 *
 * Manages light/dark theme state, persists the user's preference to
 * localStorage, and follows the system `prefers-color-scheme` by default.
 *
 * @packageDocumentation
 */

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

/**
 * Determines the initial theme on first load.
 *
 * Priority:
 *   1. User's previously saved preference in localStorage.
 *   2. OS-level prefers-color-scheme setting.
 *   3. Fallback to 'light'.
 */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

/**
 * Manages the application's light/dark theme.
 *
 * @returns An object with:
 *   - theme: current theme ('light' or 'dark')
 *   - isDark: convenience boolean
 *   - toggleTheme: function to switch between themes
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply the theme by setting a data-theme attribute on the root HTML element.
  // CSS custom properties in index.css react to this attribute.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  /** Toggles between light and dark, persisting the choice to localStorage. */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };
}
