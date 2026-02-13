import { store } from './state';

export interface ThemeConfig {
  primaryColor?: string;
  fontFamily?: string;
  codeFontFamily?: string;
}

const THEME_KEY = 'puredocs-theme';

/** Только переключение класса темы и опциональные config overrides */
export function applyTheme(root: HTMLElement, themeMode: 'light' | 'dark', config?: ThemeConfig): void {
  root.classList.remove('light', 'dark');
  root.classList.add(`${themeMode}`);

  /* Config overrides (primary, fonts) — из PortalConfig */
  if (config?.primaryColor) {
    root.style.setProperty('--primary-color', config.primaryColor);
  } else {
    root.style.removeProperty('--primary-color');
  }

  if (config?.fontFamily) {
    root.style.setProperty('--font-family-base', config.fontFamily);
  } else {
    root.style.removeProperty('--font-family-base');
  }

  if (config?.codeFontFamily) {
    root.style.setProperty('--font-family-mono', config.codeFontFamily);
  } else {
    root.style.removeProperty('--font-family-mono');
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
