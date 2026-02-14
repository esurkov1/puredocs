import { store } from './state';

export interface ThemeConfig {
  primaryColor?: string;
}

const THEME_KEY = 'puredocs-theme';

/** Theme class switching only and optional config overrides */
export function applyTheme(root: HTMLElement, themeMode: 'light' | 'dark', config?: ThemeConfig): void {
  const isSwitch = root.classList.contains('light') || root.classList.contains('dark');

  /* Enable smooth 0.5s transition for theme changes (not for initial paint) */
  if (isSwitch) {
    root.classList.add('theme-transitioning');
  }

  root.classList.remove('light', 'dark');
  root.classList.add(`${themeMode}`);

  /* Config overrides (primary) — from PortalConfig */
  if (config?.primaryColor) {
    root.style.setProperty('--primary-color', config.primaryColor);
  } else {
    root.style.removeProperty('--primary-color');
  }

  /* Remove transition class after animation completes */
  if (isSwitch) {
    setTimeout(() => root.classList.remove('theme-transitioning'), 550);
  }
}

/** Toggle between light and dark theme */
export function toggleTheme(): void {
  const current = store.get().theme;
  const next = current === 'light' ? 'dark' : 'light';
  store.set({ theme: next });
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch { /* noop */ }
}

/** Detect initial theme */
export function detectTheme(preference?: 'light' | 'dark' | 'auto'): 'light' | 'dark' {
  if (preference && preference !== 'auto') return preference;
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* noop */ }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}
