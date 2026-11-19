// Lógica pura do painel administrativo: sem React, sem rede, sem relógio implícito.
// Tudo aqui trabalha somente com o que a API devolve; nada é estimado ou inventado.
import type { Lang } from '../i18n';
import type { Count, DayPoint, HealthData, InfoData, OpsData, ReadyData, StatsData } from '../services/api';

export const PRESETS = [7, 14, 30, 90, 180, 365] as const;
export const MAX_DAYS = 365;
export const DEFAULT_DAYS = 30;

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// Intervalo de datas
// ---------------------------------------------------------------------------

/** Data de hoje em UTC no formato AAAA-MM-DD (o backend agrega por dia UTC). */
export function utcToday(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function dayNumber(date: string): number | null {
  if (!DATE_RE.test(date)) return null;
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  // Rejeita datas "roladas" como 2026-02-31.
  return new Date(ms).toISOString().slice(0, 10) === date ? Math.round(ms / DAY_MS) : null;
}

/**
 * Converte "a partir de AAAA-MM-DD" em número de dias até hoje (inclusive).
 * Devolve null se a data for inválida, futura ou estiver a mais de 365 dias.
 */
export function daysSince(date: string, now: Date): number | null {
  const start = dayNumber(date);
  const today = dayNumber(utcToday(now));
  if (start === null || today === null || start > today) return null;
  const days = today - start + 1;
  return days <= MAX_DAYS ? days : null;
}

/** Data (AAAA-MM-DD) do primeiro dia de uma janela de `days` dias terminando hoje. */
export function startDateFor(days: number, now: Date): string {
  const today = dayNumber(utcToday(now)) ?? 0;
  return new Date((today - (days - 1)) * DAY_MS).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Totais e participação
// ---------------------------------------------------------------------------

export function sumCounts(items: readonly Count[]): number {
  return items.reduce((acc, c) => acc + c.value, 0);
}

export interface Share extends Count {
  /** 0–100, uma casa decimal. */
  pct: number;
}

/** Participação de cada item no total dos itens recebidos (total 0 → 0%). */
export function withShare(items: readonly Count[]): Share[] {
  const total = sumCounts(items);
  return items.map((c) => ({ ...c, pct: total > 0 ? Math.round((c.value / total) * 1000) / 10 : 0 }));
}

export interface EventTotals {
  pageview: number;
  project_view: number;
  resume_download: number;
  theme_change: number;
  total: number;
}

/** Eventos aceitos pelo backend. Trocas de tema = soma de `themes` (são só 5 paletas, a lista vem completa). */
export function eventTotals(stats: Pick<StatsData, 'totalPageViews' | 'projectViews' | 'resumeDownloads' | 'themes'>): EventTotals {
  const theme = sumCounts(stats.themes);
  return {
    pageview: stats.totalPageViews,
    project_view: stats.projectViews,
    resume_download: stats.resumeDownloads,
    theme_change: theme,
    total: stats.totalPageViews + stats.projectViews + stats.resumeDownloads + theme,
  };
}

/** Há algum evento no período? */
export function hasAnyData(stats: StatsData): boolean {
  return eventTotals(stats).total > 0;
}

// ---------------------------------------------------------------------------
// Comparação entre períodos
// ---------------------------------------------------------------------------

export interface Comparison {
  /** Períodos de `days` dias: o atual (últimos dias) e o imediatamente anterior. */
  days: number;
  currentViews: number;
  previousViews: number;
  currentSessions: number;
  previousSessions: number;
  /** Variação percentual das visualizações; null quando o período anterior teve 0. */
  viewsPct: number | null;
}

/**
 * Compara o período atual com o anterior usando a série diária de 2×N dias.
 * Só devolve resultado quando a comparação é justa: a série tem exatamente 2N dias e o primeiro
 * dia com dados cai no início do período anterior (tolerância de N/4 dias). Sem isso, um zero
 * poderia significar "sem coleta" e não "sem visitas", e a comparação enganaria.
 */
export function comparePeriods(daily: readonly DayPoint[], days: number): Comparison | null {
  if (!Number.isInteger(days) || days < 1 || daily.length !== days * 2) return null;
  const first = daily.findIndex((d) => d.pageViews > 0);
  if (first === -1 || first > Math.floor(days / 4)) return null;
  const prev = daily.slice(0, days);
  const cur = daily.slice(days);
  const sum = (rows: readonly DayPoint[], key: 'pageViews' | 'sessions') => rows.reduce((a, r) => a + r[key], 0);
  const previousViews = sum(prev, 'pageViews');
  const currentViews = sum(cur, 'pageViews');
  return {
    days,
    currentViews,
    previousViews,
    currentSessions: sum(cur, 'sessions'),
    previousSessions: sum(prev, 'sessions'),
    viewsPct: previousViews > 0 ? Math.round(((currentViews - previousViews) / previousViews) * 1000) / 10 : null,
  };
}

// ---------------------------------------------------------------------------
// Gráfico de linhas (matemática de escala; o desenho fica no componente)
// ---------------------------------------------------------------------------

/** Menor passo "bonito" (1, 2, 2,5 ou 5 × 10^k, inteiro) tal que 4 passos cubram `max`. */
export function niceScale(max: number): { max: number; ticks: number[] } {
  if (!Number.isFinite(max) || max <= 4) return { max: 4, ticks: [0, 1, 2, 3, 4] };
  const exp = Math.floor(Math.log10(max));
  for (let e = Math.max(0, exp - 1); e <= exp + 1; e++) {
    for (const m of [1, 2, 2.5, 5]) {
      const step = m * 10 ** e;
      if (Number.isInteger(step) && step * 4 >= max) return { max: step * 4, ticks: [0, 1, 2, 3, 4].map((i) => step * i) };
    }
  }
  const step = 10 ** (exp + 1);
  return { max: step * 4, ticks: [0, 1, 2, 3, 4].map((i) => step * i) };
}

export interface Point {
  x: number;
  y: number;
}

/** Posições (em px do viewBox) de uma série dentro da área do gráfico. */
export function seriesPoints(values: readonly number[], width: number, height: number, max: number): Point[] {
  const n = values.length;
  return values.map((v, i) => ({
    x: n === 1 ? width / 2 : (i / (n - 1)) * width,
    y: max > 0 ? height - (Math.min(v, max) / max) * height : height,
  }));
}

export function linePath(points: readonly Point[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

export function areaPath(points: readonly Point[], height: number): string {
  if (points.length === 0) return '';
  const last = points[points.length - 1];
  return `${linePath(points)} L${last.x.toFixed(1)} ${height} L${points[0].x.toFixed(1)} ${height} Z`;
}

// ---------------------------------------------------------------------------
// Saúde dos serviços
// ---------------------------------------------------------------------------

export type HealthState = 'operational' | 'degraded' | 'unavailable' | 'unverified';
export type ServiceId = 'api' | 'database' | 'persistence' | 'email';
export type DetailCode = 'apiOk' | 'apiFail' | 'dbOk' | 'dbFail' | 'persistent' | 'volatile' | 'emailConfigured' | 'emailMissing' | 'unknown';

/** Resultado de uma verificação: null = não executada; ok:false = falhou (a causa fica em `code`). */
export type Probe<T> = { ok: true; data: T } | { ok: false; code: string } | null;

export interface ProbeSet {
  health: Probe<HealthData>;
  ready: Probe<ReadyData>;
  info: Probe<InfoData>;
  ops: Probe<OpsData>;
  /** Informação de persistência vinda de /admin/stats, quando já carregada. */
  stats?: Pick<StatsData, 'persistent' | 'store'> | null;
}

export interface ServiceHealth {
  id: ServiceId;
  state: HealthState;
  detail: DetailCode;
  params?: Record<string, string | number>;
}

function databaseCheck(p: ProbeSet): { status: 'ok' | 'error'; kind?: string; latencyMs: number } | null {
  if (p.ops?.ok) return p.ops.data.database;
  if (p.ready?.ok) return p.ready.data.checks.database;
  return null;
}

/**
 * Estado de cada serviço, somente a partir de verificações que de fato aconteceram.
 * Sem verificação → "unverified"; nunca "operational" por omissão.
 */
export function deriveServices(p: ProbeSet): ServiceHealth[] {
  const api: ServiceHealth = !p.health
    ? { id: 'api', state: 'unverified', detail: 'unknown' }
    : p.health.ok
      ? { id: 'api', state: 'operational', detail: 'apiOk' }
      : { id: 'api', state: 'unavailable', detail: 'apiFail' };

  const db = databaseCheck(p);
  const database: ServiceHealth = !db
    ? { id: 'database', state: 'unverified', detail: 'unknown' }
    : db.status === 'ok'
      ? { id: 'database', state: 'operational', detail: 'dbOk', params: { ms: db.latencyMs, kind: db.kind ?? '—' } }
      : { id: 'database', state: 'unavailable', detail: 'dbFail' };

  const persistent = p.info?.ok ? p.info.data.features.metricsPersistent : p.stats ? p.stats.persistent : null;
  const store = p.stats?.store ?? (p.ready?.ok ? p.ready.data.checks.database.kind : undefined) ?? '—';
  const persistence: ServiceHealth =
    persistent === null
      ? { id: 'persistence', state: 'unverified', detail: 'unknown' }
      : persistent
        ? { id: 'persistence', state: 'operational', detail: 'persistent', params: { store } }
        : { id: 'persistence', state: 'degraded', detail: 'volatile' };

  // O backend não testa o envio de e-mail: no máximo sabemos se está configurado.
  const email: ServiceHealth = !p.info?.ok
    ? { id: 'email', state: 'unverified', detail: 'unknown' }
    : p.info.data.features.contact
      ? { id: 'email', state: 'unverified', detail: 'emailConfigured' }
      : { id: 'email', state: 'unavailable', detail: 'emailMissing' };

  return [api, database, persistence, email];
}

/**
 * Resumo geral: considera API, banco e persistência (o e-mail é informativo, pois não é verificável).
 * Pior estado vence: indisponível > degradado > não verificado > operacional.
 */
export function overallState(services: readonly ServiceHealth[]): HealthState {
  const core = services.filter((s) => s.id !== 'email');
  if (core.some((s) => s.state === 'unavailable')) return 'unavailable';
  if (core.some((s) => s.state === 'degraded')) return 'degraded';
  if (core.some((s) => s.state === 'unverified')) return 'unverified';
  return 'operational';
}

// ---------------------------------------------------------------------------
// Formatação
// ---------------------------------------------------------------------------

const LOCALE: Record<Lang, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };

export function formatNumber(lang: Lang, n: number, digits = 0): string {
  return new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);
}

export function formatPercent(lang: Lang, pct: number): string {
  return `${formatNumber(lang, pct, 1)}%`;
}

/** "2026-11-18" → "18 nov" (curto) ou "18 nov 2026". Sem fuso: a data já é UTC. */
export function formatDay(lang: Lang, date: string, withYear = false): string {
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(ms)) return date;
  return new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(ms).replace(/\./g, '');
}

export function formatClock(lang: Lang, when: Date): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { hour: '2-digit', minute: '2-digit' }).format(when);
}

/** 93784 → "1 d 2 h" · 3700 → "1 h 1 min" · 42 → "42 s". Abreviações iguais nos três idiomas. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3_600);
  const m = Math.floor((s % 3_600) / 60);
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min ${s % 60} s`;
  return `${s} s`;
}
