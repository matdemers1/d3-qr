import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'd3qr-theme';

function readStored(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system')
      return value;
  } catch {
    // Storage blocked: follow the system.
  }
  return 'system';
}

/**
 * The design system themes from `data-theme` on <html>: "light" or "dark" pin
 * it, and no attribute follows prefers-color-scheme — including live changes,
 * with no listener here. public/theme-init.js applies the same rule before
 * first paint.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readStored());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered, but still applied for this visit.
    }
    setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light',
    );
  }, [theme, setTheme]);

  return { theme, setTheme, cycleTheme };
}
