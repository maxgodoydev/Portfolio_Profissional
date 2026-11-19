import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  /** `accent` destaca (ex.: status); `outline` é a versão discreta. */
  tone?: 'default' | 'accent' | 'outline';
}

/** Rótulo curto (tecnologia, categoria, status). Contraste: texto --ink sobre --soft. */
export function Tag({ children, tone = 'default' }: TagProps) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}

export function TagList({ items, label }: { items: readonly string[]; label?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="tag-list" aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
