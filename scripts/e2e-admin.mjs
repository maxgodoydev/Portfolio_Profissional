#!/usr/bin/env node
// Teste ponta a ponta do painel /admin: navegador real (Playwright/Chromium) + site gerado (preview)
// + API Go de verdade. Nada é simulado. Não faz parte de `npm test` porque exige Playwright e Go.
//
//   npm run build && node scripts/e2e-admin.mjs
//
// Requer o pacote "playwright" com Chromium instalado (npm i -D playwright && npx playwright install chromium).
// Usa as portas 18080 (API), 18081 (API sem admin configurado) e 14173 (site). Imagens em test-results/.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright não encontrado. Instale com: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const PASSWORD = 'senha-e2e-' + Math.random().toString(36).slice(2, 10);
const API = 'http://localhost:18080';
const SITE = 'http://localhost:14173';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const OUT = path.join(ROOT, 'test-results');
await mkdir(OUT, { recursive: true });

const procs = [];
function start(cmd, args, env, label) {
  const p = spawn(cmd, args, { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', () => {});
  p.stderr.on('data', (d) => process.env.E2E_VERBOSE && process.stderr.write(`[${label}] ${d}`));
  procs.push(p);
  return p;
}
async function waitHttp(url, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const r = await fetch(url);
      if (r.status < 600) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Servidor não respondeu: ${url}`);
}

let passed = 0;
const failures = [];
async function step(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`  FAIL ${name}\n       ${String(e.message).split('\n')[0]}`);
  }
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

await Promise.all([]);
start('go', ['run', './cmd/server'], { PORT: '18080', APP_ENV: 'development', SESSION_SECRET: 'e2e-secret-'.padEnd(48, 'x'), ADMIN_PASSWORD: PASSWORD }, 'api');
start('go', ['run', './cmd/server'], { PORT: '18081', APP_ENV: 'development', SESSION_SECRET: '', ADMIN_PASSWORD: '' }, 'api-off');
start('node', ['scripts/build.mjs', '--preview'], { WEB_PORT: '14173', API_URL: API }, 'site');
start('node', ['scripts/build.mjs', '--preview'], { WEB_PORT: '14174', API_URL: 'http://localhost:18081' }, 'site-off');
await Promise.all([waitHttp(`${API}/api/health`), waitHttp('http://localhost:18081/api/health'), waitHttp(`${SITE}/pt/`), waitHttp('http://localhost:14174/pt/')]);

const browser = await chromium.launch();
const consoleErrors = [];
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'pt-BR' });
const page = await ctx.newPage();
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

const stats = async () => {
  const r = await ctx.request.get(`${SITE}/api/admin/stats?days=30`);
  return { status: r.status(), body: await r.json() };
};
const text = async (sel) => (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim();

console.log('Painel /admin — e2e contra API Go real');

await step('sem login: rotas protegidas respondem 401 e a tela mostra o formulário', async () => {
  const r = await ctx.request.get(`${SITE}/api/admin/stats`);
  expect(r.status() === 401, `stats sem cookie deveria ser 401, veio ${r.status()}`);
  await page.goto(`${SITE}/pt/admin`);
  await page.getByLabel('Senha').waitFor();
  expect((await page.locator('h1').count()) === 1, 'deve haver um único h1');
  expect((await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'), 'admin deve ser noindex');
});

await step('senha errada: mensagem de erro, foco volta ao campo, sem cookie', async () => {
  await page.getByLabel('Senha').fill('errada');
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.getByRole('alert').filter({ hasText: /incorret/i }).waitFor();
  expect(await page.getByLabel('Senha').evaluate((el) => el === document.activeElement), 'foco deve voltar ao campo');
  expect((await ctx.cookies()).every((c) => c.name !== 'admin_session'), 'não pode haver cookie');
});

await step('campo vazio não chama a API', async () => {
  await page.getByLabel('Senha').fill('');
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.getByRole('alert').filter({ hasText: /informe a senha/i }).waitFor();
});

await step('senha correta: abre o painel; cookie HttpOnly; nada de senha/token no storage', async () => {
  await page.getByLabel('Senha').fill(PASSWORD);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.getByRole('heading', { level: 1, name: 'Visão geral' }).waitFor();
  const c = (await ctx.cookies()).find((x) => x.name === 'admin_session');
  expect(c && c.httpOnly && c.sameSite === 'Strict', 'cookie deve ser HttpOnly + SameSite=Strict');
  const dump = await page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage }, u: location.href }));
  expect(!dump.includes(PASSWORD) && !dump.includes(c.value), 'senha/token não podem aparecer no storage nem na URL');
});

await step('sem eventos: estado vazio honesto e aviso de armazenamento em memória', async () => {
  await page.getByText('Ainda não há dados neste período').waitFor();
  await page.getByText(/Armazenamento em memória/).first().waitFor();
});

// Eventos reais pela API pública (UA de navegador; o rastreador do site ignora Chromium automatizado).
const send = (body, ua = CHROME_UA, extra = {}) => fetch(`${API}/api/events`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': ua, ...extra }, body: JSON.stringify(body) });
await step('API pública aceita eventos; DNT e robôs não entram', async () => {
  const ok = [
    { type: 'pageview', path: '/pt/', lang: 'pt', theme: 'ice-tangerine' },
    { type: 'pageview', path: '/pt/projects', lang: 'pt' },
    { type: 'pageview', path: '/en/about', lang: 'en', referrer: 'www.linkedin.com' },
    { type: 'project_view', path: '/pt/projects/barbershop-do-gui', target: 'barbershop-do-gui', lang: 'pt' },
    { type: 'resume_download', path: '/pt/resume', target: 'pt', lang: 'pt' },
    { type: 'theme_change', path: '/pt/', target: 'sage-ink', lang: 'pt' },
  ];
  for (const e of ok) expect((await send(e)).status === 202, `evento ${e.type} deveria dar 202`);
  const dnt = await (await send({ type: 'pageview', path: '/pt/x', lang: 'pt' }, CHROME_UA, { DNT: '1' })).json();
  const bot = await (await send({ type: 'pageview', path: '/pt/x', lang: 'pt' }, 'Googlebot/2.1')).json();
  expect(dnt.data.recorded === false && bot.data.recorded === false, 'DNT/robô não devem ser gravados');
});

await step('atualizar: KPIs batem exatamente com /admin/stats', async () => {
  await page.getByRole('button', { name: 'Atualizar' }).click();
  await page.locator('.adm-kpi').first().waitFor();
  const { body } = await stats();
  const d = body.data;
  expect(d.totalPageViews === 3 && d.projectViews === 1 && d.resumeDownloads === 1, `totais da API inesperados: ${JSON.stringify([d.totalPageViews, d.projectViews, d.resumeDownloads])}`);
  const kpis = await page.locator('.adm-kpi').allInnerTexts();
  const find = (label) => kpis.find((k) => k.toLowerCase().startsWith(label.toLowerCase())) ?? '';
  expect(/^visualizações de página\s+3\b/i.test(find('Visualizações de página').replace(/\s+/g, ' ')), `KPI de visualizações deve ser 3: ${JSON.stringify(kpis[0])}`);
  expect(/\b1\b/.test(find('Visualizações de projetos')), 'KPI de projetos deve ser 1');
  expect(/\b1\b/.test(find('Downloads de currículo')), 'KPI de currículo deve ser 1');
  expect(/\b6\b/.test(find('Eventos registrados')), 'Eventos = 3 + 1 + 1 + 1 trocas de tema = 6');
  await page.screenshot({ path: path.join(OUT, 'visao-geral.png'), fullPage: true });
});

await step('analytics: tabela de páginas, projeto com título real e rótulos de origem', async () => {
  await page.getByRole('link', { name: 'Analytics' }).click();
  await page.getByRole('heading', { level: 1, name: 'Analytics' }).waitFor();
  await page.getByText('BarberShop do Gui').first().waitFor();
  const body = await page.locator('main').innerText();
  expect(/LinkedIn/.test(body), 'origem linkedin deve aparecer');
  expect(/Sage & Ink/.test(body), 'tema escolhido deve aparecer');
  expect((await page.locator('details.adm-details table').count()) === 1, 'tabela equivalente do gráfico');
  await page.screenshot({ path: path.join(OUT, 'analytics.png'), fullPage: true });
});

await step('gráfico: teclado percorre os dias e anuncia o valor', async () => {
  await page.locator('.adm-trend__plot').focus();
  await page.keyboard.press('End');
  const live = await page.locator('.adm-trend [aria-live=polite]').innerText();
  expect(/3 visualizações/.test(live), `anúncio do último dia deveria citar 3 visualizações: "${live}"`);
});

await step('período: 7 dias refaz a consulta; data inválida é recusada', async () => {
  const waited = page.waitForResponse((r) => r.url().includes('/api/admin/stats') && r.url().includes('days=7') && !r.url().includes('days=14'));
  await page.getByRole('button', { name: '7 dias' }).click();
  expect((await waited).status() === 200, 'stats?days=7 deve dar 200');
  await page.getByLabel('A partir de').fill('2020-01-01');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await page.getByRole('alert').filter({ hasText: /data válida/i }).waitFor();
});

await step('monitoramento: verificações reais (API ok, banco memory, persistência degradada, e-mail não configurado)', async () => {
  await page.getByRole('link', { name: 'Monitoramento' }).click();
  await page.getByRole('heading', { level: 1, name: 'Monitoramento' }).waitFor();
  await page.locator('.adm-service').first().waitFor();
  const items = await page.locator('.adm-service').allInnerTexts();
  const by = (n) => (items.find((i) => i.startsWith(n)) ?? '').replace(/\s+/g, ' ');
  expect(/Operacional/.test(by('API')), `API: ${by('API')}`);
  expect(/Operacional/.test(by('Banco de métricas')) && /memory/.test(by('Banco de métricas')), `Banco: ${by('Banco de métricas')}`);
  expect(/Degradado/.test(by('Persistência')), `Persistência: ${by('Persistência')}`);
  expect(/Indisponível/.test(by('E-mail')), `E-mail: ${by('E-mail')}`);
  const body = await page.locator('main').innerText();
  expect(/Há serviços degradados/.test(body), 'resumo geral deve ser "degradado"');
  expect(/\/admin\/stats|\/events|\/health/.test(body), 'tabela de rotas com rotas reais');
  expect(/Nenhum erro 5xx/.test(body), 'sem erros 5xx: mensagem honesta (e sem quebrar com lista vazia)');
  await page.screenshot({ path: path.join(OUT, 'monitoramento.png'), fullPage: true });
});

await step('sessão expirada: 401 em requisição protegida leva ao login com aviso', async () => {
  await ctx.clearCookies();
  await page.getByRole('button', { name: 'Atualizar' }).click();
  await page.getByText('Sua sessão expirou').waitFor();
  await page.getByLabel('Senha').waitFor();
});

await step('login de novo e logout: volta ao login e a API passa a negar', async () => {
  await page.getByLabel('Senha').fill(PASSWORD);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.getByRole('button', { name: 'Sair' }).click();
  await page.getByText('Você saiu do painel').waitFor();
  expect((await stats()).status === 401, 'após logout a API deve negar');
});

await step('idiomas: /en/admin e /es/admin traduzidos', async () => {
  await page.goto(`${SITE}/en/admin`);
  await page.getByLabel('Password').waitFor();
  await page.goto(`${SITE}/es/admin`);
  await page.getByLabel('Contraseña').waitFor();
});

await step('celular (360 px): sem rolagem horizontal no painel autenticado', async () => {
  const m = await browser.newContext({ viewport: { width: 360, height: 780 }, locale: 'pt-BR' });
  const login = await m.request.post(`${API}/api/admin/login`, { data: { password: PASSWORD } });
  expect(login.ok(), 'login via API');
  const cookie = (await m.request.storageState()).cookies.find((c) => c.name === 'admin_session');
  await m.addCookies([{ ...cookie, domain: 'localhost', path: '/api' }]);
  const p = await m.newPage();
  for (const view of ['', '?view=analytics', '?view=monitoring']) {
    await p.goto(`${SITE}/pt/admin${view}`);
    await p.getByRole('button', { name: 'Sair' }).waitFor();
    await p.waitForTimeout(400);
    const w = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(w.sw <= w.cw, `rolagem horizontal em ${view || 'visão geral'}: ${w.sw} > ${w.cw}`);
  }
  await p.screenshot({ path: path.join(OUT, 'mobile-monitoramento.png'), fullPage: true });
  await m.close();
});

await step('admin sem configuração no servidor: tela informa que está desativado', async () => {
  const p = await browser.newPage();
  await p.goto('http://localhost:14174/pt/admin');
  await p.getByText(/não está configurad/i).first().waitFor();
  expect((await p.getByLabel('Senha').count()) === 0, 'não deve oferecer formulário');
  await p.close();
});

await step('API fora do ar: tela de erro com "Tentar de novo" (sem quebrar)', async () => {
  const p = await browser.newPage();
  await p.route('**/api/admin/session', (r) => r.abort());
  await p.goto(`${SITE}/pt/admin`);
  await p.getByRole('button', { name: 'Tentar de novo' }).waitFor();
  await p.close();
});

await step('console sem erros inesperados', async () => {
  const unexpected = consoleErrors.filter((e) => !/401|503|Failed to load resource|net::ERR_FAILED/.test(e));
  expect(unexpected.length === 0, unexpected.join(' | '));
});

await browser.close();
for (const p of procs) p.kill();
console.log(`\n${passed} ok, ${failures.length} falha(s)`);
process.exit(failures.length ? 1 : 0);
