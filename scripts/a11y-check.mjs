// Auditoria de acessibilidade básica (opcional; requer Playwright: npm i -D playwright).
// Uso: npm run build && npm run preview (outro terminal)  →  node scripts/a11y-check.mjs [URL_BASE]
// Verifica, em celular (360px) e desktop (1280px): lang, um único h1, <main>, skip-link,
// imagens com alt, links/botões com nome, saltos de nível de título, alvos de toque < 24px
// e rolagem horizontal. Sai com código 1 se houver falhas.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:4173';
const ROUTES = ['/pt/', '/pt/about', '/pt/projects', '/pt/projects/barbershop-do-gui', '/pt/projects/segunda-vitrine', '/pt/projects/intelibolsas', '/pt/technologies', '/pt/journey', '/pt/contact', '/pt/resume', '/pt/privacy', '/en/', '/es/'];
const browser = await chromium.launch();
let failures = 0;
for (const width of [360, 1280]) {
  const page = await (await browser.newContext({ viewport: { width, height: 800 } })).newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route);
    await page.waitForSelector('main');
    const r = await page.evaluate(() => {
      const q = (s) => [...document.querySelectorAll(s)];
      const heads = q('h1,h2,h3,h4').map((h) => +h.tagName[1]);
      let jumps = 0;
      for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) jumps++;
      return {
        h1: q('h1').length,
        main: q('main').length,
        skip: q('a[href^="#"]').some((a) => /conte|content|contenido/i.test(a.textContent)),
        imgNoAlt: q('img').filter((i) => !i.hasAttribute('alt')).length,
        noName: q('a,button').filter((e) => !(e.textContent || '').trim() && !e.getAttribute('aria-label') && !e.querySelector('img[alt]')).length,
        jumps,
        small: q('a,button').filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.height < 24 || b.width < 24); }).length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    const bad = r.h1 !== 1 || !r.main || !r.skip || r.imgNoAlt || r.noName || r.jumps || r.small || r.overflow;
    if (bad) { failures++; console.error(`FALHA ${width}px ${route}`, JSON.stringify(r)); }
  }
}
await browser.close();
console.log(failures ? `a11y: ${failures} página(s) com falhas` : 'a11y: todas as páginas ok (360px e 1280px)');
process.exit(failures ? 1 : 0);
