#!/usr/bin/env node
// Build do portfólio (esbuild, sem Vite).
//
//   node scripts/build.mjs             → build de produção em dist/
//   node scripts/build.mjs --dev       → watch + servidor estático em .dev/ (proxy /api → API Go)
//   node scripts/build.mjs --preview   → serve dist/ (comportamento parecido com a Vercel)
//
// Variáveis opcionais:
//   SITE_URL   URL pública (canonical, hreflang, sitemap). Padrão: https://max-godoy-portfolio.vercel.app
//   API_URL    destino do proxy /api em dev/preview. Padrão: http://localhost:8080
//   WEB_PORT   porta do servidor local. Padrão: 3000 (dev) e 4173 (preview)
import * as esbuild from 'esbuild';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB = path.join(ROOT, 'web');
const SRC = path.join(WEB, 'src');
const PUBLIC_DIR = path.join(WEB, 'public');
const BUILD_DIR = path.join(ROOT, '.build');
const THEMES_CSS = path.join(SRC, 'styles', 'themes.generated.css');

const args = new Set(process.argv.slice(2));
const MODE = args.has('--preview') ? 'preview' : args.has('--dev') ? 'dev' : 'prod';
const OUT = path.join(ROOT, MODE === 'dev' ? '.dev' : 'dist');

const SITE_URL = (process.env.SITE_URL || 'https://max-godoy-portfolio.vercel.app').trim().replace(/\/+$/, '');
const API_URL = new URL(process.env.API_URL || 'http://localhost:8080');

const log = (...a) => console.log('[build]', ...a);
const warn = (...a) => console.warn('[build] AVISO:', ...a);

// ---------------------------------------------------------------------------
// Dados compartilhados com o frontend (temas, dicionários, rotas, SEO)
// ---------------------------------------------------------------------------

async function loadSiteData() {
  await mkdir(BUILD_DIR, { recursive: true });
  const outfile = path.join(BUILD_DIR, 'site-data.mjs');
  await esbuild.build({
    entryPoints: [path.join(SRC, 'build-data.ts')],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    logLevel: 'silent',
    define: { __SITE_URL__: JSON.stringify(SITE_URL) },
  });
  return import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
}

async function writeIfChanged(file, content) {
  const current = await readFile(file, 'utf8').catch(() => null);
  if (current !== content) await writeFile(file, content);
}

/** Garante que public/theme-init.js conhece exatamente as paletas definidas em themes.ts. */
async function checkThemeInit(data) {
  const js = await readFile(path.join(PUBLIC_DIR, 'theme-init.js'), 'utf8');
  const missing = data.THEMES.filter((t) => !js.includes(`'${t.id}'`)).map((t) => t.id);
  if (missing.length) {
    throw new Error(`public/theme-init.js não lista as paletas: ${missing.join(', ')}. Atualize o array THEMES do arquivo.`);
  }
}

// ---------------------------------------------------------------------------
// Geração do site (HTML por idioma/rota, 404, sitemap, robots, manifest do currículo)
// ---------------------------------------------------------------------------

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function assetsFromMetafile(meta) {
  let js = null;
  let css = null;
  for (const [file, info] of Object.entries(meta.outputs)) {
    const rel = '/' + path.relative(OUT, path.resolve(ROOT, file)).split(path.sep).join('/');
    if (info.entryPoint && file.endsWith('.js')) js = rel;
    else if (file.endsWith('.css')) css = rel;
  }
  if (!js || !css) throw new Error('Não foi possível localizar o JS/CSS gerados pelo esbuild.');
  return { js, css };
}

