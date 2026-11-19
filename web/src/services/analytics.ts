// Rastreamento anônimo de uso (POST /api/events). Princípios:
//  - respeita Do Not Track e Global Privacy Control (e o servidor confere de novo);
//  - nunca lança exceção nem bloqueia a navegação: toda falha é engolida;
//  - envia só o necessário: tipo, caminho (sem query/hash), idioma, alvo, tema e o
//    HOSTNAME de origem (nunca a URL completa do referrer);
//  - evita duplicatas (StrictMode, re-render, cliques repetidos);
//  - desiste da sessão após falhas seguidas (API fora do ar, 429) para não gerar ruído.
// Contrato do backend: internal/server/events.go. Tipos aceitos: pageview, project_view,
// resume_download, theme_change. O backend NÃO tem evento de troca de idioma: o idioma
// vai no campo `lang` de cada evento.
import { isLang, type Lang } from '../i18n';
import { parseLocation, isAdminRoute } from '../routes';
import { isThemeId } from '../theme/themes';
import { postEvent, type EventPayload, type EventType } from './api';

const MAX_FAILURES = 3;
/** Janela mínima entre dois eventos idênticos no cliente (ms). */
const DEDUPE_MS: Record<EventType, number> = {
  pageview: 1_500,
  project_view: 1_500,
  resume_download: 5_000,
  theme_change: 800,
};

const recent = new Map<string, number>();
let failures = 0;
let referrerSent = false;

interface NavigatorPrivacy {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
}

/** true quando o visitante pediu para não ser medido (DNT=1 ou GPC). */
export function privacySignalOn(): boolean {
  try {
    const nav = navigator as Navigator & NavigatorPrivacy;
    const win = window as Window & { doNotTrack?: string | null };
    const dnt = nav.doNotTrack ?? win.doNotTrack;
    return dnt === '1' || dnt === 'yes' || nav.globalPrivacyControl === true;
  } catch {
    return true; // na dúvida, não mede
  }
}

/** Apenas o hostname do referrer, e somente quando vem de outro site. */
export function externalReferrerHost(referrer: string, ownHost: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (!host || host === ownHost.toLowerCase()) return undefined;
    return /^[a-z0-9.-]{1,100}$/.test(host) ? host : undefined;
  } catch {
    return undefined;
  }
}

function isDuplicate(key: string, type: EventType, now: number): boolean {
  const last = recent.get(key);
  if (last !== undefined && now - last < DEDUPE_MS[type]) return true;
  recent.set(key, now);
  if (recent.size > 100) recent.clear();
  return false;
}

export interface TrackOptions {
  /** project_view: slug · resume_download: idioma do PDF · theme_change: id do tema. */
  target?: string;
}

/**
 * Registra um evento. Nunca lança exceção. Devolve true se a requisição foi disparada.
 * O caminho e o idioma vêm da própria URL, que é a fonte de verdade do site.
 */
export function track(type: EventType, options: TrackOptions = {}): boolean {
  try {
    if (typeof window === 'undefined' || failures >= MAX_FAILURES) return false;
    if (privacySignalOn() || navigator.webdriver) return false;

    const loc = parseLocation(window.location.pathname);
    const lang: Lang | null = loc.lang && isLang(loc.lang) ? loc.lang : null;
    if (!lang || isAdminRoute(loc.route) || loc.route === 'notFound') return false;
    if (window.location.search.includes('demo=')) return false;

    const path = window.location.pathname;
    const target = type === 'pageview' ? '' : (options.target ?? '');
    if (type !== 'pageview' && !target) return false;
    if (isDuplicate(`${type}|${path}|${target}`, type, Date.now())) return false;

    const payload: EventPayload = { type, path, lang };
    if (target) payload.target = target;
    const themeAttr = document.documentElement.getAttribute('data-theme');
    if (isThemeId(themeAttr)) payload.theme = themeAttr;
    if (type === 'pageview' && !referrerSent) {
      referrerSent = true; // só a primeira visualização carrega a origem
      const host = externalReferrerHost(document.referrer, window.location.hostname);
      if (host) payload.referrer = host;
    }

    postEvent(payload).then(
      () => {
        failures = 0;
      },
      (err: unknown) => {
        failures += 1;
        // 429 (limite) ou 403 (origem não permitida): insistir não ajuda.
        const status = typeof err === 'object' && err !== null && 'status' in err ? Number((err as { status: unknown }).status) : 0;
        if (status === 429 || status === 403) failures = MAX_FAILURES;
      },
    );
    return true;
  } catch {
    return false;
  }
}

/** Somente para testes: limpa o estado do módulo. */
export function __resetAnalyticsForTests(): void {
  recent.clear();
  failures = 0;
  referrerSent = false;
}
