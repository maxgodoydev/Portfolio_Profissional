// Provider de idioma. A URL é a fonte de verdade: /pt/..., /en/..., /es/...
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { HTML_LANG, dictionaries, type Dictionary, type Lang } from './index';
import { navigate, useLocation } from '../router';
import { pickLanguage, switchLangPath } from '../routes';
import { STORAGE_KEYS, storage } from '../lib/storage';

interface I18nValue {
  lang: Lang;
  t: Dictionary;
  /** Troca o idioma mantendo a rota atual e salva a preferência. */
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function preferredLang(): Lang {
  const nav = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
  return pickLanguage(storage.get(STORAGE_KEYS.lang), nav.filter(Boolean));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  // URL sem prefixo (/ ou página inexistente): usa a preferência salva ou a do navegador.
  const lang: Lang = location.lang ?? preferredLang();

  // Visita à raiz "/": redireciona para o idioma preferido (sem criar entrada no histórico).
  useEffect(() => {
    if (location.lang === null && location.route === 'home') {
      navigate(`/${lang}/${location.query.toString() ? `?${location.query.toString()}` : ''}`, { replace: true });
    }
  }, [location.lang, location.route, location.query, lang]);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
    if (location.lang) storage.set(STORAGE_KEYS.lang, location.lang);
  }, [lang, location.lang]);

  const setLang = useCallback(
    (next: Lang) => {
      storage.set(STORAGE_KEYS.lang, next);
      navigate(switchLangPath(location, next), { keepScroll: true });
    },
    [location],
  );

  const value = useMemo<I18nValue>(() => ({ lang, t: dictionaries[lang], setLang }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n deve ser usado dentro de <I18nProvider>');
  return ctx;
}
