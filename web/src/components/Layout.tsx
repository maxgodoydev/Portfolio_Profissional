import { useEffect, type ReactNode } from 'react';
import { useI18n } from '../i18n/context';
import { observeReveals } from '../lib/reveal';
import { useLocation } from '../router';
import { Footer } from './Footer';
import { Header } from './Header';

/** Estrutura global: link para pular ao conteúdo, cabeçalho, <main> e rodapé. */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { href } = useLocation();
  const pathname = href.split('?')[0];
  // Ativa a entrada ao rolar nos elementos [data-reveal] da página atual (após a renderização).
  useEffect(() => {
    const main = document.getElementById('conteudo');
    return main ? observeReveals(main) : undefined;
  }, [pathname]);
  return (
    <>
      <div className="ambient" aria-hidden="true" />
      <a className="skip-link" href="#conteudo">
        {t.nav.skip}
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="container main">
        {children}
      </main>
      <Footer />
    </>
  );
}
