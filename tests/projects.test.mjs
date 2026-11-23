// Integração da lista de projetos (paginação, filtros, ano) e da Home com o app REAL renderizado em jsdom.
// fetch é simulado; nada sai para a rede. Rodar: npm run test:web
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dom = new JSDOM('<!doctype html><html lang="pt-BR" data-theme="ice-tangerine"><body><div id="root"></div></body></html>', {
  url: 'https://site.test/pt/projects',
  pretendToBeVisual: true,
});
const w = dom.window;
w.scrollTo = () => {};
// jsdom não traz estas APIs de navegador; o app as usa (animações de entrada, rolagem).
for (const k of ['requestAnimationFrame', 'cancelAnimationFrame']) globalThis[k] = w[k] ?? (k === 'requestAnimationFrame' ? (cb) => setTimeout(() => cb(Date.now()), 16) : (id) => clearTimeout(id));
class NoopObserver { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
globalThis.IntersectionObserver ??= w.IntersectionObserver ?? NoopObserver;
globalThis.ResizeObserver ??= w.ResizeObserver ?? NoopObserver;
w.IntersectionObserver ??= globalThis.IntersectionObserver;
w.ResizeObserver ??= globalThis.ResizeObserver;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
w.HTMLElement.prototype.scrollIntoView = () => {};
Object.assign(globalThis, {
  window: w,
  document: w.document,
  HTMLElement: w.HTMLElement,
  Node: w.Node,
  Event: w.Event,
  MutationObserver: w.MutationObserver,
  getComputedStyle: w.getComputedStyle.bind(w),
  localStorage: w.localStorage,
  CSS: { escape: (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`) },
});
Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = false;

const calls = [];
let contactHandler;
globalThis.fetch = async (url, init) => {
  const u = new URL(String(url));
  const body = init?.body ? JSON.parse(init.body) : undefined;
  calls.push({ path: u.pathname, body });
  if (u.pathname === '/api/contact') return contactHandler(body);
  return reply(202, { ok: true, data: { recorded: true } });
};
w.fetch = globalThis.fetch;

const reply = (status, json, headers = {}) => ({ ok: status >= 200 && status < 300, status, headers: new Headers(headers), json: async () => json });
const fail = (status, code, message, details) => reply(status, { ok: false, error: { code, message, details }, requestId: 'r1' });
const ok = () => reply(200, { ok: true, data: { sent: true } });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(cond, what, ms = 2500) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const v = cond();
      if (v) return v;
    } catch {}
    await sleep(10);
  }
  throw new Error(`tempo esgotado esperando: ${what}`);
}
function go(p) {
  w.history.pushState(null, '', p);
  w.dispatchEvent(new w.PopStateEvent('popstate'));
}
function setValue(el, value) {
  const proto = el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
}
const $ = (sel) => w.document.querySelector(sel);
const form = () => $('form.form');
const submit = () => form().dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
const status = () => $('p[role="status"]')?.textContent ?? '';
const alert = () => $('p[role="alert"]')?.textContent ?? '';
const contactCalls = () => calls.filter((c) => c.path === '/api/contact');
const field = (name) => form().querySelector(`input[autocomplete="${name}"], textarea`);

before(async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'app-'));
  process.on('exit', () => rm(dir, { recursive: true, force: true }).catch(() => {}));
  const outfile = path.join(dir, 'app.mjs');
  await build({
    entryPoints: ['web/src/main.tsx'],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    outfile,
    logLevel: 'silent',
    loader: { '.css': 'empty' },
    define: { __SITE_URL__: '"https://site.test"', 'process.env.NODE_ENV': '"production"' },
  });
  contactHandler = async () => ok();
  await import(pathToFileURL(outfile).href);
  await waitFor(() => $('#project-results'), 'lista de projetos renderizada');
});
const cards = () => [...w.document.querySelectorAll('#project-results .project-card--compact')];
const titles = () => cards().map((c) => c.querySelector('.project-card__title')?.textContent?.trim());
const pageBtns = () => [...w.document.querySelectorAll('.pagination__btn')];
const numbered = () => pageBtns().filter((b) => /^\d+$/.test(b.textContent.trim()));
const current = () => numbered().find((b) => b.getAttribute('aria-current') === 'page')?.textContent.trim();
const prevBtn = () => w.document.querySelector('.pagination__btn[aria-label="Página anterior"]');
const nextBtn = () => w.document.querySelector('.pagination__btn[aria-label="Próxima página"]');
const total = () => Number(/de (\d+)/.exec($('.result-count').textContent)?.[1]);

async function openProjects(search = '') {
  go('/pt/about');
  await waitFor(() => !$('#project-results'), 'sair de Projetos');
  go('/pt/projects' + search);
  await waitFor(() => $('#project-results'), 'Projetos visível');
}

test('mostra 3 projetos por página, com paginação numerada e setas', async () => {
  await openProjects();
  assert.equal(cards().length, 3);
  const n = total();
  assert.ok(n > 3, 'precisa haver mais de uma página');
  assert.equal(numbered().length, Math.ceil(n / 3));
  assert.equal(current(), '1');
  assert.equal(prevBtn().disabled, true);
  assert.equal(nextBtn().disabled, false);
  assert.equal(w.document.querySelector('nav.pagination').getAttribute('aria-label'), 'Paginação de projetos');
});

test('avançar, voltar e escolher a página direto; página atual destacada e escrita na URL', async () => {
  await openProjects();
  const first = titles();
  nextBtn().click();
  await waitFor(() => current() === '2', 'página 2');
  assert.notDeepEqual(titles(), first);
  await waitFor(() => w.location.search.includes('page=2'), 'URL com page=2');
  prevBtn().click();
  await waitFor(() => current() === '1', 'volta à página 1');
  assert.deepEqual(titles(), first);
  const last = numbered().at(-1);
  last.click();
  await waitFor(() => current() === last.textContent.trim(), 'última página');
  assert.equal(nextBtn().disabled, true);
  assert.equal(cards().length, total() - (numbered().length - 1) * 3);
  assert.ok(cards().length >= 1 && cards().length <= 3);
});

test('abrir /projects?page=2 já mostra a página 2 e página inexistente cai na última', async () => {
  await openProjects('?page=2');
  assert.equal(current(), '2');
  await openProjects('?page=99');
  assert.equal(current(), String(numbered().length));
});

test('buscar ou filtrar volta para a página 1 e esconde a paginação quando cabe numa página', async () => {
  await openProjects();
  numbered()[1].click();
  await waitFor(() => current() === '2', 'página 2');
  const chip = [...w.document.querySelectorAll('.chips .chip')].find((b) => !b.disabled && b.getAttribute('aria-pressed') === 'false');
  chip.click();
  await waitFor(() => !w.document.querySelector('.pagination') || current() === '1', 'filtro reseta a página');
  const input = $('#project-search');
  setValue(input, 'zzzz-nada-encontrado');
  await waitFor(() => $('.empty--search'), 'estado vazio');
  assert.equal(w.document.querySelector('.pagination'), null);
  setValue(input, '');
});

test('cada cartão tem capa (ou quadro neutro), título e o ano quando confirmado', async () => {
  await openProjects();
  for (const c of cards()) {
    assert.ok(c.querySelector('.project-card__cover'));
    assert.ok(c.querySelector('.project-card__title').textContent.trim());
  }
  // Segunda Vitrine tem data confirmada (2026-11): o ano aparece no cartão.
  setValue($('#project-search'), 'Segunda Vitrine');
  await waitFor(() => cards().length >= 1, 'resultado da busca');
  assert.ok(cards()[0].textContent.includes('2026'));
  setValue($('#project-search'), '');
});

test('projetos em andamento mostram o selo de situação', async () => {
  await openProjects();
  setValue($('#project-search'), 'Tica');
  await waitFor(() => titles().some((t) => t?.includes('Tica')), 'Tica Artesanato');
  assert.ok(cards()[0].textContent.includes('Em desenvolvimento'));
  setValue($('#project-search'), '');
});

test('Home: "O que eu construo" com ícones e seção de presença digital com os 7 benefícios', async () => {
  go('/pt/');
  await waitFor(() => $('.presence'), 'Home');
  assert.ok(w.document.body.textContent.includes('O que eu construo'));
  assert.equal(w.document.querySelectorAll('.info-card--icon .info-card__icon svg').length, 4);
  assert.equal(w.document.querySelectorAll('.presence__list li').length, 7);
  assert.ok($('.presence__figure img').getAttribute('alt'));
});
