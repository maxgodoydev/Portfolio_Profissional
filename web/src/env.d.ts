// Declarações de ambiente do bundler (esbuild).
declare module '*.css';

/** URL pública do site (sem barra final). Injetada pelo scripts/build.mjs via `define`. */
declare const __SITE_URL__: string;

/** Substituído pelo esbuild (`define`) em tempo de build; permite remover código só de desenvolvimento. */
declare const process: { env: { NODE_ENV: string } };
