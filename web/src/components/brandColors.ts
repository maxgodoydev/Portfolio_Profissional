// Cores de referência para os ícones de marca. Os valores do catálogo Simple Icons não substituem
// brand guidelines oficiais; marcas sem confirmação oficial devem permanecer identificadas na documentação.
// Marcas muito escuras ganham um azulejo claro (ver BrandIcon) para continuar visíveis no tema escuro.
export const BRAND_COLORS: Record<string, string> = {
  Python: '#3776AB',
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  React: '#61DAFB',
  Go: '#00ADD8',
  'Node.js': '#5FA04E',
  MySQL: '#4479A1',
  MongoDB: '#47A248',
  PostgreSQL: '#4169E1',
  SQLite: '#003B57',
  Git: '#F05032',
  GitHub: '#181717',
  Vercel: '#000000',
  PHP: '#777BB4',
  HTML: '#E34F26',
  CSS: '#1572B6',
  Express: '#000000',
  'Spring Boot': '#6DB33F',
  Render: '#000000', // Cor atual no catálogo Simple Icons; não tratá-la como HEX oficial da Render sem brand guidelines.
  C: '#A8B9CC',
  'C++': '#00599C',
  Supabase: '#3FCF8E',
  Maven: '#C71A36',
  Pandas: '#150458',
  NumPy: '#4DABCF', // "Maximum Blue" do logo oficial (diretrizes de logo do repositório numpy/numpy.org)
  Pytest: '#0A9EDC',
  JSON: '#000000',
  'Spring Security': '#6DB33F', // Usa a marca Spring (mesma cor do catálogo Simple Icons).
  'MongoDB Atlas': '#47A248', // Usa a folha MongoDB (marca-mãe).
  Angular: '#0F0F11', // Cor do catálogo Simple Icons (marca escura → azulejo claro).
  Ionic: '#3880FF', // Cor do catálogo Simple Icons.
  EJS: '#B4CA65', // Cor do catálogo Simple Icons.
  Java: '#ED8B00',
  'Java 21': '#ED8B00',
  WhatsApp: '#25D366', // Verde de referência (catálogo Simple Icons).
  Gmail: '#EA4335', // Vermelho de referência (catálogo Simple Icons).
  LinkedIn: '#0A66C2', // Azul de referência; HEX não confirmado em guideline oficial nesta auditoria.
};

/** Luminância relativa aproximada (0 = preto, 1 = branco). */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

/** Marcas escuras (somem no tema escuro) → desenhadas sobre um azulejo claro. */
export function needsTile(name: string): boolean {
  const c = BRAND_COLORS[name];
  return !!c && luminance(c) < 0.06;
}
