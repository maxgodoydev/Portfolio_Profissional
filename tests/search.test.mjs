// Testes da busca de projetos (web/src/lib/search.ts). Rodar: npm run test:web
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = await mkdtemp(path.join(tmpdir(), 'search-'));
const out = path.join(dir, 'search.mjs');
await build({ entryPoints: [path.join(root, 'web/src/lib/search.ts')], outfile: out, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' });
const { fold, tokenize, matchesAll, splitMatches } = await import(pathToFileURL(out).href);

test('fold ignora acento e caixa', () => {
  assert.equal(fold('Automação'), 'automacao');
  assert.equal(fold('ANÁLISIS'), 'analisis');
});

test('tokenize separa termos, normaliza e remove repetidos', () => {
  assert.deepEqual(tokenize('  Python  SQL python '), ['python', 'sql']);
  assert.deepEqual(tokenize('   '), []);
});

test('matchesAll exige todos os termos, em qualquer campo', () => {
  const fields = ['Banking Analytics', 'Análise de transações', 'Python', 'SQL'];
  assert.equal(matchesAll(tokenize('python sql'), fields), true);
  assert.equal(matchesAll(tokenize('analise'), fields), true); // sem acento
  assert.equal(matchesAll(tokenize('python java'), fields), false);
  assert.equal(matchesAll([], fields), true);
});

test('splitMatches marca o trecho original, mesmo com acento', () => {
  const pieces = splitMatches('Automação de processos', tokenize('automacao'));
  assert.deepEqual(pieces, [{ text: 'Automação', hit: true }, { text: ' de processos', hit: false }]);
});

test('splitMatches junta vários termos e preserva o texto completo', () => {
  const text = 'Python e SQL com Pandas';
  const pieces = splitMatches(text, tokenize('sql python'));
  assert.equal(pieces.map((p) => p.text).join(''), text);
  assert.deepEqual(pieces.filter((p) => p.hit).map((p) => p.text), ['Python', 'SQL']);
});

test('splitMatches sem termos ou sem correspondência devolve um trecho só', () => {
  assert.deepEqual(splitMatches('abc', []), [{ text: 'abc', hit: false }]);
  assert.deepEqual(splitMatches('abc', ['x']), [{ text: 'abc', hit: false }]);
});
