# ETAPA 8 — Evolução visual, parte 4C: cartões compactos, pop-up, marcas coloridas, menu com ícones e neon

## Implementado
1. **Marcas nas cores originais** (`components/brandColors.ts`, `BrandIcon.tsx`): cada logo usa a cor da sua identidade em qualquer tema. Marcas escuras (GitHub, Vercel, Express, JSON) ficam num azulejo claro (`.brand-tile`) para não sumirem no tema escuro. Sem logo oficial no conjunto (continuam sem ícone, nada foi inventado): Power BI, DAX, Power Query, Excel, SQL, Matplotlib, Spring Security, EJS, MongoDB Atlas.
2. **Menu com ícones** (affordance): Sobre, Projetos, Tecnologias, Trajetória, Contato e Currículo ganharam ícone (`NAV_ICONS` em `Header.tsx`); ícones novos em `icons.tsx` (home, user, users, folder, layers, route, file, globe, play, info, wrench, expand, tag, calendar).
3. **Cartões compactos**: capa mais baixa, resumo limitado a 3 linhas, só 3 tecnologias + "+N", grade mais densa. Clique/Enter/Espaço no título abre o pop-up.
4. **Pop-up de projeto** (`<dialog>` modal nativo): foco preso, Esc fecha, clique no fundo fecha, rolagem da página travada, foco volta ao cartão; no celular vira folha inferior. Ordem: título → **links (demonstração/site, código no GitHub, página completa)** → seções com ícone e filete: Para quem*, Contexto/Problema, Como funciona, Minha participação, Tecnologias (logos coloridos). Seções sem dado não aparecem.
   *`audience` é um campo novo e opcional em `content/projectDetails.ts`; está vazio de propósito (não inventei "para quem").
5. **Neon** (`styles/neon.css`): cor única `--neon` derivada do tema; brilho forte no escuro e discreto no claro. Aplicado em: item ativo/hover do menu, chips de filtro ativos, foco da busca, cartões e pop-up, botões principais. Estático (sem piscar); `prefers-reduced-motion` respeitado.

## Validação
- Build ok (53 páginas), `verify-dist` 1445/1445, `test:web` 26/26 (search, analytics, admin).
- Chromium: lista e pop-up em desktop escuro e celular 390 px claro, Esc fecha, 0 erros de console.
- Não validado: `typecheck` completo e `contact.test.mjs` (sem `@types/react`/`jsdom` neste ambiente; rode `npm install && npm test`); `a11y-check`; leitor de tela; aparelho real.

## Pendências
- Cores das marcas foram conferidas por conhecimento do catálogo Simple Icons, sem acesso à rede: revise `brandColors.ts` (principalmente Render e NumPy, que mudaram de cor ao longo dos anos).
- Logos de Power BI, Power Query e Excel: enviar os SVGs oficiais.
- Resumo dos cartões no formato problema → para quem → como funciona → tecnologia: preencher `problem`/`audience` em `projectDetails.ts` com fatos reais de cada projeto (principalmente os que já têm usuários).
