# Etapa 10 — Revisão completa

## Alterações
- `web/src/styles/showcase.css`: o logo do GitHub nos chips de link (pop-up e página do projeto) tinha um quadrado branco solto dentro do círculo; agora o azulejo preenche o círculo (claro e escuro).
- Nenhuma outra correção foi necessária.

## Testes (Chromium headless, desktop 1366×800 e mobile 390×780)
- Build de produção ok (59 páginas); verify-dist 2169/2169.
- Navegação (menu, 7 páginas, PT/EN/ES, 404), filtros de tipo e área, busca, estado vazio, paginação (?page=, página inexistente limitada).
- Cards e pop-up dos 10 projetos: capas, links com noopener, rolagem única, página travada atrás, Esc/fundo fecham, foco volta ao card.
- Seletor com 9 paletas e modos; persistência após reload e troca de página/idioma.
- Trajetória, formação, contato (validação, feedback sem API), redes (GitHub, LinkedIn, e-mail, WhatsApp).
- Contraste AA: 9 paletas × 2 modos × 4 páginas, sem falhas. Sem overflow horizontal. Alt, rótulos, headings e ids ok; alvos de toque ≥24px.
- Console: sem erros do site.

## Não validado aqui
- `tsc` (faltam @types/react) e `tests/contact` e `tests/projects` (faltam jsdom); backend Go (Go não instalado); envio real do formulário (sem API). Rode `npm ci && npm test && npm run a11y` e `go test ./...` localmente.
