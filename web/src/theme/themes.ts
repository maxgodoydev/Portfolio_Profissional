// Sistema de temas: 5 paletas × 2 modos (claro/escuro). Os tokens de cada combinação
// são derivados das 5 cores da paleta e o contraste é garantido por código.
import { contrast, ensureContrast, mix } from './color';

export type ThemeId = 'ice-tangerine' | 'cherry-cream' | 'sage-ink' | 'lavender-graphite' | 'monochrome-stone';
export type ThemeMode = 'auto' | 'light' | 'dark';
export type ResolvedMode = 'light' | 'dark';

export interface Palette {
  id: ThemeId;
  name: string;
  /** [fundo, superfície secundária, destaque, ação, texto] */
  colors: [string, string, string, string, string];
}

export const THEMES: Palette[] = [
  { id: 'ice-tangerine', name: 'Ice Blue & Tangerine', colors: ['#F4F8FA', '#D8EAF0', '#8DBBCB', '#EF9A65', '#283943'] },
  { id: 'cherry-cream', name: 'Cherry & Cream', colors: ['#FAF5F0', '#EADBD5', '#D68B88', '#A74450', '#33272C'] },
  { id: 'sage-ink', name: 'Sage & Ink', colors: ['#F4F6F1', '#DFE8DE', '#A6BDA9', '#547C68', '#263A32'] },
  { id: 'lavender-graphite', name: 'Lavender & Graphite', colors: ['#F7F5FA', '#E7E0F0', '#C2B2D8', '#806B9F', '#302B3B'] },
  { id: 'monochrome-stone', name: 'Monochrome Stone', colors: ['#F5F4F1', '#DFDDD7', '#B7B3AA', '#77746E', '#292A2D'] },
];

export const DEFAULT_THEME: ThemeId = 'ice-tangerine';
export const DEFAULT_MODE: ThemeMode = 'auto';

export function isThemeId(v: unknown): v is ThemeId {
  return THEMES.some((t) => t.id === v);
}

export function isThemeMode(v: unknown): v is ThemeMode {
  return v === 'auto' || v === 'light' || v === 'dark';
}

export interface Tokens {
  bg: string;
  surface: string;
  card: string;
  soft: string;
  action: string;
  ink: string;
  muted: string;
  line: string;
  link: string;
  onAction: string;
}

export function deriveTokens(p: Palette, mode: ResolvedMode): Tokens {
  const [c0, c1, c2, c3, c4] = p.colors;
  let bg: string, surface: string, card: string, soft: string, ink: string;

  if (mode === 'light') {
    bg = c0;
    surface = c1;
    card = mix(c0, '#ffffff', 0.6);
    soft = c2;
    ink = c4;
  } else {
    bg = mix(c4, '#000000', 0.45);
    surface = mix(c4, '#000000', 0.15);
    card = mix(surface, '#ffffff', 0.04);
    soft = mix(c2, bg, 0.62);
    ink = c0;
  }

  const surfaces = [bg, surface, card];
  ink = ensureContrast(ink, surfaces, 7);
  const muted = ensureContrast(mix(ink, bg, 0.36), surfaces, 4.5);
  const link = ensureContrast(c3, surfaces, 4.5);
  const dark = mix(c4, '#000000', 0.55);
  const onAction = contrast('#ffffff', c3) >= contrast(dark, c3) ? '#ffffff' : dark;
  const line = mix(ink, bg, 0.82);

  return { bg, surface, card, soft, action: c3, ink, muted, line, link, onAction };
}

const VAR_NAMES: Record<keyof Tokens, string> = {
  bg: '--bg',
  surface: '--surface',
  card: '--card',
  soft: '--soft',
  action: '--action',
  ink: '--ink',
  muted: '--muted',
  line: '--line',
  link: '--link',
  onAction: '--on-action',
};

/** Gera o CSS estático de todas as combinações. É usado no build (scripts/build.mjs). */
export function themeCss(): string {
  const blocks: string[] = [];
  for (const theme of THEMES) {
    for (const mode of ['light', 'dark'] as ResolvedMode[]) {
      const tokens = deriveTokens(theme, mode);
      const vars = (Object.keys(VAR_NAMES) as (keyof Tokens)[])
        .map((k) => `${VAR_NAMES[k]}:${tokens[k]}`)
        .join(';');
      blocks.push(`[data-theme="${theme.id}"][data-mode="${mode}"]{color-scheme:${mode};${vars}}`);
    }
  }
  return `/* Gerado por scripts/build.mjs a partir de web/src/theme/themes.ts — não edite. */\n${blocks.join('\n')}\n`;
}
