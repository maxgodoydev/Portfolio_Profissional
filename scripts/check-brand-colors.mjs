// Compara web/src/components/brandColors.ts com o pacote Simple Icons (catálogo que registra a cor de cada marca).
// Uso: npm i --no-save simple-icons && node scripts/check-brand-colors.mjs
// Saída: lista as marcas cujo HEX difere do catálogo. Diferença ≠ erro: confirme na fonte oficial da marca.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const si = require('simple-icons');
const src = readFileSync(new URL('../web/src/components/brandColors.ts', import.meta.url), 'utf8');
const SLUG = { Python: 'siPython', JavaScript: 'siJavascript', TypeScript: 'siTypescript', React: 'siReact', Go: 'siGo', 'Node.js': 'siNodedotjs', MySQL: 'siMysql', MongoDB: 'siMongodb', PostgreSQL: 'siPostgresql', SQLite: 'siSqlite', Git: 'siGit', GitHub: 'siGithub', Vercel: 'siVercel', PHP: 'siPhp', HTML: 'siHtml5', CSS: 'siCss', Express: 'siExpress', 'Spring Boot': 'siSpringboot', Render: 'siRender', C: 'siC', 'C++': 'siCplusplus', Supabase: 'siSupabase', Maven: 'siApachemaven', Pandas: 'siPandas', NumPy: 'siNumpy', Pytest: 'siPytest', JSON: 'siJson', 'Spring Security': 'siSpring', 'MongoDB Atlas': 'siMongodb', Angular: 'siAngular', Ionic: 'siIonic', EJS: 'siEjs', Java: 'siOpenjdk' };
let diffs = 0;
for (const m of src.matchAll(/^\s*'?([^':\n]+?)'?:\s*'(#[0-9A-Fa-f]{6})'/gm)) {
  const [, name, hex] = m;
  const icon = si[SLUG[name]];
  if (!icon) { console.log(`?  ${name}: sem entrada no catálogo`); continue; }
  if (icon.hex.toUpperCase() !== hex.slice(1).toUpperCase()) { diffs++; console.log(`≠  ${name}: arquivo ${hex} | catálogo #${icon.hex}`); }
}
console.log(diffs ? `${diffs} diferença(s)` : 'sem diferenças');
