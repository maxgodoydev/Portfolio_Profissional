// Metadados por rota e idioma. Usado em dois lugares com a MESMA lógica:
//  - build (scripts/build.mjs): gera <head> de cada HTML estático;
//  - cliente (applySeo): atualiza title/meta/canonical/hreflang a cada troca de rota.
import { DEFAULT_LANG, HTML_LANG, LANGS, OG_LOCALE, dictionaries, type Dictionary, type Lang } from './i18n';
import { findProject } from './content/projects';
import { buildPath, isIndexable, type RouteId, type StaticRouteId } from './routes';

export interface Alternate {
  /** Valor de hreflang (pt-BR, en, es, x-default). */
  hreflang: string;
  href: string;
}

export interface SeoData {
  lang: Lang;
  route: RouteId;
  title: string;
  description: string;
  canonical: string;
  alternates: Alternate[];
  robots: string;
  og: {
    type: 'website';
    siteName: string;
    locale: string;
    alternateLocales: string[];
    url: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    imageWidth: number;
    imageHeight: number;
  };
}

export const SITE_NAME = 'Max Godoy';
export const OG_IMAGE_PATH = '/og-image.png';

type MetaKey = keyof Dictionary['meta'];

const META_KEY: Record<RouteId, MetaKey> = {
  home: 'home',
  about: 'about',
  projects: 'projects',
  project: 'projects', // título e descrição específicos vêm de content/projects.ts
  technologies: 'technologies',
  journey: 'journey',
  contact: 'contact',
  resume: 'resume',
  privacy: 'privacy',
  admin: 'admin',
  notFound: 'notFound',
};

export interface SeoInput {
  lang: Lang;
  route: RouteId;
  slug?: string;
  siteUrl: string;
  /** Sobrescritas opcionais (ex.: detalhe de projeto na Parte 2C). */
  title?: string;
  description?: string;
}

export function absoluteUrl(siteUrl: string, path: string): string {
  return siteUrl.replace(/\/+$/, '') + path;
}

export function buildSeo(input: SeoInput): SeoData {
  const { lang, route, slug, siteUrl } = input;
  const meta = dictionaries[lang].meta[META_KEY[route]];
  // Detalhe de projeto: título e descrição próprios (resumo no idioma da página).
  const project = route === 'project' ? findProject(slug) : undefined;
  const title = input.title ?? (project ? `${project.title} | ${SITE_NAME}` : meta.title);
  const description = input.description ?? (project ? project.summary[lang] : meta.description);
  const indexable = isIndexable(route);

  let canonical = absoluteUrl(siteUrl, `/${lang}/`);
  let alternates: Alternate[] = [];
  if (indexable) {
    const staticRoute = route as StaticRouteId | 'project';
    const pathFor = (l: Lang) => absoluteUrl(siteUrl, buildPath(l, staticRoute, slug));
    canonical = pathFor(lang);
    alternates = [
      ...LANGS.map((l) => ({ hreflang: HTML_LANG[l], href: pathFor(l) })),
      { hreflang: 'x-default', href: pathFor(DEFAULT_LANG) },
    ];
  }

  return {
    lang,
    route,
    title,
    description,
    canonical,
    alternates,
    robots: indexable ? 'index,follow' : 'noindex,nofollow',
    og: {
      type: 'website',
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      alternateLocales: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      url: canonical,
      title,
      description,
      image: absoluteUrl(siteUrl, OG_IMAGE_PATH),
      imageAlt: dictionaries[lang].meta.home.title,
      imageWidth: 1200,
      imageHeight: 630,
    },
  };
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** HTML das tags do <head> (usado no build). Cada tag tem data-seo para o cliente poder substituí-la. */
export function renderHeadTags(seo: SeoData): string {
  const lines: string[] = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" data-seo>`,
    `<meta name="robots" content="${seo.robots}" data-seo>`,
    `<link rel="canonical" href="${esc(seo.canonical)}" data-seo>`,
    ...seo.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" data-seo>`),
    `<meta property="og:type" content="${seo.og.type}" data-seo>`,
    `<meta property="og:site_name" content="${esc(seo.og.siteName)}" data-seo>`,
    `<meta property="og:locale" content="${seo.og.locale}" data-seo>`,
    ...seo.og.alternateLocales.map((l) => `<meta property="og:locale:alternate" content="${l}" data-seo>`),
    `<meta property="og:url" content="${esc(seo.og.url)}" data-seo>`,
    `<meta property="og:title" content="${esc(seo.og.title)}" data-seo>`,
    `<meta property="og:description" content="${esc(seo.og.description)}" data-seo>`,
    `<meta property="og:image" content="${esc(seo.og.image)}" data-seo>`,
    `<meta property="og:image:width" content="${seo.og.imageWidth}" data-seo>`,
    `<meta property="og:image:height" content="${seo.og.imageHeight}" data-seo>`,
    `<meta property="og:image:alt" content="${esc(seo.og.imageAlt)}" data-seo>`,
    `<meta name="twitter:card" content="summary_large_image" data-seo>`,
    `<meta name="twitter:title" content="${esc(seo.og.title)}" data-seo>`,
    `<meta name="twitter:description" content="${esc(seo.og.description)}" data-seo>`,
    `<meta name="twitter:image" content="${esc(seo.og.image)}" data-seo>`,
  ];
  return lines.join('\n    ');
}

/** Atualiza o <head> no navegador. Remove as tags [data-seo] anteriores e recria a partir de `seo`. */
export function applySeo(seo: SeoData): void {
  document.title = seo.title;
  document.querySelectorAll('head [data-seo]').forEach((el) => el.remove());
  const template = document.createElement('template');
  template.innerHTML = renderHeadTags(seo)
    .replace(/<title>[\s\S]*?<\/title>\s*/, '');
  document.head.appendChild(template.content);
}
