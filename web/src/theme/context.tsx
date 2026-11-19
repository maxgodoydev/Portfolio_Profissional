// Provider de tema: paleta + modo (automático/claro/escuro) com persistência segura.
// O estado inicial é lido do <html>, que já foi preenchido por public/theme-init.js antes da pintura.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  THEMES,
  isThemeId,
  isThemeMode,
  type Palette,
  type ResolvedMode,
  type ThemeId,
  type ThemeMode,
} from './themes';
import { STORAGE_KEYS, storage } from '../lib/storage';
import { track } from '../services/analytics';

interface ThemeValue {
  theme: ThemeId;
  mode: ThemeMode;
  /** Modo efetivamente aplicado (resolve "auto" pela preferência do sistema). */
  resolvedMode: ResolvedMode;
  themes: Palette[];
  setTheme: (theme: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const DARK_QUERY = '(prefers-color-scheme: dark)';

function systemMode(): ResolvedMode {
  return typeof window !== 'undefined' && window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

function initialTheme(): ThemeId {
  const fromDom = document.documentElement.getAttribute('data-theme');
  if (isThemeId(fromDom)) return fromDom;
  const stored = storage.get(STORAGE_KEYS.theme);
  return isThemeId(stored) ? stored : DEFAULT_THEME;
}

function initialMode(): ThemeMode {
  const fromDom = document.documentElement.getAttribute('data-mode-pref');
  if (isThemeMode(fromDom)) return fromDom;
  const stored = storage.get(STORAGE_KEYS.mode);
  return isThemeMode(stored) ? stored : DEFAULT_MODE;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [system, setSystem] = useState<ResolvedMode>(systemMode);

  // Acompanha mudanças de preferência do sistema (relevante no modo automático).
  useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY);
    if (!mq) return;
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedMode: ResolvedMode = mode === 'auto' ? system : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', resolvedMode);
    root.setAttribute('data-mode-pref', mode);
  }, [theme, mode, resolvedMode]);

  const setTheme = useCallback((next: ThemeId) => {
    // Só conta quando o visitante realmente muda a paleta (evento theme_change).
    const changed = document.documentElement.getAttribute('data-theme') !== next;
    setThemeState(next);
    storage.set(STORAGE_KEYS.theme, next);
    if (changed) track('theme_change', { target: next });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storage.set(STORAGE_KEYS.mode, next);
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({ theme, mode, resolvedMode, themes: THEMES, setTheme, setMode }),
    [theme, mode, resolvedMode, setTheme, setMode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}
