import { useId, useState, type KeyboardEvent } from 'react';
import { BrandIcon } from './BrandIcon';

/**
 * Chip de tecnologia com tooltip (categoria). Abre ao passar o mouse, ao focar com o teclado
 * e ao tocar (o toque foca o chip). Esc fecha sem mover o foco (WCAG 1.4.13); o texto do
 * tooltip também é lido por leitores de tela (aria-describedby).
 */
export function TechChip({ name, hint }: { name: string; hint: string }) {
  const tipId = useId();
  const [dismissed, setDismissed] = useState(false);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setDismissed(true);
  };
  return (
    <li
      className="tech-chip"
      tabIndex={0}
      aria-describedby={tipId}
      data-dismissed={dismissed ? 'true' : undefined}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setDismissed(false)}
      onBlur={() => setDismissed(false)}
    >
      <BrandIcon name={name} size={20} />
      <span>{name}</span>
      <span id={tipId} role="tooltip" className="tip">
        {hint}
      </span>
    </li>
  );
}