async function writeFileDeep(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

function pageHtml(template, data, assets, { lang, route, slug }) {
  const seo = data.buildSeo({ lang, route, slug, siteUrl: SITE_URL });
  const dev = MODE === 'dev' ? '<script src="/__livereload.js"></script>' : '';
  return template
    .replaceAll('{{HTML_LANG}}', data.HTML_LANG[lang])
    .replace('{{SEO}}', data.renderHeadTags(seo))
    .replace('{{CSS}}', assets.css)
    .replace('{{JS}}', assets.js)
    .replace('{{DEV_HEAD}}', dev)
    .replace('{{NOSCRIPT_TITLE}}', escapeHtml(seo.title))
    .replace('{{NOSCRIPT_TEXT}}', escapeHtml(seo.description));
}

async function emitResumeManifest(data) {
  const dir = path.join(PUBLIC_DIR, 'resume');
  const present = new Set(existsSync(dir) ? await readdir(dir) : []);
  const resumes = {};
  for (const lang of data.LANGS) {
    const name = `curriculo-max-godoy-${lang}.pdf`;
    if (present.has(name)) {
      resumes[lang] = { url: `/resume/${name}`, bytes: (await stat(path.join(dir, name))).size };
    } else {
      resumes[lang] = null;
      warn(`currículo "${lang}" ausente (web/public/resume/${name}); a página mostrará "Em breve".`);
    }
  }
  await writeFileDeep(path.join(OUT, 'resume', 'manifest.json'), JSON.stringify({ version: 1, resumes }, null, 2) + '\n');
}

function sitemapXml(data) {
  const urls = [];
  const pages = [
    ...data.STATIC_ROUTES.filter((r) => data.isIndexable(r)).map((route) => ({ route })),
    ...data.PROJECT_SLUGS.map((slug) => ({ route: 'project', slug })),
  ];
  for (const { route, slug } of pages) {
    const loc = (l) => data.absoluteUrl(SITE_URL, data.buildPath(l, route, slug));
    const alternates = [
      ...data.LANGS.map((l) => ({ hreflang: data.HTML_LANG[l], href: loc(l) })),
      { hreflang: 'x-default', href: loc(data.DEFAULT_LANG) },
    ];
    for (const lang of data.LANGS) {
      urls.push(
        `  <url>\n    <loc>${loc(lang)}</loc>\n` +
          alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`).join('\n') +
          `\n  </url>`,
      );
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

function robotsTxt(data) {
  const admin = data.LANGS.map((l) => `Disallow: /${l}/admin`).join('\n');
  return `User-agent: *\nAllow: /\nDisallow: /api/\n${admin}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

async function emitSite(data, meta) {
  const assets = assetsFromMetafile(meta);
  const template = await readFile(path.join(WEB, 'index.html'), 'utf8');
  let pages = 0;

  // /{lang}/ e /{lang}/{rota}/index.html
  const targets = [
    ...data.STATIC_ROUTES.map((route) => ({ route })),
    ...data.PROJECT_SLUGS.map((slug) => ({ route: 'project', slug })),
  ];
  for (const lang of data.LANGS) {
    for (const { route, slug } of targets) {
      const urlPath = data.buildPath(lang, route, slug); // /pt/ | /pt/about | /pt/projects/x
      const file = path.join(OUT, urlPath.replace(/\/$/, ''), 'index.html');
      await writeFileDeep(file, pageHtml(template, data, assets, { lang, route, slug }));
      pages++;
    }
  }
  // Raiz "/": o cliente redireciona para o idioma preferido; canonical aponta para /pt/.
  await writeFileDeep(path.join(OUT, 'index.html'), pageHtml(template, data, assets, { lang: data.DEFAULT_LANG, route: 'home' }));
  // 404.html: a Vercel o serve (com status 404) para qualquer rota inexistente.
  await writeFileDeep(path.join(OUT, '404.html'), pageHtml(template, data, assets, { lang: data.DEFAULT_LANG, route: 'notFound' }));

  await writeFileDeep(path.join(OUT, 'sitemap.xml'), sitemapXml(data));
  await writeFileDeep(path.join(OUT, 'robots.txt'), robotsTxt(data));
  await emitResumeManifest(data);
  return pages + 2;
}

async function copyPublic() {
  await mkdir(OUT, { recursive: true });
  await cp(PUBLIC_DIR, OUT, { recursive: true, filter: (src) => path.basename(src) !== '.gitkeep' });
}

// ---------------------------------------------------------------------------
// Bundle do frontend
// ---------------------------------------------------------------------------

function bundleOptions(extraPlugins = []) {
  const prod = MODE === 'prod';
  return {
    entryPoints: [path.join(SRC, 'main.tsx')],
    outdir: path.join(OUT, 'assets'),
    entryNames: prod ? '[name]-[hash]' : '[name]',
    bundle: true,
    format: 'esm',
    target: ['es2022', 'chrome100', 'firefox100', 'safari15'],
    jsx: 'automatic',
    minify: prod,
    sourcemap: prod ? false : 'linked',
    metafile: true,
    legalComments: 'none',
    logLevel: 'info',
    define: {
      __SITE_URL__: JSON.stringify(SITE_URL),
      'process.env.NODE_ENV': JSON.stringify(prod ? 'production' : 'development'),
    },
    plugins: extraPlugins,
  };
}

async function prepare() {
  const data = await loadSiteData();
  await checkThemeInit(data);
  await mkdir(path.dirname(THEMES_CSS), { recursive: true });
  await writeIfChanged(THEMES_CSS, data.themeCss());
  return data;
}

async function buildProd() {
  const started = Date.now();
  await rm(OUT, { recursive: true, force: true });
  const data = await prepare();
  const result = await esbuild.build(bundleOptions());
  await copyPublic();
  const pages = await emitSite(data, result.metafile);
  const kb = (await Promise.all(Object.keys(result.metafile.outputs).map(async (f) => (await stat(path.resolve(ROOT, f))).size))).reduce((a, b) => a + b, 0) / 1024;
  log(`ok: ${pages} páginas HTML, ${kb.toFixed(1)} KB de JS+CSS, SITE_URL=${SITE_URL} (${Date.now() - started} ms) → dist/`);
}

// ---------------------------------------------------------------------------
// Servidor estático + proxy /api (dev e preview)
// ---------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

function resolveFile(root, pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const base = path.resolve(root, '.' + path.posix.normalize('/' + rel));
  if (base !== root && !base.startsWith(root + path.sep)) return null;
  const candidates = [base, path.join(base, 'index.html'), base + '.html'];
  for (const c of candidates) {
    try {
      if (statSync(c).isFile()) return c;
    } catch {
      /* tenta o próximo */
    }
  }
  return null;
}

function proxyApi(req, res) {
  const upstream = http.request(
    {
      hostname: API_URL.hostname,
      port: API_URL.port || 80,
      path: req.url, // mantém /api/... (a API Go aceita o prefixo /api)
      method: req.method,
      headers: req.headers, // mantém Host/Origin originais: a checagem de CORS compara os dois
    },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    },
  );
  upstream.on('error', () => {
    if (res.headersSent) return res.destroy();
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: { code: 'api_unreachable', message: `API indisponível em ${API_URL.origin}. Execute: npm run api` } }));
  });
  req.pipe(upstream);
}

/** Cabeçalhos de segurança do vercel.json (inclui a CSP), para detectar violações já no dev/preview. */
async function loadSecurityHeaders() {
  try {
    const cfg = JSON.parse(await readFile(path.join(ROOT, 'vercel.json'), 'utf8'));
    const block = (cfg.headers ?? []).find((h) => h.source === '/(.*)');
    const out = {};
    for (const { key, value } of block?.headers ?? []) {
      if (key !== 'Strict-Transport-Security') out[key] = value; // HSTS não se aplica a http://localhost
    }
    return out;
  } catch {
    return {};
  }
}

async function startServer({ root, port, live }) {
  const clients = new Set();
  const securityHeaders = await loadSecurityHeaders();
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return proxyApi(req, res);

    if (live && url.pathname === '/__livereload.js') {
      res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-store' });
      return res.end("new EventSource('/__events').onmessage=function(){location.reload()};");
    }
    if (live && url.pathname === '/__events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write(': ok\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end();
    }

    let file = resolveFile(root, url.pathname);
    let status = 200;
    if (!file) {
      // Como na Vercel: rota inexistente → 404.html com status 404.
      // No dev respondemos 200 para o roteador do cliente tratar rotas ainda não geradas.
      file = path.join(root, '404.html');
      status = MODE === 'dev' ? 200 : 404;
      if (!existsSync(file)) {
        res.writeHead(404, { 'Content-Type': MIME['.txt'] });
        return res.end('Não encontrado. Execute "npm run build" antes do preview.');
      }
    }
    res.writeHead(status, {
      ...securityHeaders,
      'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  });

  server.on('error', (err) => {
    console.error(`[build] não foi possível abrir a porta ${port}: ${err.message}`);
    process.exit(1);
  });
  server.listen(port, () => {
    log(`${live ? 'dev' : 'preview'}: http://localhost:${port}  (proxy /api → ${API_URL.origin})`);
  });
  return { reload: () => clients.forEach((c) => c.write('data: reload\n\n')) };
}

async function runDev() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const port = Number(process.env.WEB_PORT) || 3000;
  const srv = await startServer({ root: OUT, port, live: true });

  let data = await prepare();
  const sync = {
    name: 'sync-site',
    setup(build) {
      build.onStart(async () => {
        try {
          data = await prepare(); // reflete mudanças em themes.ts, i18n, seo e rotas
        } catch (e) {
          warn(e.message);
        }
      });
      build.onEnd(async (result) => {
        if (result.errors.length) return;
        try {
          await copyPublic();
          const pages = await emitSite(data, result.metafile);
          log(`${pages} páginas HTML atualizadas`);
          srv.reload();
        } catch (e) {
          warn(e.message);
        }
      });
    },
  };
  const ctx = await esbuild.context(bundleOptions([sync]));
  await ctx.watch();
  log('observando alterações em web/ …  (Ctrl+C para sair)');
  const stop = async () => {
    await ctx.dispose();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

async function runPreview() {
  const dist = path.join(ROOT, 'dist');
  if (!existsSync(path.join(dist, 'index.html'))) {
    console.error('[build] dist/ não encontrado. Execute primeiro: npm run build');
    process.exit(1);
  }
  await startServer({ root: dist, port: Number(process.env.WEB_PORT) || 4173, live: false });
}

// ---------------------------------------------------------------------------

try {
  if (MODE === 'dev') await runDev();
  else if (MODE === 'preview') await runPreview();
  else await buildProd();
} catch (err) {
  console.error('[build] falhou:', err?.message ?? err);
  process.exit(1);
}
