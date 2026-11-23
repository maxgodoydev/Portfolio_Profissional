// Busca de projetos: sem acento, sem diferença de maiúsculas e com vários termos (todos precisam aparecer).
// Funções puras, testadas em tests/search.test.mjs.

/** Normaliza um caractere: minúsculas e sem marcas de acento (ex.: "ç" → "c", "é" → "e"). */
function foldChar(ch: string): string {
  return ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Texto sem acentos e em minúsculas. */
export function fold(text: string): string {
  let out = '';
  for (const ch of text) out += foldChar(ch);
  return out;
}

/** Quebra a busca em termos (separados por espaço), já normalizados e sem repetição. */
export function tokenize(query: string): string[] {
  return Array.from(new Set(fold(query).split(/\s+/).filter(Boolean)));
}

/** Verdadeiro quando TODOS os termos aparecem em pelo menos um dos textos. Sem termos, tudo corresponde. */
export function matchesAll(tokens: readonly string[], haystacks: readonly string[]): boolean {
  if (tokens.length === 0) return true;
  const joined = fold(haystacks.join('\n'));
  return tokens.every((tk) => joined.includes(tk));
}

export interface Piece {
  text: string;
  hit: boolean;
}

/** Divide `text` em trechos, marcando os que correspondem a algum termo (ignora acentos; preserva o texto original). */
export function splitMatches(text: string, tokens: readonly string[]): Piece[] {
  if (tokens.length === 0 || text === '') return [{ text, hit: false }];

  // Texto normalizado + índice: para cada posição normalizada, onde ela começa no texto original.
  let folded = '';
  const start: number[] = [];
  const end: number[] = [];
  let pos = 0;
  for (const ch of text) {
    const f = foldChar(ch);
    for (let i = 0; i < f.length; i++) {
      start.push(pos);
      end.push(pos + ch.length);
    }
    folded += f;
    pos += ch.length;
  }

  const marked = new Array<boolean>(text.length).fill(false);
  for (const tk of tokens) {
    if (!tk) continue;
    let from = 0;
    for (;;) {
      const at = folded.indexOf(tk, from);
      if (at === -1) break;
      for (let i = start[at]!; i < end[at + tk.length - 1]!; i++) marked[i] = true;
      from = at + tk.length;
    }
  }

  const pieces: Piece[] = [];
  let i = 0;
  while (i < text.length) {
    const hit = marked[i]!;
    let j = i;
    while (j < text.length && marked[j] === hit) j++;
    pieces.push({ text: text.slice(i, j), hit });
    i = j;
  }
  return pieces;
}
