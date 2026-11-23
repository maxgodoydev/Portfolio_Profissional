import { BRAND_ICONS } from './brandIcons';
import { BRAND_IMAGES } from './brandImages';
import { BRAND_COLORS, needsTile } from './brandColors';

export function hasBrandIcon(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(BRAND_ICONS, name) || Object.prototype.hasOwnProperty.call(BRAND_IMAGES, name);
}

/**
 * Logo de marca na COR ORIGINAL da marca, em qualquer tema. Marcas escuras (GitHub, Vercel, Express, JSON…)
 * ficam sobre um pequeno azulejo claro para não sumir no tema escuro. Decorativo: o nome vem sempre em texto ao lado.
 */
export function BrandIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  if (!hasBrandIcon(name)) return null;
  // SVGs multicoloridos: usados como imagem, sem recolorir ou distorcer.
  if (Object.prototype.hasOwnProperty.call(BRAND_IMAGES, name)) {
    return <img className={className ? `brand-icon brand-icon--image ${className}` : 'brand-icon brand-icon--image'} src={BRAND_IMAGES[name]} width={size} height={size} alt="" aria-hidden="true" decoding="async" style={{ objectFit: 'contain' }} />;
  }
  const icon = BRAND_ICONS[name];
  const svg = (
    <svg
      className={className ? `brand-icon ${className}` : 'brand-icon'}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill={BRAND_COLORS[name] ?? 'currentColor'}
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.d} />
    </svg>
  );
  if (!needsTile(name)) return svg;
  const tile = Math.round(size * 1.4);
  return (
    <span className="brand-tile" style={{ width: tile, height: tile }} aria-hidden="true">
      {svg}
    </span>
  );
}
