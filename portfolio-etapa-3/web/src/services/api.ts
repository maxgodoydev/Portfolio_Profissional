// Cliente tipado da API Go (/api). Reflete SOMENTE as rotas que existem no backend:
//   GET /health · GET /ready · GET /info · POST /events · POST /contact
//   POST /admin/login · POST /admin/logout · GET /admin/session · GET /admin/stats · GET /admin/ops
// (POST /assistant está reservada e responde 501; não há função para ela.)
import type { Lang } from '../i18n';
import type { ThemeId } from '../theme/themes';

const BASE = '/api';
const DEFAULT_TIMEOUT_MS = 10_000;

// ---- Envelope ----

export interface ApiErrorBody {
  code: string;
  message: string;
  /** Erros por campo (ex.: 422 validation_error → { email: "e-mail inválido" }). */
  details?: Record<string, string>;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: ApiErrorBody;
  requestId?: string;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

/** Erro lançado por toda chamada que não termina em sucesso. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string>;
  readonly requestId?: string;
  /** Segundos sugeridos pelo cabeçalho Retry-After (429). */
  readonly retryAfter?: number;

  constructor(init: { status: number; code: string; message: string; details?: Record<string, string>; requestId?: string; retryAfter?: number }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.requestId = init.requestId;
    this.retryAfter = init.retryAfter;
  }

  /** Falha de rede/timeout/resposta que não é da API (status 0 ou 'invalid_response'). */
  get isNetwork(): boolean {
    return this.status === 0 || this.code === 'invalid_response';
  }
}

// ---- Tipos das respostas ----

export interface HealthData {
  status: 'ok';
  time: string;
}

export interface DatabaseCheck {
  status: 'ok' | 'error';
  kind?: string;
  latencyMs: number;
}

export interface ReadyData {
  status: 'ready' | 'degraded';
  checks: { database: DatabaseCheck };
}

export interface InfoData {
  service: string;
  environment: string;
  commit: string;
  uptimeSeconds: number;
  features: {
    metricsPersistent: boolean;
    contact: boolean;
    assistant: boolean;
  };
}

export type EventType = 'pageview' | 'project_view' | 'resume_download' | 'theme_change';

/**
 * Corpo de POST /events.
 *  - project_view: target = slug do projeto
 *  - resume_download: target = idioma do currículo (pt|en|es)
 *  - theme_change: target = id do tema
 *  - referrer: apenas o hostname
 */
export interface EventPayload {
  type: EventType;
  path: string;
  lang: Lang;
  target?: string;
  theme?: ThemeId;
  referrer?: string;
}

export interface EventResult {
  recorded: boolean;
  /** Presente quando não gravou de propósito: 'dnt' ou 'automated'. */
  reason?: 'dnt' | 'automated';
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  lang: Lang;
  /** Honeypot: deve ir vazio. */
  website: string;
}

export interface ContactResult {
  sent: boolean;
}

export interface AuthState {
  authenticated: boolean;
}

export interface Count {
  label: string;
  value: number;
}

export interface DayPoint {
  date: string;
  pageViews: number;
  sessions: number;
}

export interface StatsData {
  days: number;
  from: string;
  to: string;
  totalPageViews: number;
  totalSessions: number;
  projectViews: number;
  resumeDownloads: number;
  daily: DayPoint[];
  topPages: Count[];
  topProjects: Count[];
  resumeByLang: Count[];
  languages: Count[];
  devices: Count[];
  sources: Count[];
  themes: Count[];
  persistent: boolean;
  store: string;
}

export interface RouteStat {
  route: string;
  count: number;
  errors: number;
  avgMs: number;
  maxMs: number;
}

export interface RecentError {
  time: string;
  route: string;
  status: number;
  requestId: string;
}

export interface OpsData {
  scope: 'instance';
  uptimeSeconds: number;
  requests: number;
  errors: number;
  routes: RouteStat[];
  recentErrors: RecentError[];
  database: DatabaseCheck;
}

