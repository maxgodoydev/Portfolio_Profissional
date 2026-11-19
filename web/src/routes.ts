// Definição única das rotas. Usada pelo roteador (cliente) e pelo build (HTML, sitemap).
// URLs: /{pt|en|es}/{rota}. Os segmentos são iguais nos três idiomas (decisão de projeto:
// um único conjunto de caminhos facilita hreflang, troca de idioma e manutenção).
import { DEFAULT_LANG, isLang, type Lang } from './i18n';

export type RouteId =
  | 'home'
  | 'about'
  | 'projects'
  | 'project'
  | 'technologies'
  | 'journey'
  | 'contact'
  | 'resume'
  | 'privacy'
  | 'admin'
  | 'notFound';

/** Rotas estáticas (sem parâmetros), na ordem do menu. */
export const STATIC_ROUTES = [
  'home',
  'about',
  'projects',
  'technologies',
  'journey',
  'contact',
  'resume',
  'privacy',
  'admin',
] as const satisfies readonly RouteId[];

export type StaticRouteId = (typeof STATIC_ROUTES)[number];

const SEGMENT: Record<StaticRouteId, string> = {
  home: '',
  about: 'about',
  projects: 'projects',
  technologies: 'technologies',
  journey: 'journey',
  contact: 'contact',
  resume: 'resume',
  privacy: 'privacy',
  admin: 'admin',
};

const BY_SEGMENT = new Map<string, StaticRouteId>(
  (Object.keys(SEGMENT) as StaticRouteId[]).filter((r) => SEGMENT[r] !== '').map((r) => [SEGMENT[r], r]),
);

/** Rotas que não devem ser indexadas nem medidas. */
export function isAdminRoute(route: RouteId): boolean {
  return route === 'admin';
}

/** Rotas incluídas no sitemap e nos menus públicos. */
export function isIndexable(route: RouteId): boolean {
  return route !== 'admin' && route !== 'notFound';
}

export interface ParsedLocation {
  /** Idioma indicado pela URL; `null` quando a URL não tem prefixo de idioma válido. */
  lang: Lang | null;
  route: RouteId;
  /** Slug do projeto quando route === 'project'. */
  slug?: string;
  /** Query string sem o "?" já decodificada. */
  query: URLSearchParams;
}

const SLUG_RE = /^[a-z0-9-]{1,60}$/;

/** Interpreta pathname (+ search) e identifica idioma e rota. Nunca lança exceção. */
export function parseLocation(pathname: string, search = ''): ParsedLocation {
  const query = new URLSearchParams(search);
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0];

  if (!first) return { lang: null, route: 'home', query }; // "/" → redireciona por idioma
  if (!isLang(first)) return { lang: null, route: 'notFound', query };

  const lang = first;
  const rest = parts.slice(1);
  if (rest.length === 0) return { lang, route: 'home', query };

  const [seg, extra, ...more] = rest;
  if (seg === 'projects' && extra !== undefined && more.length === 0) {
    return SLUG_RE.test(extra) ? { lang, route: 'project', slug: extra, query } : { lang, route: 'notFound', query };
  }
  const route = BY_SEGMENT.get(seg);
  if (route && extra === undefined) return { lang, route, query };
  return { lang, route: 'notFound', query };
}

/** Caminho (sem domínio) de uma rota. A home usa barra final: /pt/ ; as demais, não. */
export function buildPath(lang: Lang, route: StaticRouteId | 'project', slug?: string): string {
  if (route === 'project') return `/${lang}/projects/${slug ?? ''}`;
  const seg = SEGMENT[route];
  return seg === '' ? `/${lang}/` : `/${lang}/${seg}`;
}

/** Idioma preferido para visitantes em "/" ou em URLs sem prefixo. */
export function pickLanguage(stored: string | null, navigatorLanguages: readonly string[]): Lang {
  if (isLang(stored)) return stored;
  for (const tag of navigatorLanguages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

/** Troca o idioma mantendo a rota atual. */
export function switchLangPath(current: ParsedLocation, to: Lang): string {
  if (current.route === 'notFound' || current.lang === null) return buildPath(to, 'home');
  if (current.route === 'project') return buildPath(to, 'project', current.slug);
  // No painel, trocar de idioma mantém a tela aberta (?view=analytics).
  const keep = current.route === 'admin' && current.query.has('view') ? `?view=${encodeURIComponent(current.query.get('view') ?? '')}` : '';
  return buildPath(to, current.route) + keep;
}
