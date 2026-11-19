// Rótulos legíveis para valores crus da API (caminhos, slugs, categorias).
import type { Dictionary, Lang } from '../i18n';
import { findProject } from '../content/projects';
import { parseLocation, type RouteId } from '../routes';
import { THEMES } from '../theme/themes';

const PAGE_ROUTES: Partial<Record<RouteId, keyof Dictionary['nav']>> = {
  home: 'home',
  about: 'about',
  projects: 'projects',
  technologies: 'technologies',
  journey: 'journey',
  contact: 'contact',
  resume: 'resume',
};

/** "/pt/about" → "Sobre (PT)"; "/en/projects/x" → "Projects: Título (EN)". Desconhecido → o próprio caminho. */
export function pageLabel(path: string, t: Dictionary): string {
  const loc = parseLocation(path);
  const suffix = loc.lang ? ` (${loc.lang.toUpperCase()})` : '';
  if (loc.route === 'project' && loc.slug) {
    const project = findProject(loc.slug);
    return `${t.nav.projects}: ${project?.title ?? loc.slug}${suffix}`;
  }
  if (loc.route === 'privacy') return `${t.privacy.title}${suffix}`;
  const key = PAGE_ROUTES[loc.route];
  return key ? `${t.nav[key]}${suffix}` : path;
}

export function projectLabel(slug: string): string {
  return findProject(slug)?.title ?? slug;
}

export function themeLabel(id: string): string {
  return THEMES.find((th) => th.id === id)?.name ?? id;
}

/** Idioma (pt|en|es) → nome no idioma da interface; valor desconhecido → o próprio valor. */
export function langLabel(code: string, t: Dictionary): string {
  return code === 'pt' || code === 'en' || code === 'es' ? t.admin.analytics.languages[code] : code;
}

export function sourceLabel(code: string, t: Dictionary): string {
  const s = t.admin.analytics.sources;
  return code === 'direct' || code === 'search' || code === 'social' || code === 'github' || code === 'linkedin' || code === 'other' ? s[code] : code;
}

export function deviceLabel(code: string, t: Dictionary): string {
  const d = t.admin.analytics.devices;
  return code === 'mobile' || code === 'tablet' || code === 'desktop' ? d[code] : code;
}

export type { Lang };
