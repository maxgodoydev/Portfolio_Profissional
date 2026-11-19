// Utilitários de cor sem dependências: mistura, luminância e garantia de contraste (WCAG).

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex([r, g, b]: RGB): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mistura `a` com `b`; t=0 devolve `a`, t=1 devolve `b`. */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Ajusta `fg` (escurecendo ou clareando, conforme o fundo) até atingir `min` de contraste
 * contra TODOS os fundos informados. Mantém a matiz original o máximo possível.
 */
export function ensureContrast(fg: string, backgrounds: string[], min: number): string {
  const worst = (c: string) => Math.min(...backgrounds.map((bg) => contrast(c, bg)));
  if (worst(fg) >= min) return fg;
  const avgLum = backgrounds.reduce((s, bg) => s + luminance(bg), 0) / backgrounds.length;
  const target = avgLum > 0.4 ? '#000000' : '#ffffff';
  for (let t = 0.04; t <= 1.0001; t += 0.04) {
    const candidate = mix(fg, target, t);
    if (worst(candidate) >= min) return candidate;
  }
  return target;
}
