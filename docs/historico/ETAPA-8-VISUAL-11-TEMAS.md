# Etapa 8 — Visual 11: seletor de temas compacto + auditoria de contraste

## Seletor (`components/ThemeSwitcher.tsx`, `styles/components.css`)
Mesmo componente, sem duplicar nada (a lógica de `useTheme`, `useDismiss` e a persistência em `theme/context.tsx` não mudou).
- Botão com 🎨 (rótulo acessível mantido: "Tema: <nome>").
- Painel de 608 px → ~320 px de altura (desktop) e ~330 px (360 px de largura).
- **Paletas em grade horizontal** (5 por linha): cada amostra mostra as 5 cores do tema em faixas.
- **Selecionada**: anel duplo + selo de check (não depende só da cor). O nome aparece numa linha ao passar o mouse/focar; em repouso mostra o da paleta ativa (leitores de tela recebem o nome pelo `aria-label` do rádio).
- **Modo** (Automático/Claro/Escuro) em uma linha; em telas ≤ 26em volta a ícone sobre texto.
- Transições de anel/check/elevação suaves; desligadas com `prefers-reduced-motion`.
- Rádios nativos: setas do teclado, Esc fecha e devolve o foco ao botão, clique fora fecha.

## Auditoria de contraste (feita no navegador, 9 temas × claro/escuro)
- **Texto** (botões, links, tags, filtros, paginação, menu, idioma, CTAs; 4 páginas): 3096 medições, **0 abaixo do mínimo** (4,5:1; 3:1 para texto grande). Estados desativados são isentos (WCAG 1.4.3).
- **Estado selecionado** (filtro de tipo, chips de área, paginação, idioma, menu): em **8 combinações** o filtro de tipo e a página atual tinham 1,8–2,9:1 contra os vizinhos e só a cor os distinguia. **Corrigido** com um anel em `--ink` (`styles/projects-ui.css`); reauditado: 0 casos. O anel de foco continua em `--link`.
- Ao medir por script, desligue as transições (elas distorcem o resultado: apareceram contrastes falsos de 1,01:1).

## Executado
build, typecheck (com shim de tipos do React), `verify-dist` 2085/2085, `a11y` 360/1280 px, teste funcional do seletor (troca, persistência após reload e entre páginas/idiomas, teclado, Esc, clique fora, 360 px sem overflow).
## Não executado
`jsdom` não existe neste ambiente (`contact.test.mjs` e `projects.test.mjs`); `go test`.
