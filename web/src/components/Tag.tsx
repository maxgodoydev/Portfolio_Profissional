import type { ReactNode } from 'react';
import { BrandIcon } from './BrandIcon';
import { Highlight } from './Highlight';

interface TagProps {
  children: ReactNode;
  /** `accent` destaca (ex.: status); `outline` é a versão discreta. */
  tone?: 'default' | 'accent' | 'outline';
  /** Nome da tecnologia para exibir o logo de marca antes do texto (ignorado se não houver logo). */
  icon?: string;
}

/** Rótulo curto (tecnologia, categoria, status). Contraste: texto --ink sobre --soft. */
export function Tag({ children, tone = 'default', icon }: TagProps) {
  return (
    <span className={`tag tag--${tone}`}>
      {icon && <BrandIcon name={icon} size={14} />}
      <span className="tag__text">{children}</span>
    </span>
  );
}

export function TagList({ items, label, tokens = [] }: { items: readonly string[]; label?: string; /** Termos da busca a destacar (já normalizados). */ tokens?: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="tag-list" aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <Tag icon={item}>
            <Highlight text={item} tokens={tokens} />
          </Tag>
        </li>
      ))}
    </ul>
  );
}
