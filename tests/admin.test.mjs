// Testes do painel administrativo: lógica pura (lib/adminData), normalização do contrato com a API Go,
// estados de autenticação e paridade dos dicionários. Rodar: npm run test:web
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(path.join(tmpdir(), 'admin-'));
process.on('exit', () => rm(dir, { recursive: true, force: true }).catch(() => {}));

async function load(entry, name, external = []) {
  const outfile = path.join(dir, `${name}.mjs`);
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'silent', external, define: { 'process.env.NODE_ENV': '"test"' } });
  return import(pathToFileURL(outfile).href);
}

const data = await load('web/src/lib/adminData.ts', 'adminData');
// api e auth no mesmo bundle: ApiError precisa ser a mesma classe para o instanceof funcionar.
const outfile = path.join(dir, 'apiauth.mjs');
await build({
  stdin: { contents: "export * as api from './web/src/services/api.ts'; export * as auth from './web/src/admin/useAuth.ts';", resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"test"' },
});
const { api, auth } = await import(pathToFileURL(outfile).href);
const i18n = await load('web/src/i18n/index.ts', 'i18n');

const day = (date, pageViews, sessions = pageViews) => ({ date, pageViews, sessions });
const NOW = new Date('2026-11-18T23:59:00Z');

test('intervalo de datas: daysSince valida formato, futuro e limite de 365 dias', () => {
  assert.equal(data.utcToday(NOW), '2026-11-18');
  assert.equal(data.daysSince('2026-11-18', NOW), 1);
  assert.equal(data.daysSince('2026-11-12', NOW), 7);
  assert.equal(data.daysSince('2026-11-19', NOW), null);
  assert.equal(data.daysSince('2026-02-31', NOW), null);
  assert.equal(data.daysSince('18/11/2026', NOW), null);
  assert.equal(data.daysSince('2025-11-19', NOW), 365);
  assert.equal(data.daysSince('2025-11-18', NOW), null);
  assert.equal(data.startDateFor(30, NOW), '2026-10-20');
});

test('participação: soma 100, total zero não divide por zero', () => {
  const rows = data.withShare([{ label: 'a', value: 1 }, { label: 'b', value: 3 }]);
  assert.deepEqual(rows.map((r) => r.pct), [25, 75]);
  assert.deepEqual(data.withShare([{ label: 'a', value: 0 }]).map((r) => r.pct), [0]);
  assert.deepEqual(data.withShare([]), []);
});

test('eventTotals e hasAnyData usam só o que a API devolve', () => {
  const base = { totalPageViews: 0, projectViews: 0, resumeDownloads: 0, themes: [] };
  assert.equal(data.hasAnyData(base), false);
  const t = data.eventTotals({ ...base, totalPageViews: 5, projectViews: 2, themes: [{ label: 'sage-ink', value: 3 }] });
  assert.deepEqual(t, { pageview: 5, project_view: 2, resume_download: 0, theme_change: 3, total: 10 });
  assert.equal(data.hasAnyData({ ...base, themes: [{ label: 'x', value: 1 }] }), true);
});

test('comparePeriods: só compara quando há 2N dias e histórico real', () => {
  const full = (n, v) => Array.from({ length: n }, (_, i) => day(`2026-01-${String(i + 1).padStart(2, '0')}`, v));
  const c = data.comparePeriods([...full(7, 10), ...full(7, 15)], 7);
  assert.equal(c.previousViews, 70);
  assert.equal(c.currentViews, 105);
  assert.equal(c.viewsPct, 50);
  assert.equal(data.comparePeriods(full(10, 5), 7), null, 'tamanho errado');
  assert.equal(data.comparePeriods([...full(7, 0), ...full(7, 9)], 7), null, 'sem histórico anterior: zero não é "queda"');
  const late = [...Array.from({ length: 6 }, (_, i) => day(`2026-01-0${i + 1}`, 0)), ...full(8, 4)];
  assert.equal(data.comparePeriods(late, 7), null, 'coleta começou no meio do período anterior');
  const noBase = [...Array.from({ length: 7 }, (_, i) => day(`2026-01-0${i + 1}`, i === 0 ? 0 : 0)), ...full(7, 1)];
  assert.equal(data.comparePeriods(noBase, 7), null);
});

test('niceScale e pontos do gráfico', () => {
  assert.deepEqual(data.niceScale(0), { max: 4, ticks: [0, 1, 2, 3, 4] });
  assert.deepEqual(data.niceScale(37).ticks, [0, 10, 20, 30, 40]);
  for (const m of [1, 4, 5, 99, 1234, 98765]) assert.ok(data.niceScale(m).max >= m, `cobre ${m}`);
  const pts = data.seriesPoints([0, 5, 10], 100, 50, 10);
  assert.deepEqual(pts, [{ x: 0, y: 50 }, { x: 50, y: 25 }, { x: 100, y: 0 }]);
  assert.deepEqual(data.seriesPoints([3], 100, 50, 6), [{ x: 50, y: 25 }]);
  assert.match(data.linePath(pts), /^M0\.0 50\.0 L50\.0 25\.0 L100\.0 0\.0$/);
  assert.equal(data.areaPath([], 10), '');
});

const okProbe = (d) => ({ ok: true, data: d });
const failProbe = (code = 'network_error') => ({ ok: false, code });
const readyData = { status: 'ready', checks: { database: { status: 'ok', kind: 'turso', latencyMs: 12 } } };
const infoData = (f) => ({ service: 'portfolio-api', environment: 'production', commit: 'abc1234', uptimeSeconds: 10, features: { metricsPersistent: true, contact: true, assistant: false, ...f } });

test('saúde: sem verificação nunca é "operacional"', () => {
  const s = data.deriveServices({ health: null, ready: null, info: null, ops: null });
  assert.ok(s.every((x) => x.state === 'unverified'));
  assert.equal(data.overallState(s), 'unverified');
});

test('saúde: tudo verificado e persistente = operacional; e-mail só "configurado" (não verificável)', () => {
  const s = data.deriveServices({ health: okProbe({ status: 'ok' }), ready: okProbe(readyData), info: okProbe(infoData()), ops: null });
  const by = Object.fromEntries(s.map((x) => [x.id, x]));
  assert.equal(by.api.state, 'operational');
  assert.equal(by.database.state, 'operational');
  assert.equal(by.persistence.state, 'operational');
  assert.equal(by.email.state, 'unverified');
  assert.equal(by.email.detail, 'emailConfigured');
  assert.equal(data.overallState(s), 'operational');
});

test('saúde: memória = degradado; falha da API = indisponível; e-mail ausente não derruba o geral', () => {
  const mem = data.deriveServices({ health: okProbe({}), ready: okProbe(readyData), info: okProbe(infoData({ metricsPersistent: false, contact: false })), ops: null });
  assert.equal(data.overallState(mem), 'degraded');
  assert.equal(mem.find((x) => x.id === 'email').state, 'unavailable');
  const down = data.deriveServices({ health: failProbe(), ready: failProbe(), info: failProbe(), ops: failProbe() });
  assert.equal(down.find((x) => x.id === 'api').state, 'unavailable');
  assert.equal(data.overallState(down), 'unavailable');
  const dbDown = data.deriveServices({ health: okProbe({}), ready: okProbe({ status: 'degraded', checks: { database: { status: 'error', latencyMs: 4000 } } }), info: okProbe(infoData()), ops: null });
  assert.equal(dbDown.find((x) => x.id === 'database').state, 'unavailable');
  assert.equal(data.overallState(dbDown), 'unavailable');
});

test('formatação: números por idioma, duração e dia UTC', () => {
  assert.equal(data.formatNumber('pt', 1234.5, 1), '1.234,5');
  assert.equal(data.formatNumber('en', 1234.5, 1), '1,234.5');
  assert.equal(data.formatPercent('pt', 12.5), '12,5%');
  assert.equal(data.formatDuration(42), '42 s');
  assert.equal(data.formatDuration(3700), '1 h 1 min');
  assert.equal(data.formatDuration(93784), '1 d 2 h');
  assert.equal(data.formatDuration(-5), '0 s');
  assert.match(data.formatDay('pt', '2026-11-18', true), /18.*nov.*2026/i);
  assert.equal(data.formatDay('pt', 'lixo'), 'lixo');
});

test('contrato: listas null/ausentes da API viram [] (stats e ops)', () => {
  const ops = api.normalizeOps({ scope: 'instance', uptimeSeconds: 1, requests: 0, errors: 0, routes: null, recentErrors: null, database: { status: 'ok', latencyMs: 0 } });
  assert.deepEqual(ops.routes, []);
  assert.deepEqual(ops.recentErrors, []);
  const st = api.normalizeStats({ days: 7, from: 'a', to: 'b', totalPageViews: 0, totalSessions: 0, projectViews: 0, resumeDownloads: 0, daily: null, topPages: null, topProjects: undefined, resumeByLang: [], languages: [], devices: [], sources: [], themes: [], persistent: false, store: 'memory' });
  for (const k of ['daily', 'topPages', 'topProjects', 'resumeByLang', 'languages', 'devices', 'sources', 'themes']) assert.deepEqual(st[k], [], k);
});

const apiErr = (status, code) => new api.ApiError({ status, code, message: 'x' });

test('autenticação: erros da API viram estados e mensagens corretos', () => {
  assert.deepEqual(auth.stateFromSessionError(apiErr(401, 'unauthorized')), { status: 'anonymous' });
  assert.deepEqual(auth.stateFromSessionError(apiErr(503, 'admin_disabled')), { status: 'disabled' });
  assert.deepEqual(auth.stateFromSessionError(apiErr(0, 'network_error')), { status: 'unreachable' });
  assert.deepEqual(auth.stateFromSessionError(new Error('x')), { status: 'unreachable' });
  assert.equal(auth.loginFailureFrom(apiErr(401, 'invalid_credentials')), 'invalid');
  assert.equal(auth.loginFailureFrom(apiErr(429, 'rate_limited')), 'tooMany');
  assert.equal(auth.loginFailureFrom(apiErr(503, 'admin_disabled')), 'disabled');
  assert.equal(auth.loginFailureFrom(apiErr(0, 'network_error')), 'network');
  assert.equal(auth.loginFailureFrom(apiErr(500, 'internal_error')), 'generic');
  assert.equal(auth.loginFailureFrom('boom'), 'generic');
});

function shape(v, p = '') {
  if (typeof v === 'string') return [`${p}:string`];
  if (v && typeof v === 'object') return Object.keys(v).sort().flatMap((k) => shape(v[k], `${p}.${k}`));
  return [`${p}:${typeof v}`];
}

test('dicionários: painel com a mesma forma em pt/en/es e placeholders iguais', () => {
  const d = i18n.dictionaries ?? i18n.DICTIONARIES ?? i18n.default;
  assert.ok(d && d.pt && d.en && d.es, 'dicionários exportados');
  const ref = shape(d.pt.admin);
  assert.deepEqual(shape(d.en.admin), ref);
  assert.deepEqual(shape(d.es.admin), ref);
  const flat = (v, p = '', out = {}) => {
    if (typeof v === 'string') out[p] = v;
    else if (v && typeof v === 'object') for (const k of Object.keys(v)) flat(v[k], `${p}.${k}`, out);
    return out;
  };
  const [pt, en, es] = ['pt', 'en', 'es'].map((l) => flat(d[l].admin));
  const ph = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
  for (const k of Object.keys(pt)) {
    assert.equal(ph(en[k]), ph(pt[k]), `placeholders en ${k}`);
    assert.equal(ph(es[k]), ph(pt[k]), `placeholders es ${k}`);
    assert.ok(pt[k].trim() && en[k].trim() && es[k].trim(), `vazio ${k}`);
  }
});