// ---- Núcleo ----

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  query?: Record<string, string | number>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Mantém a requisição viva ao sair da página (útil para métricas). */
  keepalive?: boolean;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function send(path: string, opts: RequestOptions): Promise<{ response: Response; json: unknown }> {
  const url = new URL(BASE + path, window.location.origin);
  for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, String(v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onAbort, { once: true });

  let response: Response;
  try {
    response = await fetch(url, {
      method: opts.method ?? 'GET',
      headers: opts.body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: 'same-origin',
      keepalive: opts.keepalive,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError({ status: 0, code: 'network_error', message: 'Falha de rede ou tempo esgotado.' });
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  return { response, json };
}

function toApiError(response: Response, json: unknown): ApiError {
  const retry = Number(response.headers.get('Retry-After'));
  const retryAfter = Number.isFinite(retry) && retry > 0 ? retry : undefined;
  if (isRecord(json) && json.ok === false && isRecord(json.error) && typeof json.error.code === 'string') {
    const e = json.error as unknown as ApiErrorBody;
    return new ApiError({
      status: response.status,
      code: e.code,
      message: typeof e.message === 'string' ? e.message : response.statusText,
      details: e.details,
      requestId: typeof json.requestId === 'string' ? json.requestId : undefined,
      retryAfter,
    });
  }
  return new ApiError({ status: response.status, code: 'invalid_response', message: 'Resposta inesperada do servidor.', retryAfter });
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { response, json } = await send(path, opts);
  if (response.ok && isRecord(json) && json.ok === true) return json.data as T;
  throw toApiError(response, json);
}

// ---- Rotas públicas ----

export const getHealth = (signal?: AbortSignal) => request<HealthData>('/health', { signal });

/**
 * GET /ready devolve 503 com o corpo { ok:false, data:{status:'degraded', checks} } (sem `error`).
 * Por isso o corpo é devolvido nos dois casos; falhas de rede lançam ApiError.
 */
export async function getReady(signal?: AbortSignal): Promise<ReadyData> {
  const { response, json } = await send('/ready', { signal });
  if (isRecord(json) && isRecord(json.data) && typeof json.data.status === 'string') return json.data as unknown as ReadyData;
  throw toApiError(response, json);
}

export const getInfo = (signal?: AbortSignal) => request<InfoData>('/info', { signal });

export const postEvent = (payload: EventPayload, signal?: AbortSignal) =>
  request<EventResult>('/events', { method: 'POST', body: payload, signal, keepalive: true, timeoutMs: 5_000 });

export const postContact = (payload: ContactPayload, signal?: AbortSignal) =>
  request<ContactResult>('/contact', { method: 'POST', body: payload, signal, timeoutMs: 15_000 });

// ---- Rotas administrativas (cookie HttpOnly) ----

export const adminLogin = (password: string, signal?: AbortSignal) =>
  request<AuthState>('/admin/login', { method: 'POST', body: { password }, signal });

export const adminLogout = (signal?: AbortSignal) => request<AuthState>('/admin/logout', { method: 'POST', signal });

export const adminSession = (signal?: AbortSignal) => request<AuthState>('/admin/session', { signal });

/** days: 1 a 365 (o backend responde 422 fora desse intervalo). */
export const adminStats = (days = 30, signal?: AbortSignal) => request<StatsData>('/admin/stats', { query: { days }, signal }).then(normalizeStats);

/** Defesa em profundidade: listas ausentes ou null viram [] (o painel nunca deve quebrar por isso). */
export function normalizeOps(raw: OpsData): OpsData {
  return { ...raw, routes: Array.isArray(raw.routes) ? raw.routes : [], recentErrors: Array.isArray(raw.recentErrors) ? raw.recentErrors : [] };
}

export function normalizeStats(raw: StatsData): StatsData {
  const list = <T,>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : []);
  return {
    ...raw,
    daily: list(raw.daily),
    topPages: list(raw.topPages),
    topProjects: list(raw.topProjects),
    resumeByLang: list(raw.resumeByLang),
    languages: list(raw.languages),
    devices: list(raw.devices),
    sources: list(raw.sources),
    themes: list(raw.themes),
  };
}

export const adminOps = (signal?: AbortSignal) => request<OpsData>('/admin/ops', { signal }).then(normalizeOps);
