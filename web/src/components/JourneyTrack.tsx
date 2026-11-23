import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { BrandIcon, hasBrandIcon } from './BrandIcon';
import { Icon, type IconName } from './icons';

export interface TrackItem {
  id: string;
  kind: string;
  kindLabel: string;
  kindIcon: IconName;
  period: string;
  title: string;
  org?: string;
  text?: ReactNode;
  badge?: string;
  current?: boolean;
  techs?: readonly string[];
}

/**
 * Linha do tempo horizontal: cartões pequenos em cores alternadas que deslizam para o lado.
 * Os cartões que saem pela esquerda vão se apagando (máscara nas bordas + redução de destaque) e os próximos
 * aparecem pela direita. Funciona por rolagem nativa (toque, trackpad, setas do teclado) e pelos botões.
 */
export function JourneyTrack({ items }: { items: readonly TrackItem[] }) {
  const { t } = useI18n();
  const j = t.journey;
  const trackRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const raf = useRef(0);
  /** Até este instante (ms) a rolagem suave dos botões está em andamento: o cartão ativo é o de destino. */
  const settleAt = useRef(0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    if (Date.now() < settleAt.current) return;
    const cards = Array.from(track.children) as HTMLElement[];
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - track.scrollLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || '0'));
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    // No fim da rolagem o último cartão é o ativo, mesmo que não alcance a borda esquerda.
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) best = cards.length - 1;
    setActive(best);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(measure);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [measure]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.max(0, Math.min(items.length - 1, index));
    const card = track.children[i] as HTMLElement | undefined;
    if (!card) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pad = parseFloat(getComputedStyle(track).paddingLeft || '0');
    settleAt.current = Date.now() + (reduce ? 0 : 650);
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft - pad, behavior: reduce ? 'auto' : 'smooth' });
    setActive(i);
    if (!reduce) window.setTimeout(measure, 700);
  };

  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(active - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(items.length - 1);
    }
  };

  const progress = items.length > 1 ? (active / (items.length - 1)) * 100 : 100;

  return (
    <div className="jt" data-start={active === 0 ? 'true' : 'false'} data-end={active === items.length - 1 ? 'true' : 'false'}>
      <div className="jt__bar">
        <p className="jt__position" role="status" aria-live="polite">
          {format(j.position, { n: active + 1, total: items.length })}
        </p>
        <div className="jt__buttons">
          <button type="button" className="icon-button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={j.prev}>
            <Icon name="arrowRight" size={18} className="jt__flip" />
          </button>
          <button type="button" className="icon-button" onClick={() => goTo(active + 1)} disabled={active === items.length - 1} aria-label={j.next}>
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
      </div>

      <ol ref={trackRef} className="jt__track" tabIndex={0} aria-label={j.trackLabel} onKeyDown={onKey}>
        {items.map((item, i) => {
          const pos = i < active ? 'past' : i === active ? 'active' : i === active + 1 ? 'next' : 'far';
          return (
            <li key={item.id} className="jt-card" data-tone={i % 4} data-pos={pos} data-kind={item.kind} data-current={item.current ? 'true' : undefined}>
              <p className="jt-card__meta">
                <span className="jt-card__kind">
                  <Icon name={item.kindIcon} size={14} /> {item.kindLabel}
                </span>
                <span className="jt-card__period">{item.period}</span>
              </p>
              <h3 className="jt-card__title">{item.title}</h3>
              {item.org && <p className="jt-card__org">{item.org}</p>}
              {item.badge && <p className="jt-card__badge">{item.badge}</p>}
              {item.text && <div className="jt-card__text">{item.text}</div>}
              {item.techs && item.techs.length > 0 && (
                <ul className="jt-card__techs" aria-label={j.techs}>
                  {item.techs.map((name) => (
                    <li key={name} className="jt-tech">
                      {hasBrandIcon(name) && <BrandIcon name={name} size={16} />}
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div className="jt__rail" aria-hidden="true">
        <span className="jt__rail-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
