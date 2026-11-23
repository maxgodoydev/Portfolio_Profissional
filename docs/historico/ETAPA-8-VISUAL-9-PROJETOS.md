# Etapa 8 — Visual 9: organização da seção Projetos (cartões, filtros e paginação)

## Diagnóstico (o que já existia e o que estava ruim)
- Já existiam: pop-up de detalhes, paginação numerada (`?page=N`), grupos (Negócios / Acadêmicos / Estudos), capas, busca. Foram preservados.
- Problemas: (1) a grade usava `auto-fill` e, com 3 cartões por página, deixava **colunas vazias à direita**; (2) o cartão repetia o nome do grupo (já está no título da seção) e **não mostrava as áreas** (Desenvolvimento, Dados, BI, Automação); (3) os filtros eram uma única fileira de chips, sem hierarquia; (4) a paginação era só botões soltos.
- O portfólio da Débora não veio nos arquivos desta conversa; usei apenas a descrição pedida (cartões em grade regular, filtros em destaque e navegação numerada), sem copiar layout.

## Implementado
**Cartões** (`components/ExpandableProjectCard.tsx`): capa; selo **"Em desenvolvimento"** sobre a capa (só quando `status` existe); até 2 **áreas** + "+N" (o tipo "acadêmico" não repete, pois é o grupo); título; resumo de 3 linhas; 3 tecnologias com logo + "+N"; rodapé com **ano** (só se confirmado) e botão visível **Ver detalhes**. Clique/Enter/Espaço no título continua abrindo o pop-up. Grade fixa: 3 colunas (≥ 1024 px), 2 (≥ 640 px), 1.

**Filtros** (`pages/Projects.tsx`, `styles/projects-ui.css`): painel único com busca + dois níveis:
1. **Tipo de projeto** (abas grandes com ícone, contagem e check; selecionado em cor de ação com brilho);
2. **Área** (chips menores; selecionado em tom escuro com check).
Os dois combinam (E) e com a busca. **Contagens cruzadas** (cada opção mostra quanto sobra com os outros filtros); opções com 0 ficam desativadas (tracejadas). Chips de filtros ativos removíveis, "Limpar tudo" e estado vazio mantidos. URL: `?cat=` (tipo, como antes) e `?area=` (novo). No celular, abas em 2 colunas e painel ~30% mais baixo.

**Paginação**: "Página X de Y", botões **Anterior / Próxima** (só ícone no celular), números, página atual destacada, `aria-current="page"`. Comportamento preservado; **corrigido um bug**: ao voltar a um filtro já usado (ex.: "Limpar tudo"), a lista reabria na página antiga em vez da 1.

Textos novos em pt/en/es (`groupLabel`, `areaLabel`, `areaAll`, `pagination.prevText/nextText/pageOf`). Nada de dado novo: áreas, anos, status e tecnologias vêm de `content/projects.ts`.

## Conferido manualmente no navegador (sem rodar as suítes automatizadas, a pedido)
Navegação próxima/anterior/número e último botão desativado; filtro de tipo volta à página 1; tipo + área + busca; remover chip; "Limpar tudo"; estado vazio; URL direta com `cat`+`area`; pop-up abre e fecha com Esc; filtros por teclado; desktop claro/escuro e celular 375 px (pt/en) sem rolagem horizontal e sem erros de console.

## Não executado
`npm run typecheck`, `test:web`, `verify`, `a11y`, `test:api`: não rodados (sem testes, a pedido; também faltam `@types/react`/`jsdom` neste ambiente). Rode `npm install && npm test` antes do deploy. Se o `verify-dist` conferir classes ou textos da página Projetos, ajuste-o ao novo painel.

## Ainda não feito (fora desta etapa; itens 1 a 8 do briefing geral)
Bandeiras nos idiomas, seletor de paletas em popover, trajetória em duas seções, narrativa problema → para quem → solução nos projetos (`audience`/`problem` ainda vazios em `projectDetails.ts` por falta de dado real), formulário de contato em mini card com links, soft skills.
