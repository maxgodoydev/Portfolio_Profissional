// Ponto de entrada usado APENAS pelo scripts/build.mjs (empacotado para Node).
// Reúne, em um módulo, tudo o que o build precisa reaproveitar do código do frontend.
export { THEMES, themeCss } from './theme/themes';
export { DEFAULT_LANG, HTML_LANG, LANGS, dictionaries } from './i18n';
export { STATIC_ROUTES, buildPath, isIndexable } from './routes';
export { absoluteUrl, buildSeo, renderHeadTags } from './seo';
export { PROJECT_SLUGS } from './content/slugs';
