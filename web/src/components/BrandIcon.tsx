import { BRAND_ICONS } from './brandIcons';

export function hasBrandIcon(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(BRAND_ICONS, name);
}

/** Logo de marca (monocromático, currentColor: acompanha os cinco temas). Decorativo: o nome vem sempre em texto ao lado. */
export function BrandIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  if (!hasBrandIcon(name)) return null;
  const icon = BRAND_ICONS[name];
  return (
    <svg
      className={className ? `brand-icon ${className}` : 'brand-icon'}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.d} />
    </svg>
  );
}
