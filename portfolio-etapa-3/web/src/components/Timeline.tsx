import type { ReactNode } from 'react';
import { Tag } from './Tag';

export interface TimelineItem {
  id: string;
  /** Período já formatado (ex.: "2024 — atual"). */
  period: string;
  title: string;
  subtitle?: string;
  description?: ReactNode;
  /** Etiqueta curta (ex.: "Em andamento", "Previsto"). */
  badge?: string;
  /** Marca o item como o momento atual (marcador preenchido). */
  current?: boolean;
  /** Tipo do item (work, education, course, milestone, project): varia o marcador e mostra a etiqueta. */
  kind?: string;
  /** Texto traduzido do tipo, mostrado antes do período. */
  kindLabel?: string;
}

/** Linha do tempo vertical, semântica (<ol>). Cores só de variáveis do tema. */
export function Timeline({ items, label }: { items: readonly TimelineItem[]; label?: string }) {
  return (
    <ol className="timeline" aria-label={label}>
      {items.map((item) => (
        <li key={item.id} className="timeline__item" data-current={item.current ? 'true' : undefined} data-kind={item.kind}>
          <span className="timeline__marker" aria-hidden="true" />
          <p className="timeline__period">
            {item.kindLabel && <span className="timeline__kind">{item.kindLabel}</span>}
            {item.kindLabel && <span aria-hidden="true"> · </span>}
            {item.period}
          </p>
          <h3 className="timeline__title">
            {item.title}
            {item.badge && (
              <>
                {' '}
                <Tag tone={item.current ? 'accent' : 'outline'}>{item.badge}</Tag>
              </>
            )}
          </h3>
          {item.subtitle && <p className="timeline__subtitle">{item.subtitle}</p>}
          {item.description && <div className="timeline__text">{item.description}</div>}
        </li>
      ))}
    </ol>
  );
}
