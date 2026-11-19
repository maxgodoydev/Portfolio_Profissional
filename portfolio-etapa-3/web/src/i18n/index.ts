import { en } from './en';
import { es } from './es';
import { pt, type Dictionary } from './pt';

export type Lang = 'pt' | 'en' | 'es';
export type { Dictionary };

export const LANGS: Lang[] = ['pt', 'en', 'es'];
export const DEFAULT_LANG: Lang = 'pt';

export const HTML_LANG: Record<Lang, string> = { pt: 'pt-BR', en: 'en', es: 'es' };
export const OG_LOCALE: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US', es: 'es_ES' };

export const dictionaries: Record<Lang, Dictionary> = { pt, en, es };

export type Localized<T> = Record<Lang, T>;

export function isLang(value: unknown): value is Lang {
  return value === 'pt' || value === 'en' || value === 'es';
}

/** Substitui marcadores {chave} em um texto do dicionário. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
