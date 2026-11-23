// Verificação do build (npm run verify). Roda sobre dist/ e falha (exit 1) se algo estiver inconsistente.
// Não depende de rede nem de credenciais.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const problems = [];
let checks = 0;
const check = (cond, msg) => {
  checks++;
  if (!cond) problems.push(msg);
};
const read = (p) => readFile(p, 'utf8');
const exists = (p) => stat(p).then(() => true, () => false);

const data = await import(pathToFileURL(path.join(ROOT, '.build', 'site-data.mjs')).href);
const SITE = (process.env.SITE_URL || 'https://max-godoy-portfolio.vercel.app').replace(/\/$/, '');
const HTML_LANG = data.HTML_LANG;

// ---- páginas por idioma e rota ----
const targets = [...data.STATIC_ROUTES.map((route) => ({ route })), ...data.PROJECT_SLUGS.map((slug) => ({ route: 'project', slug }))];
let pageCount = 0;
for (const lang of data.LANGS) {
  for (const { route, slug } of targets) {
    const urlPath = data.buildPath(lang, route, slug);
    const file = path.join(DIST, urlPath.replace(/\/$/, ''), 'index.html');
    if (!(await exists(file))) {
      check(false, `página ausente: ${urlPath}`);
      continue;
    }
    pageCount++;
    const html = await read(file);
    check(html.includes(`<html lang="${HTML_LANG[lang]}"`), `${urlPath}: atributo lang incorreto`);
    // Páginas noindex (admin) não têm canonical/hreflang por desenho.
    if (route !== 'admin') {
      check(html.includes(`<link rel="canonical" href="${SITE}${urlPath}"`), `${urlPath}: canonical incorreto`);
      for (const l of data.LANGS) {
        check(html.includes(`hreflang="${HTML_LANG[l]}" href="${SITE}${data.buildPath(l, route, slug)}"`), `${urlPath}: hreflang ${l} ausente`);
      }
      check(html.includes('hreflang="x-default"'), `${urlPath}: x-default ausente`);
    }
    check(/<title>[^<]{3,}<\/title>/.test(html), `${urlPath}: <title> vazio`);
    check(html.includes('<div id="root"></div>'), `${urlPath}: #root ausente`);
    const noindex = route === 'admin';
    check(noindex ? html.includes('content="noindex,nofollow"') : html.includes('content="index,follow"'), `${urlPath}: meta robots inesperado`);
  }
}
check(pageCount === data.LANGS.length * targets.length, `esperado ${data.LANGS.length * targets.length} páginas, achei ${pageCount}`);
check(await exists(path.join(DIST, '404.html')), '404.html ausente');
check(await exists(path.join(DIST, 'index.html')), 'index.html da raiz ausente');

