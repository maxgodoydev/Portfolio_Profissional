import type { ReactNode } from 'react';
import { useI18n } from '../i18n/context';
import { Footer } from './Footer';
import { Header } from './Header';

/** Estrutura global: link para pular ao conteúdo, cabeçalho, <main> e rodapé. */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <>
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
