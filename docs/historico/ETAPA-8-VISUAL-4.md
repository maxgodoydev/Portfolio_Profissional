# ETAPA 8 — Evolução visual, parte 4: cartões de projeto expansíveis

Escopo: item 2 do backlog (cartões expansíveis e avaliação de imagem de capa). Só a página **Projetos** muda. `ProjectCard.tsx` ficou intacto: a Home continua com os cartões de destaque que levam direto ao detalhe.

## Diagnóstico e decisão de integração
- O `ProjectCard` usa um link esticado (`::after`) no título: o cartão inteiro leva à página do projeto. Isso impede mostrar mais conteúdo sem sair da lista, e a página mostrava as tecnologias sempre por inteiro (até 6 etiquetas).
- Em vez de adicionar props ao `ProjectCard` (usado na Home), criei `components/ExpandableProjectCard.tsx`, só para a lista. Reaproveita `Tag`/`TagList`, `Highlight`, `ExternalLink`, `facts`, `check-list` e `link-row`, e lê somente dados que já existem (`content/projects.ts`, `projectDetails.ts`, i18n).

## Implementado
1. **Padrão "disclosure"**: o título é um `<button aria-expanded aria-controls>` dentro do `<h2>`. O toque/clique em qualquer ponto do cartão alterna (o `::after` do botão cobre o cartão, como antes fazia o link). Enter/Espaço pelo teclado; **Esc** recolhe e devolve o foco ao botão.
2. **Recolhido**: categoria, título, resumo, prévia de até 4 tecnologias (com logos) e "+N" para o restante (lido como "N tecnologias a mais"). Com busca ativa, as tecnologias que casam vêm primeiro na prévia, para o destaque continuar visível. Convite "Mais detalhes ⌄" no rodapé.
3. **Expandido**: foto (só quando existe), fatos (tipo, criação, equipe), funcionalidades, **todas** as tecnologias com título e links: **Abrir página do projeto** (botão principal), demonstração/site e GitHub (secundários, com ícone de link externo e aviso de nova aba). Convite vira "Recolher ⌃".
4. **Animação** por `grid-template-rows` 0fr→1fr (sem medir altura em JS) + fade/deslocamento de 4 px no conteúdo; a prévia de tecnologias recolhe enquanto o painel abre. Só sob `.motion-ok`; com movimento reduzido abre e fecha na hora.
5. **Acessibilidade**: conteúdo recolhido fica `inert` + `visibility:hidden` (fora do Tab e dos leitores de tela); painel é `role="region"` com o nome do projeto; alvos de 44 px nos links do painel; ao abrir, se o fim do cartão ficou fora da tela, rola o mínimo necessário (suave só se o movimento é permitido); foco visível no cartão inteiro.
6. **Grade**: ao abrir um cartão, os vizinhos da mesma linha deixam de esticar (sem vazio embaixo); fechados, continuam com altura igual.
7. **i18n**: 5 chaves novas em `projects` (pt/en/es): `expand`, `collapse`, `openPage`, `moreTags`, `moreTagsLabel`. CSS novo em `styles/cards.css`.

## Avaliação das imagens de capa
- Só **1 dos 8 projetos** tem imagem local real (`segunda-vitrine-equipe.jpg`, uma selfie da equipe). Uma capa na lista deixaria um cartão com foto e sete sem, quebrando a consistência da grade, e não há como criar imagens dos outros sem inventar.
- Decisão: a foto aparece **dentro do cartão expandido** (lazy, com `alt` e proporção reservada) e o componente já aceita `project.image` de qualquer projeto. Quando houver prints/capas reais em `web/public/projects/`, basta preencher o campo `image`; aí vale reavaliar uma capa também no estado recolhido.

## Validação feita
- Build ok (53 páginas HTML); `verify-dist` 1373/1373; `test:web` (search, analytics, admin) 26/26; `a11y-check` ok em 360 px e 1280 px (cartões recolhidos).
- Chromium real: teclado (Enter, Espaço, Tab até o painel, Esc com retorno do foco), painel fechado fora do foco, clique no corpo do cartão, link "Abrir página" navega e o voltar mantém a lista, foto carrega, busca por "maven" destaca a tecnologia na prévia, mobile 375 px com toque, sem rolagem horizontal, alvo de 48 px, movimento reduzido (sem transição), rótulos em en/es, sem erros no console.
- Contraste (texto do cartão expandido × fundo do cartão, 5 temas × claro/escuro): menor razão 4,62:1 (mínimo 4,5:1).

## Não validado nesta sessão
- `npm run typecheck` e `contact.test.mjs` (sem `@types/react` e `jsdom`, sem rede; rode `npm install && npm test`). O esbuild não checa tipos.
- `a11y-check.mjs` não abre cartões (só os testa recolhidos); o estado aberto foi conferido manualmente no navegador. Backend Go não tocado; Preview Deployment na Vercel não executado; sem teste em aparelho físico.

## Backlog visual restante (por prioridade)
3. **(próxima)** Trajetória: marcador de rolagem/progresso e agrupamento por ano.
4. Transição entre páginas (View Transitions API com fallback) e indicador de seção ativa.
6. Logos oficiais de Power BI e Power Query (os SVGs oficiais já foram enviados; falta Excel) e revisão de marcas 2026. Ver nota abaixo.
7. Tilt/parallax sutil (opcional, só ponteiro fino) e hero com ilustração própria.
- Fora do backlog numerado: incluir `a11y-check` com cartão aberto.

Nota: `Power-BI.svg` e `Power-Query-Colored.svg` chegaram junto com esta etapa, mas pertencem ao item 6 e não foram integrados aqui, para respeitar o escopo.
