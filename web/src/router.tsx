// Roteador próprio (History API + useSyncExternalStore). Sem react-router.
import { useCallback, useMemo, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { parseLocation, type ParsedLocation } from './routes';

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

// O snapshot é uma string (estável entre renders quando a URL não muda).
function getSnapshot(): string {
  return window.location.pathname + window.location.search;
}

function getServerSnapshot(): string {
  return '/';
}

export interface NavigateOptions {
  replace?: boolean;
  /** Mantém a posição de rolagem (padrão: rola ao topo, exceto para âncoras #). */
  keepScroll?: boolean;
}

/** Navega sem recarregar a página. Aceita caminhos internos (começando com "/"). */
export function navigate(to: string, options: NavigateOptions = {}): void {
  const target = new URL(to, window.location.origin);
  if (target.origin !== window.location.origin) {
    window.location.assign(to);
    return;
  }
  const next = target.pathname + target.search + target.hash;
  const current = window.location.pathname + window.location.search + window.location.hash;
  if (next !== current) {
    if (options.replace) window.history.replaceState(null, '', next);
    else window.history.pushState(null, '', next);
    emit();
  }
  if (!options.keepScroll && !target.hash) window.scrollTo(0, 0);
}

/** Localização atual interpretada (idioma, rota, slug, query). */
export function useLocation(): ParsedLocation & { href: string } {
  const href = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    const q = href.indexOf('?');
    const pathname = q === -1 ? href : href.slice(0, q);
    const search = q === -1 ? '' : href.slice(q);
    return { ...parseLocation(pathname, search), href };
  }, [href]);
}

export function useNavigate(): typeof navigate {
  return useCallback(navigate, []);
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children?: ReactNode;
}

function isExternal(to: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(to);
}

/** Link interno com navegação por History API; links externos seguem o comportamento nativo. */
export function Link({ to, onClick, target, children, ...rest }: LinkProps) {
  const external = isExternal(to);
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      external ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (target && target !== '_self')
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };
  const extra = external && target === '_blank' ? { rel: 'noopener noreferrer' } : {};
  return (
    <a href={to} target={target} onClick={handleClick} {...extra} {...rest}>
      {children}
    </a>
  );
}
