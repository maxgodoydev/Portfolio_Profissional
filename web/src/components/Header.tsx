import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useI18n } from '../i18n/context';
import { Link, useLocation } from '../router';
import { buildPath, type StaticRouteId } from '../routes';
import { Icon } from './icons';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

export const MENU_ROUTES = ['about', 'projects', 'technologies', 'journey', 'contact', 'resume'] as const satisfies readonly StaticRouteId[];

const DESKTOP_QUERY = '(min-width: 56.25em)'; // 900px — mantém em sincronia com components.css

export function Header() {
  const { lang, t } = useI18n();
  const { route, href } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const pathname = href.split('?')[0];

  // Fecha o menu ao navegar.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Fecha com Escape (devolvendo o foco ao botão), ao clicar fora e ao alargar a janela.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: Event) => {
      const target = e.target as Node;
      if (!navRef.current?.contains(target) && !buttonRef.current?.contains(target)) setMenuOpen(false);
    };
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => mq.matches && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    mq.addEventListener('change', onChange);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      mq.removeEventListener('change', onChange);
    };
  }, [menuOpen]);

  // Com o menu aberto no celular, a página atrás não rola (classe lida só abaixo de 900px no CSS).
  useEffect(() => {
    document.documentElement.classList.toggle('nav-open', menuOpen);
    return () => document.documentElement.classList.remove('nav-open');
  }, [menuOpen]);

  const navId = 'menu-principal';

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <Link className="brand" to={buildPath(lang, 'home')} aria-label={t.common.home} aria-current={route === 'home' ? 'page' : undefined}>
          Max Godoy
        </Link>

        <div className="site-nav-scrim" data-open={menuOpen ? 'true' : 'false'} aria-hidden="true" onClick={() => setMenuOpen(false)} />

        <nav id={navId} ref={navRef} className="site-nav" aria-label={t.nav.primary} data-open={menuOpen ? 'true' : 'false'}>
          <ul className="site-nav__list">
            {MENU_ROUTES.map((id, i) => {
              const active = route === id || (id === 'projects' && route === 'project');
              return (
                <li key={id} style={{ '--i': i } as CSSProperties}>
                  <Link to={buildPath(lang, id)} className="site-nav__link" aria-current={active ? 'page' : undefined}>
                    <span>{t.nav[id]}</span>
                    <Icon name={active ? 'check' : 'arrowRight'} size={18} className="site-nav__mark" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__tools">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <button
            ref={buttonRef}
            type="button"
            className="icon-button site-header__menu-button"
            aria-expanded={menuOpen}
            aria-controls={navId}
            aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
