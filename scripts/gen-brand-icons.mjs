// Gera web/src/components/brandIcons.ts a partir de pacotes de ícones instalados NA SUA MÁQUINA
// (ferramenta de desenvolvimento, não entra no bundle). Uso: npm i --no-save react-icons && node scripts/gen-brand-icons.mjs
// Fontes: Simple Icons (CC0) e Font Awesome Free Brands (CC BY 4.0) via react-icons.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(process.env.ICONS_FROM ?? import.meta.url);
const si = require('react-icons/si');
const fa = require('react-icons/fa6');

// nome exibido no site → [pacote, export]
const MAP = {
  Python: ['si', 'SiPython'], JavaScript: ['si', 'SiJavascript'], TypeScript: ['si', 'SiTypescript'], React: ['si', 'SiReact'],
  Go: ['si', 'SiGo'], 'Node.js': ['si', 'SiNodedotjs'], MySQL: ['si', 'SiMysql'], MongoDB: ['si', 'SiMongodb'],
  PostgreSQL: ['si', 'SiPostgresql'], SQLite: ['si', 'SiSqlite'], Git: ['si', 'SiGit'], GitHub: ['si', 'SiGithub'],
  Vercel: ['si', 'SiVercel'], PHP: ['si', 'SiPhp'], HTML: ['si', 'SiHtml5'], CSS: ['si', 'SiCss'], Express: ['si', 'SiExpress'],
  'Spring Boot': ['si', 'SiSpringboot'], Render: ['si', 'SiRender'], C: ['si', 'SiC'], 'C++': ['si', 'SiCplusplus'],
  Supabase: ['si', 'SiSupabase'], WhatsApp: ['si', 'SiWhatsapp'], Gmail: ['si', 'SiGmail'], Maven: ['si', 'SiApachemaven'], Pandas: ['si', 'SiPandas'], NumPy: ['si', 'SiNumpy'],
  Pytest: ['si', 'SiPytest'], JSON: ['si', 'SiJson'],
  'Spring Security': ['si', 'SiSpring'], 'MongoDB Atlas': ['si', 'SiMongodb'],
  Angular: ['si', 'SiAngular'], Ionic: ['si', 'SiIonic'], EJS: ['si', 'SiEjs'],
  Java: ['fa', 'FaJava'], 'Java 21': ['fa', 'FaJava'], LinkedIn: ['fa', 'FaLinkedin'],
};
const out = {};
for (const [name, [pkg, key]] of Object.entries(MAP)) {
  const fn = (pkg === 'si' ? si : fa)[key];
  if (!fn) throw new Error(`ícone ausente: ${key}`);
  const src = String(fn);
  const viewBox = /"viewBox":"([^"]+)"/.exec(src)?.[1] ?? '0 0 24 24';
  const paths = [...src.matchAll(/"d":"([^"]+)"/g)].map((m) => m[1]);
  out[name] = { viewBox, d: paths.join(' '), src: pkg === 'si' ? 'Simple Icons' : 'Font Awesome Free' };
}
const body = Object.entries(out).map(([k, v]) => `  ${JSON.stringify(k)}: { viewBox: ${JSON.stringify(v.viewBox)}, d: ${JSON.stringify(v.d)} },`).join('\n');
writeFileSync(new URL('../web/src/components/brandIcons.ts', import.meta.url), `// GERADO por scripts/gen-brand-icons.mjs — não edite à mão.
// Marcas: Simple Icons (CC0, https://simpleicons.org) e Font Awesome Free Brands (CC BY 4.0, https://fontawesome.com/license/free) para Java e LinkedIn.
// As marcas pertencem aos seus respectivos titulares; uso apenas para identificar a tecnologia. Sem alterações no desenho.
// Sem logo oficial disponível neste conjunto (portanto sem ícone): Power BI, DAX, Power Query, Excel, SQL, Matplotlib.
export interface BrandIconData { viewBox: string; d: string }
export const BRAND_ICONS: Record<string, BrandIconData> = {
${body}
};
`);
console.log('ok', Object.keys(out).length);