// ---- sitemap e robots ----
const sitemap = await read(path.join(DIST, 'sitemap.xml'));
const robots = await read(path.join(DIST, 'robots.txt'));
for (const lang of data.LANGS) {
  for (const { route, slug } of targets) {
    const loc = `<loc>${SITE}${data.buildPath(lang, route, slug)}</loc>`;
    check(route === 'admin' ? !sitemap.includes(loc) : sitemap.includes(loc), `sitemap: ${route === 'admin' ? 'admin não deve constar' : 'faltando'} ${loc}`);
  }
}
check(robots.includes('Disallow: /api/') && robots.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt incompleto');
for (const lang of data.LANGS) check(robots.includes(`Disallow: /${lang}/admin`), `robots.txt: admin ${lang} liberado`);

// ---- currículos: só links para arquivos reais ----
const manifest = JSON.parse(await read(path.join(DIST, 'resume', 'manifest.json')));
for (const lang of data.LANGS) {
  const entry = manifest.resumes?.[lang];
  check(entry === null || (entry && (await exists(path.join(DIST, entry.url)))), `manifest do currículo "${lang}" aponta para arquivo inexistente`);
}

// ---- vercel.json ----
const vercel = JSON.parse(await read(path.join(ROOT, 'vercel.json')));
const rewrites = vercel.rewrites ?? [];
check(rewrites.length === 1 && rewrites[0].source === '/api/:path*' && rewrites[0].destination === '/api/index?path=:path*', 'rewrites: só a API deve ser reescrita (nada de fallback de SPA)');
check(!rewrites.some((r) => /index\.html|\/\(\.\*\)|\/:path\*$/.test(r.destination) && !r.source.startsWith('/api')), 'rewrite de SPA encontrado');
for (const r of vercel.redirects ?? []) {
  const dest = r.destination.split('?')[0];
  check(!dest.startsWith('/') || (await exists(path.join(DIST, dest))), `redirect para arquivo inexistente: ${r.source} → ${r.destination}`);
}
const csp = vercel.headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
check(/connect-src 'self'/.test(csp) && /script-src 'self'/.test(csp) && !/unsafe-eval/.test(csp), 'CSP deve manter connect-src/script-src em self e sem unsafe-eval');

// ---- bundle e segredos ----
async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.build', 'dist'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? await walk(p, out) : out.push(p);
  }
  return out;
}
const SECRET_RE = [/\bre_[A-Za-z0-9]{20,}\b/, /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/, /libsql:\/\/[a-z0-9-]+-[a-z0-9-]+\.turso\.io/i, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
for (const f of [...(await walk(ROOT)), ...(await walk(DIST))]) {
  if (/\.(png|ico|woff2?|pdf|zip)$/i.test(f) || f.endsWith('package-lock.json') || f.endsWith('.env.example')) continue;
  const txt = await read(f).catch(() => '');
  for (const re of SECRET_RE) check(!re.test(txt), `possível credencial em ${path.relative(ROOT, f)}`);
}
const assets = (await readdir(path.join(DIST, 'assets'))).filter((f) => f.endsWith('.js'));
const js = await read(path.join(DIST, 'assets', assets[0]));
check(!/localhost:\d+/.test(js), 'bundle referencia localhost');
check(js.includes('/api') && js.includes('pageview'), 'bundle não contém o cliente da API/rastreamento');
const contactHtml = await read(path.join(DIST, 'pt', 'contact', 'index.html'));
check(contactHtml.includes('maxgodoy.dev@gmail.com') || js.includes('maxgodoy.dev@gmail.com'), 'e-mail de contato ausente do build');
check(js.includes('https://www.linkedin.com/in/max-godoy/'), 'LinkedIn ausente do build');


// Contraste WCAG AA (4.5:1) dos pares texto/fundo em todos os temas e modos.
{
  const themesCss = await read(path.join(ROOT, 'web', 'src', 'styles', 'themes.generated.css'));
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const PAIRS = [['ink', 'bg'], ['ink', 'card'], ['ink', 'surface'], ['muted', 'bg'], ['muted', 'card'], ['muted', 'surface'], ['link', 'bg'], ['link', 'card'], ['link', 'surface'], ['on-action', 'action']];
  let themes = 0;
  for (const m of themesCss.matchAll(/\[data-theme="([^"]+)"\]\[data-mode="(\w+)"\]\{([^}]*)\}/g)) {
    themes++;
    const v = Object.fromEntries([...m[3].matchAll(/--([\w-]+):(#[0-9a-fA-F]{6})/g)].map((x) => [x[1], x[2]]));
    for (const [f, b] of PAIRS) check(ratio(v[f], v[b]) >= 4.5, `contraste ${m[1]}/${m[2]}: ${f} sobre ${b} = ${ratio(v[f], v[b]).toFixed(2)} (mín. 4.5)`);
  }
  check(themes === 18, `esperado 18 combinações tema×modo (9 paletas × claro/escuro), achei ${themes}`);
}

console.log(`verify: ${checks - problems.length}/${checks} verificações ok, ${pageCount} páginas HTML`);
if (problems.length) {
  console.error('\nFalhas:\n- ' + problems.join('\n- '));
  process.exit(1);
}
