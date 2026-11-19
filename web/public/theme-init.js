/*
 * Executado no <head>, ANTES da pintura, para evitar o "flash" do tema errado.
 * Arquivo externo porque a CSP (script-src 'self') bloqueia scripts inline.
 * As chaves e os ids precisam ser iguais aos de web/src/lib/storage.ts e web/src/theme/themes.ts
 * (scripts/build.mjs confere os ids das paletas e interrompe o build se houver divergência).
 */
(function () {
  var root = document.documentElement;
  var THEMES = ['ice-tangerine', 'cherry-cream', 'sage-ink', 'lavender-graphite', 'monochrome-stone'];
  var theme = 'ice-tangerine';
  var mode = 'auto';
  try {
    var t = localStorage.getItem('mg:theme');
    var m = localStorage.getItem('mg:mode');
    if (t && THEMES.indexOf(t) !== -1) theme = t;
    if (m === 'light' || m === 'dark' || m === 'auto') mode = m;
  } catch (e) {
    /* localStorage indisponível (modo privado, bloqueio): usa os padrões */
  }
  var resolved = mode;
  if (mode === 'auto') {
    resolved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-mode', resolved);
  root.setAttribute('data-mode-pref', mode);
})();
