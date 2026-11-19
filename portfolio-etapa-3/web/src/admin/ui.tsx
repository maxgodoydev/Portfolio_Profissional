// Peças de interface do painel. Tudo acessível por padrão: rótulos reais, estado nunca só por cor.
import { useId, type ReactNode } from 'react';
import { useI18n } from '../i18n/context';
import { format } from '../i18n';
import type { ApiError } from '../services/api';
import { formatNumber, formatPercent, type HealthState, type Share } from '../lib/adminData';

export function Panel({ title, note, children, actions, wide }: { title: string; note?: ReactNode; children: ReactNode; actions?: ReactNode; wide?: boolean }) {
  const id = useId();
  return (
    <section className={wide ? 'adm-panel adm-panel--wide' : 'adm-panel'} aria-labelledby={id}>
      <header className="adm-panel__head">
        <h2 id={id}>{title}</h2>
        {actions}
      </header>
      {children}
      {note ? <p className="adm-note">{note}</p> : null}
    </section>
  );
}

export function Kpi({ label, value, help, extra }: { label: string; value: string; help: string; extra?: ReactNode }) {
  return (
    <div className="adm-kpi">
      <dt>{label}</dt>
      <dd className="adm-kpi__value">{value}</dd>
      {extra ? <dd className="adm-kpi__extra">{extra}</dd> : null}
      <dd className="adm-kpi__help">{help}</dd>
    </div>
  );
}

export function Skeleton({ height = '1rem', width = '100%' }: { height?: string; width?: string }) {
  return <span className="adm-skeleton" aria-hidden="true" style={{ height, width }} />;
}

/** Marcador visual de carregamento: o texto "Carregando" vai para leitores de tela. */
export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  const { t } = useI18n();
  return (
    <div className="adm-loading" role="status" aria-live="polite">
      <span className="visually-hidden">{t.admin.loading}</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={i === 0 ? '2rem' : '1rem'} width={i === 0 ? '40%' : `${90 - i * 12}%`} />
      ))}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="adm-empty">
      <p className="adm-empty__title">{title}</p>
      {text ? <p className="adm-empty__text">{text}</p> : null}
    </div>
  );
}

export function SectionEmpty() {
  const { t } = useI18n();
  return <p className="adm-empty__text">{t.admin.empty.section}</p>;
}

export function errorMessage(err: ApiError, t: ReturnType<typeof useI18n>['t']): string {
  if (err.isNetwork) return t.admin.loadError.network;
  if (err.code === 'store_unavailable') return t.admin.loadError.store;
  return t.admin.loadError.generic;
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="adm-error" role="alert">
      <p className="adm-error__title">{t.admin.loadError.title}</p>
      <p>{errorMessage(error, t)}</p>
      {error.requestId ? <p className="adm-error__id">{format(t.admin.loadError.requestId, { id: error.requestId })}</p> : null}
      <button type="button" className="adm-btn" onClick={onRetry}>
        {t.admin.loadError.retry}
      </button>
    </div>
  );
}

const GLYPH: Record<HealthState, ReactNode> = {
  operational: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  degraded: <path d="M12 4l9 16H3L12 4zM12 10v4M12 17.5v.01" />,
  unavailable: <path d="M6 6l12 12M18 6L6 18" />,
  unverified: <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.1 1-1.1 1.8M12 17v.01" />,
};

export function StatusBadge({ state }: { state: HealthState }) {
  const { t } = useI18n();
  return (
    <span className={`adm-status adm-status--${state}`}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {GLYPH[state]}
      </svg>
      {t.admin.monitoring.status[state]}
    </span>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  numeric?: boolean;
}

export function DataTable<T>({ caption, columns, rows, rowKey }: { caption: string; columns: readonly Column<T>[]; rows: readonly T[]; rowKey: (row: T, index: number) => string }) {
  const id = useId();
  return (
    <div className="adm-table-wrap" role="region" aria-labelledby={id} tabIndex={0}>
      <table className="adm-table">
        <caption id={id} className="visually-hidden">
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.numeric ? 'is-num' : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? 'is-num' : undefined}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Lista ordenada com barras proporcionais ao maior valor; o texto carrega os números. */
export function BarList({ items, label, valueHeader }: { items: readonly Share[]; label: (c: Share) => string; valueHeader?: string }) {
  const { lang } = useI18n();
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ol className="adm-bars" aria-label={valueHeader}>
      {items.map((item) => (
        <li key={item.label} className="adm-bars__row">
          <span className="adm-bars__label">{label(item)}</span>
          <span className="adm-bars__value">
            {formatNumber(lang, item.value)} <span className="adm-bars__pct">· {formatPercent(lang, item.pct)}</span>
          </span>
          <span className="adm-bars__track" aria-hidden="true">
            <span className="adm-bars__fill" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Barra segmentada (distribuição). A legenda com valores é a fonte de leitura; a barra é decorativa. */
export function StackedBar({ items, label }: { items: readonly Share[]; label: (c: Share) => string }) {
  const { lang } = useI18n();
  return (
    <div className="adm-stack">
      <div className="adm-stack__bar" aria-hidden="true">
        {items.map((item, i) => (
          <span key={item.label} className={`adm-stack__seg adm-stack__seg--${i % 6}`} style={{ flexGrow: item.value }} />
        ))}
      </div>
      <ul className="adm-stack__legend">
        {items.map((item, i) => (
          <li key={item.label}>
            <span className={`adm-stack__swatch adm-stack__seg--${i % 6}`} aria-hidden="true" />
            <span className="adm-stack__name">{label(item)}</span>
            <span className="adm-stack__num">
              {formatNumber(lang, item.value)} · {formatPercent(lang, item.pct)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
