// Integração do formulário de contato e do rastreamento com o app REAL renderizado em jsdom.
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
  url: 'https://site.test/pt/contact',
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

async function fresh() {
  go('/pt/about');
  await waitFor(() => !form(), 'sair do formulário');
  go('/pt/contact');
  await waitFor(() => form(), 'formulário visível');
  calls.length = 0;
}
function fillValid() {
  setValue(form().querySelector('input[autocomplete="name"]'), 'Maria Silva');
  setValue(form().querySelector('input[autocomplete="email"]'), 'maria@example.com');
  setValue(form().querySelector('textarea'), 'Olá Max, gostaria de conversar sobre uma oportunidade.');
}

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
  await waitFor(() => form(), 'app renderizado em /pt/contact');
});

test('a página de contato mostra e-mail, LinkedIn e GitHub reais', async () => {
  await fresh();
  const hrefs = [...w.document.querySelectorAll('.channel-list a')].map((a) => a.getAttribute('href'));
  assert.deepEqual(hrefs.sort(), ['https://github.com/maxgodoydev', 'https://www.linkedin.com/in/max-godoy/', 'mailto:maxgodoy.dev@gmail.com', 'https://wa.me/5511958081846'].sort());
});

test('abrir a página registra pageview anônimo no contrato', async () => {
  calls.length = 0;
  go('/pt/journey'); // caminho ainda não visitado (visitas repetidas em <1,5 s são deduplicadas de propósito)
  await waitFor(() => calls.some((c) => c.path === '/api/events'), 'pageview enviado');
  const ev = calls.find((c) => c.path === '/api/events').body;
  assert.equal(ev.type, 'pageview');
  assert.equal(ev.path, '/pt/journey');
  assert.equal(ev.lang, 'pt');
  assert.deepEqual(Object.keys(ev).sort(), ['lang', 'path', 'theme', 'type']);
});

test('validação local: não chama a API, anuncia o erro e foca o primeiro campo inválido', async () => {
  await fresh();
  submit();
  await waitFor(() => alert() !== '', 'mensagem de erro');
  assert.equal(contactCalls().length, 0);
  assert.equal(w.document.activeElement, form().querySelector('input[autocomplete="name"]'));
  assert.equal(form().querySelector('input[autocomplete="name"]').getAttribute('aria-invalid'), 'true');
  assert.ok(form().querySelector('input[autocomplete="email"]').getAttribute('aria-describedby'));
  assert.equal(status(), '');
});

test('envio válido: um único POST; duplo envio é bloqueado; sucesso só após confirmação da API', async () => {
  await fresh();
  let release;
  contactHandler = () => new Promise((resolve) => (release = () => resolve(ok())));
  fillValid();
  submit();
  submit(); // segundo envio imediato
  await waitFor(() => status().includes('Enviando'), 'indicador de envio');
  assert.equal(form().getAttribute('aria-busy'), 'true');
  assert.equal(contactCalls().length, 1, 'duplo envio deve ser impedido');
  assert.ok(!status().includes('enviada'), 'não pode mostrar sucesso antes da API confirmar');
  release();
  await waitFor(() => status().includes('Mensagem enviada'), 'mensagem de sucesso');
  const body = contactCalls()[0].body;
  assert.deepEqual(body, { name: 'Maria Silva', email: 'maria@example.com', message: 'Olá Max, gostaria de conversar sobre uma oportunidade.', lang: 'pt', website: '' });
  assert.equal(form().querySelector('textarea').value, '');
  assert.equal(alert(), '');
});

test('resposta 200 sem sent:true NÃO é tratada como sucesso', async () => {
  await fresh();
  contactHandler = async () => reply(200, { ok: true, data: { sent: false } });
  fillValid();
  submit();
  await waitFor(() => alert() !== '', 'erro exibido');
  assert.ok(!status().includes('enviada'));
});

test('falhas da API: indisponível, limite, rede e erro genérico mostram mensagens claras e preservam o texto', async () => {
  const cases = [
    [async () => fail(503, 'contact_unavailable', 'x'), 'não está disponível'],
    [async () => fail(429, 'rate_limited', 'x', undefined), 'Muitas mensagens'],
    [async () => fail(502, 'email_failed', 'x'), 'Não foi possível enviar'],
  ];
  for (const [handler, expected] of cases) {
    await fresh();
    contactHandler = handler;
    fillValid();
    submit();
    await waitFor(() => alert().includes(expected), `erro "${expected}"`);
    assert.ok(!status().includes('enviada'));
    assert.equal(form().querySelector('textarea').value.startsWith('Olá Max'), true, 'o texto digitado não pode ser apagado');
  }
  await fresh();
  contactHandler = async () => {
    throw new TypeError('offline');
  };
  fillValid();
  submit();
  await waitFor(() => alert().includes('Sem conexão'), 'erro de rede');
});

test('422 da API vira erro por campo, no idioma da página', async () => {
  await fresh();
  contactHandler = async () => fail(422, 'validation_error', 'x', { email: 'e-mail inválido' });
  fillValid();
  submit();
  await waitFor(() => form().querySelector('input[autocomplete="email"]').getAttribute('aria-invalid') === 'true', 'campo e-mail inválido');
  assert.ok(w.document.body.textContent.includes('Informe um e-mail válido.'));
  assert.equal(w.document.activeElement, form().querySelector('input[autocomplete="email"]'));
});

test('honeypot permanece vazio e fora do alcance do teclado e de leitores de tela', async () => {
  await fresh();
  const hp = form().querySelector('.hp');
  assert.equal(hp.getAttribute('aria-hidden'), 'true');
  assert.equal(hp.querySelector('input').getAttribute('tabindex'), '-1');
});
