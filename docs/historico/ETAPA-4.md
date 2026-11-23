# Etapa 4 — Polimento de acessibilidade e clareza

Escopo: corrigir problemas **comprovados** por auditoria automatizada (360 px e 1280 px, 11 rotas), sem alterar conteúdo, arquitetura ou identidade.

| Problema encontrado | Correção | Arquivos |
|---|---|---|
| Salto de nível de título (h1 → h3) em Trajetória e Currículo | `Timeline` ganhou a prop `headingLevel` (padrão 3; Trajetória usa 2); cartões do Currículo agora são `h2` | `components/Timeline.tsx`, `pages/Journey.tsx`, `pages/Resume.tsx`, `styles/pages.css` |
| Grade da Home em "Áreas de atuação" com 4 cartões quebrava em 3+1 | Modificador `card-grid--pairs`: 2×2 a partir de 40rem | `pages/Home.tsx`, `styles/components.css` |
| Alvos de toque < 24 px (links do rodapé, cartões "Continue explorando", projetos listados em Tecnologias) | `display:inline-block` + `padding-block` | `styles/components.css`, `styles/pages.css` |
| Nenhuma verificação repetível de acessibilidade | `scripts/a11y-check.mjs` (`npm run a11y`) | `scripts/`, `package.json` |

Resultado: `npm run a11y` sem falhas nas 11 rotas × 2 larguras (antes: 2 rotas com salto de título e alvos pequenos em todas).

Não alterado de propósito: data de conclusão da FATEC (site: dezembro de 2028; briefing original: dezembro de 2027 — requer confirmação do Max).
