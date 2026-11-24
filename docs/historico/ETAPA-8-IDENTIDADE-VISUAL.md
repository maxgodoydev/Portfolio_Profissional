# Etapa 8 — Revisão geral da identidade visual

Base: portfolio-etapa-8-idiomas-tecnologias. Camada nova: `web/src/styles/identity.css` (importada por último entre os estilos públicos).

## Regras da identidade
- Cor de ação (`--action`): só para o que se clica ou indica estado (botão principal, filtro ativo, item atual do menu, progresso de leitura, ponto de status). Estrutura passiva usa `--soft`, `--surface`, `--line`.
- Marcador: barra curta sob o h1 e ao lado dos h2. Único elemento gráfico recorrente.
- Movimento só como resposta a ação ou indicador de estado; tudo desligado em prefers-reduced-motion.
- Só tokens do tema (9 paletas, claro/escuro). Sem fontes ou bibliotecas novas.

## Mudanças
- Menu: item atual com fundo tingido e ícone legível (antes o ícone laranja sumia sobre --soft); hover com fundo suave; alvos de toque de 44 px.
- Cabeçalho translúcido com fio de progresso de leitura (animation-timeline: scroll, só onde há suporte).
- Tipografia: h1 até 2,625rem, h2 até 1,6875rem, texto 1rem; rótulos pequenos sem caixa alta.
- Início: status com ponto pulsante (neutro, não parece botão); cartões de foco sem hover enganoso; "Continue explorando" com ícone e seta; "Presença digital" como painel.
- Tecnologias: status como ponto + rótulo (cheio/vazado/ação); "Usada em projetos" não repete por cartão (texto mantido para leitores de tela); créditos de licença em bloco recolhível no fim (nova chave i18n `technologies.creditsTitle` em pt/en/es).
- Brilho neon reduzido; sem text-shadow nem drop-shadow.
- Mobile: cartões de foco/atalhos com ícone ao lado do texto; botões do hero em largura flexível.

## Arquivos
Novo: web/src/styles/identity.css. Alterados: web/src/main.tsx, pages/Home.tsx, pages/Technologies.tsx, i18n/pt.ts, en.ts, es.ts.

## Validação
- Build ok (59 páginas); verify 2145/2145; testes search/admin/analytics 26/26.
- tsc: sem erros novos além do ruído de @types/react ausente no ambiente de montagem.
- Conferido em navegador (Chromium) em 1280 px e 390 px: Início, Sobre, Projetos, Trajetória, Tecnologias, Contato, Currículo (ice-tangerine claro); Início e Tecnologias também em ocean-navy escuro, mint-coral claro e monochrome-stone escuro.
- NÃO executados aqui: tests/contact e tests/projects (exigem jsdom, ausente); npm run a11y; pop-up de projeto e Trajetória completa não foram reinspecionados visualmente. Rode `npm ci && npm test && npm run a11y` localmente antes do push.
