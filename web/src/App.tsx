import { useEffect, useRef } from 'react';
import { useI18n } from './i18n/context';
import { AdminApp } from './admin/AdminApp';
import { Layout } from './components/Layout';
import { renderPage } from './pages';
import { useLocation } from './router';
import { applySeo, buildSeo } from './seo';
import { findProject } from './content/projects';
import { track } from './services/analytics';

export function App() {
  const { lang } = useI18n();
  const location = useLocation();
  const { route, slug } = location;

  // Metadados (title, description, canonical, hreflang, Open Graph) por rota e idioma.
  useEffect(() => {
    applySeo(buildSeo({ lang, route, slug, siteUrl: __SITE_URL__ }));
  }, [lang, route, slug]);

  // Métricas anônimas (respeitam DNT/GPC; falhas nunca afetam a navegação). Depende do caminho,
  // não do idioma/rota: a visita em "/" só é medida depois do redirecionamento para /pt/, /en/ ou /es/.
  const pathname = location.href.split('?')[0];
  useEffect(() => {
    track('pageview');
    if (route === 'project' && slug && findProject(slug)) track('project_view', { target: slug });
  }, [pathname, route, slug]);

  // Acessibilidade: ao trocar de página (não de query/idioma), leva o foco ao conteúdo principal.
  const pageKey = `${route}:${slug ?? ''}`;
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (previous.current !== null && previous.current !== pageKey) {
      document.getElementById('conteudo')?.focus({ preventScroll: true });
    }
    previous.current = pageKey;
  }, [pageKey]);

  // A área administrativa tem estrutura própria (menu lateral, sem cabeçalho/rodapé públicos).
  if (route === 'admin') return <AdminApp />;
  return <Layout>{renderPage(location)}</Layout>;
}
