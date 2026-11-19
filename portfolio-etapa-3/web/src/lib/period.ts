import type { Lang } from '../i18n';

const MONTHS: Record<Lang, readonly string[]> = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
};

/** "2017-09" → "set/2017" (pt), "Sep 2017" (en), "sep/2017" (es); "2014" → "2014". */
export function formatDate(lang: Lang, value: string): string {
  const [year, month] = value.split('-');
  if (!month) return year;
  const name = MONTHS[lang][Number(month) - 1] ?? month;
  return lang === 'en' ? `${name} ${year}` : `${name}/${year}`;
}

export function formatPeriod(lang: Lang, start: string, end?: string, ongoingLabel?: string): string {
  const from = formatDate(lang, start);
  if (end) return `${from} – ${formatDate(lang, end)}`;
  if (ongoingLabel) return `${from} – ${ongoingLabel}`;
  return from;
}
