// Testes do rastreador (web/src/services/analytics.ts). Rodar: npm run test:web
// O módulo é empacotado com esbuild e executado no Node com window/document/fetch simulados.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(path.join(tmpdir(), 'analytics-'));
const out = path.join(dir, 'analytics.mjs');
await build({
  entryPoints: ['web/src/services/analytics.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'silent',
  define: { 'process.env.NODE_ENV': '"test"' },
});
const mod = await import(pathToFileURL(out).href);
process.on('exit', () => rm(dir, { recursive: true, force: true }).catch(() => {}));

const calls = [];
let fetchImpl;
let attrs;

function setEnv({ pathname = '/pt/', search = '', dnt = null, gpc = false, referrer = '', webdriver = false, theme = 'ice-tangerine' } = {}) {
  attrs = { 'data-theme': theme };
  globalThis.window = { location: { pathname, search, origin: 'https://site.test', hostname: 'site.test' }, doNotTrack: null };
  globalThis.document = { referrer, documentElement: { getAttribute: (k) => attrs[k] ?? null } };
  Object.defineProperty(globalThis, 'navigator', {
    value: { doNotTrack: dnt, globalPrivacyControl: gpc, webdriver },
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  calls.length = 0;
  mod.__resetAnalyticsForTests();
  fetchImpl = async () => ({ ok: true, status: 202, headers: new Headers(), json: async () => ({ ok: true, data: { recorded: true } }) });
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body), init });
    return fetchImpl();
  };
  setEnv();
});

const tick = () => new Promise((r) => setTimeout(r, 5));

test('pageview envia só os campos do contrato, sem query nem hash', async () => {
  setEnv({ pathname: '/en/projects', search: '?utm_source=x&email=a@b.com' });
  assert.equal(mod.track('pageview'), true);
  await tick();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://site.test/api/events');
  assert.deepEqual(calls[0].body, { type: 'pageview', path: '/en/projects', lang: 'en', theme: 'ice-tangerine' });
  assert.equal(calls[0].init.keepalive, true);
});

test('referrer: só o hostname externo, e só na primeira visualização', async () => {
  setEnv({ referrer: 'https://www.linkedin.com/feed/?trk=secreto' });
  mod.track('pageview');
  setEnv({ pathname: '/pt/about', referrer: 'https://www.linkedin.com/feed/?trk=secreto' });
  mod.track('pageview');
  await tick();
  assert.equal(calls[0].body.referrer, 'www.linkedin.com');
  assert.equal(calls[1].body.referrer, undefined);
  assert.equal(mod.externalReferrerHost('https://site.test/x', 'site.test'), undefined);
  assert.equal(mod.externalReferrerHost('', 'site.test'), undefined);
  assert.equal(mod.externalReferrerHost('isto não é url', 'site.test'), undefined);
});

test('respeita Do Not Track e Global Privacy Control', async () => {
  setEnv({ dnt: '1' });
  assert.equal(mod.track('pageview'), false);
  setEnv({ gpc: true });
  assert.equal(mod.track('pageview'), false);
  setEnv({ webdriver: true });
  assert.equal(mod.track('pageview'), false);
  await tick();
  assert.equal(calls.length, 0);
});

test('evita eventos duplicados em sequência', async () => {
  assert.equal(mod.track('pageview'), true);
  assert.equal(mod.track('pageview'), false);
  setEnv({ pathname: '/pt/contact' });
  assert.equal(mod.track('pageview'), true);
  await tick();
  assert.equal(calls.length, 2);
});

test('não mede admin, 404, raiz sem idioma nem a demo', async () => {
  for (const p of ['/pt/admin', '/pt/nao-existe', '/', '/fr/about']) {
    setEnv({ pathname: p });
    assert.equal(mod.track('pageview'), false, p);
  }
  setEnv({ pathname: '/pt/', search: '?demo=components' });
  assert.equal(mod.track('pageview'), false);
  await tick();
  assert.equal(calls.length, 0);
});

test('eventos com alvo exigem alvo e o enviam no contrato', async () => {
  setEnv({ pathname: '/pt/projects/meu-projeto' });
  assert.equal(mod.track('project_view'), false);
  assert.equal(mod.track('project_view', { target: 'meu-projeto' }), true);
  setEnv({ pathname: '/pt/resume' });
  assert.equal(mod.track('resume_download', { target: 'pt' }), true);
  mod.track('theme_change', { target: 'sage-ink' });
  await tick();
  assert.deepEqual(
    calls.map((c) => [c.body.type, c.body.target]),
    [['project_view', 'meu-projeto'], ['resume_download', 'pt'], ['theme_change', 'sage-ink']],
  );
});

test('API fora do ar nunca lança erro e a sessão desiste após falhas seguidas', async () => {
  fetchImpl = async () => {
    throw new TypeError('network down');
  };
  for (const p of ['/pt/about', '/pt/projects', '/pt/journey', '/pt/contact', '/pt/resume']) {
    setEnv({ pathname: p });
    assert.doesNotThrow(() => mod.track('pageview'));
    await tick();
  }
  assert.equal(calls.length, 3, 'após 3 falhas seguidas, para de tentar');
});

test('429 desativa o rastreamento da sessão imediatamente', async () => {
  fetchImpl = async () => ({
    ok: false,
    status: 429,
    headers: new Headers({ 'Retry-After': '60' }),
    json: async () => ({ ok: false, error: { code: 'rate_limited', message: 'x' } }),
  });
  mod.track('pageview');
  await tick();
  setEnv({ pathname: '/pt/about' });
  assert.equal(mod.track('pageview'), false);
});
