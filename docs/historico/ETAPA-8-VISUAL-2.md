# ETAPA 8 — Evolução visual, parte 2: busca e filtros de Projetos

Escopo: item 1 do backlog da parte 1 (prioridade 1 da diretriz: usabilidade e clareza). Só a página **Projetos** foi alterada.

## Diagnóstico (página antes)
- Busca só encontrava o texto exato (com acento) e um único trecho; "analise" não achava "Análise".
- Nenhuma pista de quantos projetos cada categoria teria; era preciso clicar para descobrir.
- Sem indicação clara dos filtros aplicados nem forma rápida de remover um por um.
- A contagem mudava sem nenhum feedback; o estado vazio era só uma frase.
- Filtros se perdiam ao abrir um projeto e voltar.

## Implementado
1. **Busca sem acento e com vários termos** (`lib/search.ts`): "python sql" exige os dois; ignora acentos e maiúsculas. Funções puras, com testes (`tests/search.test.mjs`).
2. **Destaque do termo** (`components/Highlight.tsx`, `<mark class="hl">`) no título, resumo e tecnologias dos cartões. Dentro das tags o destaque usa o tom do cartão com contorno, para manter o contraste.
3. **Contagem em cada chip de categoria**, já considerando a busca atual; chips sem resultado ficam desativados (a menos que estejam selecionados). O número também é lido por leitores de tela.
4. **Filtros ativos como chips removíveis** (categoria e busca), com "Limpar tudo". Rótulos acessíveis ("Remover filtro: …").
5. **Contagem com feedback**: "2 de 8 projetos" quando há filtro, com pequena animação a cada mudança; continua em `role="status"`.
6. **Campo de busca** com ícone, botão de limpar e **Esc** para limpar; o foco volta ao campo depois de limpar.
7. **Estado vazio ilustrado** (SVG com cores do tema), mensagem com o termo buscado e **sugestões reais**: as 4 tecnologias mais frequentes nos projetos (calculadas dos dados, não inventadas).
8. **Filtros na URL** (`?q=sql&cat=bi`, gravada com atraso de 300 ms e `replaceState`): voltar do detalhe mantém a busca, e o link pode ser compartilhado. SEO e métricas não mudam (canonical e pageview ignoram a query).
9. **Movimento**: cartões que entram na lista surgem com fade + 10 px (stagger curto); só sob `.motion-ok` (desligado com `prefers-reduced-motion`). Hover dos chips só em `(hover: hover)`, com `:active` para toque.
10. Correção: tags de tecnologia agora têm o texto em um único `span` (evita separar "SQL" + "ite" em destaques). Ícone novo `search`. 9 chaves novas em `projects` nos 3 idiomas.
11. `scripts/a11y-check.mjs` passou a incluir a página de Projetos com busca, filtro e estado vazio.

## Validação feita
- Build: ok (53 páginas HTML); `verify-dist`: 1353/1353; `test:web` (search, analytics, admin): 26/26.
- Navegador real (Chromium via Playwright), com preview local: busca multi-termo, sem acento, destaque, URL, voltar do detalhe, estado vazio, sugestões, Esc, limpar tudo, pt/en/es, movimento reduzido (sem animação), mobile 375 px sem rolagem horizontal, sem erros no console.
- Contraste (cálculo nos 5 temas × claro/escuro): menor razão 4,64:1 (mínimo 4,5:1).
- a11y-check: ok em 360 px e 1280 px, inclusive nos estados com filtro e vazio.

## Não validado nesta sessão
- `npm run typecheck` completo e `contact.test.mjs` (dependem de `@types/react` e `jsdom`, não instalados no ambiente de trabalho; rode `npm install` e `npm test`). Os arquivos alterados foram checados com tipos simulados de React, sem erros.
- Backend Go: não foi tocado e `go` não estava disponível aqui.
- Preview Deployment na Vercel: não executado.

## Backlog visual restante (por prioridade)
2. Cartões de projeto expansíveis (acordeão acessível) e imagem de capa na lista.
3. Trajetória: marcador de rolagem/progresso e agrupamento por ano.
4. Transição entre páginas (View Transitions API com fallback) e indicador de seção ativa.
5. Menu mobile com animação e item atual destacado; tooltips nos logos.
6. Logos oficiais de Power BI/Excel (kits oficiais da Microsoft) e revisão de marcas 2026 — exige rede.
7. Tilt/parallax sutil (opcional, só ponteiro fino) e hero com ilustração própria.
