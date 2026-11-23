import { useId, type ReactNode } from 'react';
import { Icon } from '../components/icons';
import { useI18n } from '../i18n/context';
import { Link } from '../router';

export function PageHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="page-header" data-reveal>
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  const id = useId();
  return (
    <section className="section" aria-labelledby={id} data-reveal>
      <div className="section__head">
        <h2 id={id}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Link externo com aviso de nova aba para leitores de tela. */
export function ExternalLink({ href, children, variant = 'link' }: { href: string; children: ReactNode; variant?: 'link' | 'button' | 'ghost' }) {
  const { t } = useI18n();
  const cls = variant === 'link' ? 'ext-link' : variant === 'button' ? 'button' : 'button button--ghost';
  return (
    <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
      {children} <Icon name="external" size={16} />
      <span className="visually-hidden"> {t.common.newTab}</span>
    </a>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="text-link" to={to}>
      {children} <Icon name="arrowRight" size={16} />
    </Link>
  );
}
