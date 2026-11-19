# Portfólio de Max Godoy — v3 (ETAPA 3: painel administrativo)

> **Estado:** Etapa 1 (backend Go) + 2A/2B/2C/2D (site público, rastreamento, contato) + **Etapa 3** (painel `/{pt|en|es}/admin` com autenticação, visão geral, analytics e monitoramento ligados à API Go real).
> Base: Etapa 2D (arquitetura consolidada) + checkpoint intermediário da Etapa 3, que foi revisado e concluído.

## Etapa 3 — o que há no painel

Rota única `/{lang}/admin`; telas por `?view=overview|analytics|monitoring`. `noindex`, fora do sitemap, bloqueada no `robots.txt`.

| Parte | Arquivos | Endpoint Go usado |
|---|---|---|
| Sessão | `web/src/admin/useAuth.ts`, `Login.tsx` | `POST /admin/login`, `POST /admin/logout`, `GET /admin/session` |
| Visão geral / Analytics | `admin/views/Overview.tsx`, `Analytics.tsx`, `charts.tsx`, `ui.tsx` | `GET /admin/stats?days=1..365` |
| Monitoramento | `admin/views/Monitoring.tsx` | `GET /health`, `/ready`, `/info`, `/admin/ops` |
| Lógica pura | `web/src/lib/adminData.ts` | — |

Princípios: senha e token nunca ficam no navegador (cookie `HttpOnly`, `SameSite=Strict`; a sessão é sempre confirmada por `GET /admin/session`); 401 em qualquer chamada leva ao login com aviso; nada é estimado — sessões são "sessões estimadas" (hash diário), comparação com período anterior só aparece quando há histórico completo, serviço não verificado aparece como "Não verificado" (o envio de e-mail não é testável e é mostrado apenas como configurado/não configurado); aviso permanente quando o armazenamento é em memória; contadores de `/admin/ops` valem só para a instância que respondeu.

### O que mudou em relação ao checkpoint
- **Backend (correção):** `GET /admin/ops` devolvia `recentErrors: null` quando não havia erros 5xx; agora devolve `[]`. Teste de contrato em `internal/server/admin_contract_test.go`.
- **Frontend:** `services/api.ts` normaliza listas `null` (defesa em profundidade); **foco do login** agora volta ao campo após senha errada (antes falhava porque o campo ainda estava desabilitado); tabelas do painel não quebram mais o texto das rotas em telas de 360 px (rolagem horizontal dentro da tabela).
- **Testes novos:** `tests/admin.test.mjs` (12), `internal/server/admin_contract_test.go` (9), `scripts/e2e-admin.mjs` (18 verificações com Chromium contra a API Go real).
- Nenhum endpoint, evento ou dado novo foi inventado; o backend só recebeu a correção acima.

### Auditoria final
Veja `docs/ETAPA-3-AUDITORIA.md` (evidências, problema corrigido e pendências A/B/C).

### Como validar
1. `npm test` (typecheck → testes web → build → verify → `go test`).
2. E2E do painel (precisa de Playwright e Go): `npm i -D playwright && npx playwright install chromium && npm run build && npm run e2e:admin`. Sobe a API Go (senha aleatória), o site e confere login, números do painel × `/admin/stats`, monitoramento, sessão expirada, logout, idiomas, 360 px e admin desativado. Imagens em `test-results/`.
3. Manual local: `SESSION_SECRET=<32+ caracteres> ADMIN_PASSWORD=... npm run api` e, em outro terminal, `npm run dev` → `http://localhost:3000/pt/admin`.
4. Depois do deploy: login em `/pt/admin`; "Monitoramento" deve mostrar banco `turso` e persistência "Operacional".

### O que **não** foi validado aqui
- Turso, Resend e Vercel reais (sem credenciais/acesso): o e2e usou armazenamento em memória.
- `npm test` completo: o ambiente não tinha rede, então `jsdom` e `@types/react` não puderam ser instalados; os testes `analytics`/`contact` (jsdom) **não foram executados nesta etapa** (arquivos inalterados desde a 2D). O typecheck rodou com um shim de tipos do React e acusou apenas parâmetros de evento implícitos do próprio shim. Rode `npm install && npm test` na sua máquina.
- Leitor de tela real, Safari/Firefox. Verificado em Chromium: sem rolagem horizontal a 360 px, foco, rótulos e teclado no gráfico.

## Etapa 2D — o que mudou

**Frontend**
- `web/src/services/analytics.ts` (novo): rastreador anônimo ligado ao `POST /api/events`. Eventos usados, exatamente os do backend: `pageview`, `project_view`, `resume_download`, `theme_change`. Respeita DNT e Global Privacy Control, ignora `/admin`, 404 e `?demo=`, deduplica eventos repetidos, envia só o **hostname** do referrer (apenas na primeira visualização), nunca lança erro e desiste da sessão após 3 falhas seguidas ou ao receber 429/403.
- **Não existe evento de troca de idioma no backend**, então nenhum foi inventado: o idioma já vai no campo `lang` de cada evento. Se quiser um evento próprio, é preciso criá-lo em `internal/server/events.go` e em `store.go` primeiro.
- `App.tsx` mede a página pelo caminho (a visita em `/` só é medida após o redirecionamento para `/pt|en|es/`); `theme/context.tsx` mede só mudança real de paleta; `pages/Resume.tsx` mede o clique **somente** nos PDFs que existem no manifest.
- `pages/Contact.tsx`: trava síncrona contra duplo envio; sucesso exibido apenas se a API responder `200` com `sent:true`; erros 422 por campo (textos no idioma da página); foco no primeiro campo inválido; regiões `role="status"` (envio/sucesso) e `role="alert"` (erro) sempre presentes; `aria-busy`; `required`, `maxLength`, `inputMode`; botão com `aria-disabled` (mantém o foco do teclado).
- `content/profile.ts`: e-mail, LinkedIn e GitHub preenchidos (os dados informados). Sem telefone, endereço ou currículo.
- Política de privacidade (PT/EN/ES) reescrita para refletir o comportamento real: hash diário, categoria de origem (hostname não é guardado), ausência de cookies de rastreamento e de analytics de terceiros, cookie de sessão só no `/admin`, e-mail entregue via Resend, hospedagem Vercel e métricas no Turso.

**Backend Go**
- **Correção:** sem `SESSION_SECRET`, os hashes anônimos usavam o segredo fixo `"dev-only"` também em produção (hashes reversíveis por força bruta sobre IPs). Agora usam um segredo aleatório por instância.
- `config.Warnings()`: avisos de inicialização claros (Turso parcial/ausente, `SESSION_SECRET` curto, Resend ausente) **sem imprimir valores**.
- `GET /info` não expõe mais a versão do Go nem se o admin está ativo.
- O endpoint do Resend ficou injetável (`Server.resendURL`) para testar o envio com um servidor falso.
- `gofmt` aplicado (alguns arquivos estavam fora do padrão).

**Publicação**
- `vercel.json`: removido o redirect `/curriculo-max-godoy.pdf` → PDF inexistente (gerava link quebrado). Reative-o quando os PDFs existirem. Nenhum fallback de SPA foi adicionado.

**Testes novos**
- `tests/analytics.test.mjs` (8) e `tests/contact.test.mjs` (8, app real em jsdom com `fetch` simulado).
- `internal/server/integration_test.go` (Go): envio com Resend falso (200/500), limite de 3/hora, honeypot, detalhes 422, contrato dos 4 tipos de evento, ausência de IP/UA/hostname no evento gravado, segredo aleatório, `/info`, avisos de configuração.
- `scripts/verify-dist.mjs`: 3 idiomas × todas as rotas, canonical, hreflang, robots por página, sitemap, robots.txt, manifest de currículo, `vercel.json` (sem SPA fallback, CSP), varredura de credenciais.
- Tudo junto: `npm test` (typecheck → testes web → build → verify → `go test`).

### O que **não** foi validado aqui
- Envio real de e-mail (Resend) e persistência real (Turso): exigem credenciais. Veja "Como validar" abaixo.
- Comportamento do deploy na Vercel (rewrite `/api/*`, URLs sem barra final, função Go). Não há acesso à Vercel neste ambiente.
- Layout em celular/tela pequena e contraste visual em navegador real: só foram verificadas as propriedades de acessibilidade no DOM, não a renderização.

### Como validar depois do deploy
1. Defina as variáveis do `.env.example` na Vercel (mínimo: `TURSO_*`, `SESSION_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`).
2. `GET /api/info` → `features.contact` e `features.metricsPersistent` devem ser `true`; `GET /api/ready` → `kind: "turso"`.
3. Envie uma mensagem pelo formulário em `/pt/contact` e confira o recebimento; a 4ª em uma hora deve responder 429.
4. Navegue pelo site com uma janela normal e outra com Do Not Track ligado; só a primeira deve gerar eventos (veja em `/api/admin/stats` após o login).

## Parte 2C — o que foi adicionado

| Arquivo | Função |
|---|---|
| `pages/Home.tsx`, `About.tsx`, `Projects.tsx`, `ProjectDetail.tsx`, `Technologies.tsx`, `Journey.tsx`, `Contact.tsx`, `Resume.tsx`, `Privacy.tsx`, `NotFound.tsx`, `shared.tsx`, `index.tsx` | Páginas definitivas. `admin` continua provisório (Etapa 3) |
| `content/projects.ts` | 7 projetos: fatos neutros de idioma, tecnologias confirmadas, links e resumos pt/en/es. Fonte única dos slugs (`content/slugs.ts`) |
| `content/projectDetails.ts` | Contexto, solução, funcionalidades e participação por projeto (pt/en/es). Seções sem dado confirmado **não aparecem** |
| `content/journey.ts`, `content/technologies.ts`, `content/profile.ts` | Linha do tempo, tecnologias (usada em projetos / estudada / em desenvolvimento) e links públicos |
| `lib/period.ts` | Formatação de datas por idioma |
| `styles/pages.css` | Estilos das páginas (somente variáveis do tema) |
| `i18n/{pt,en,es}.ts` | Novas chaves (mesma forma nos três) e previsão de conclusão **dezembro de 2028** |
| `seo.ts` | Título e descrição próprios por projeto (também no HTML estático gerado) |
| `components/Timeline.tsx`, `Footer.tsx` | Timeline aceita tipo do item; footer com link do GitHub |

### Pendências de conteúdo (não inventadas)
- ~~`content/profile.ts` com LinkedIn/e-mail `null`~~: resolvido na Etapa 2D.
- **Currículos PDF**: nenhum veio no projeto; a página mostra "Em breve" e o link só aparece quando o arquivo existir em `web/public/resume/`.
- Participação individual só aparece em BarberShop do Gui e Portfólio de Power BI (o roteiro não trouxe esse dado para os demais).
- Classificação de tecnologias: Excel, React, PHP, C, C++ e MySQL estão como "Estudada". Ajuste em `content/technologies.ts` se algum já apareceu em projeto publicado.
- "SQL para Análise de Dados e Dados do Zero" foi mantido como um único item da linha do tempo, exatamente como no roteiro.

## Validação da Parte 2C (o que foi realmente executado)

- ✅ `npm run build`: 50 páginas HTML (3 idiomas × 15 rotas + raiz + 404), sitemap com 45 URLs, `admin` fora do sitemap.
- ✅ `tsc --noEmit` (strict) sem erros. ⚠️ Com *shim* mínimo de `@types/react` (sem rede): rode `npm install && npm run typecheck` na sua máquina.
- ✅ Chromium/Playwright contra `npm run preview`: 45 páginas (3 idiomas × 8 rotas + 7 projetos) com exatamente 1 `<h1>`; sem scroll horizontal em 1280 px e 360 px; busca e filtro de projetos; troca de idioma mantendo a página; contato com validação; slug inexistente → "Projeto não encontrado"; currículo sem PDF → "Em breve" sem link.
- ✅ Nenhuma ocorrência de "2027" no código-fonte nem no HTML/XML gerado; "dezembro de 2028" (ou dez/2028) presente em Home, Sobre, Trajetória e Currículo nos três idiomas.
- ✅ Segunda Vitrine na linha do tempo em nov/2026 (e Semana de Tecnologia em nov/2025).
- ✅ Sem erros de console/CSP; única resposta 404 observada é a de um slug inexistente (esperada).
- ❌ Não testado: envio real do formulário (API/Resend), acessibilidade com leitor de tela, Safari/Firefox, alcance dos links externos (sem rede), `go test` (Go não disponível no ambiente; backend não foi alterado).

## Parte 2B — o que foi adicionado

| Arquivo | Função |
|---|---|
| `components/Header.tsx` | Marca, navegação (painel recolhível abaixo de 900 px, `aria-expanded`, Escape/clique fora/navegar fecham), seletores |
| `components/LanguageSwitcher.tsx` | PT/EN/ES sempre visíveis; são links reais para a mesma rota no outro idioma |
| `components/ThemeSwitcher.tsx` | Painel com as 5 paletas (amostras das próprias cores) e modos auto/claro/escuro; `radio` nativo (setas, leitor de tela); seleção marcada por borda + check |
| `components/Footer.tsx`, `Layout.tsx` | Rodapé (navegação, privacidade, copyright) e estrutura global com link "pular para o conteúdo" |
| `components/ProjectCard.tsx`, `Tag.tsx`, `Timeline.tsx`, `icons.tsx` | Componentes reutilizáveis (ícones SVG inline, sem biblioteca) |
| `lib/useDismiss.ts` | Fechar popover ao clicar/focar fora |
| `styles/components.css` | Estilos de todos os componentes; breakpoints 640 px / 900 px |
| `pages/ComponentsDemo.tsx` | **Demonstração temporária**, só em desenvolvimento: `npm run dev` → `/pt/?demo=components`. É removida do bundle de produção (verificado) |

Notas:
- Nenhuma chave nova nos dicionários (pt/en/es continuam com a mesma forma). Nenhuma paleta foi criada ou alterada.
- `--muted` só é usado sobre `--bg`/`--surface`/`--card`; sobre `--soft` usa-se `--ink`.
- Footer sem links de GitHub/LinkedIn/e-mail: as URLs reais entram na Parte 2C com o conteúdo confirmado.
- A troca de tema ainda **não** envia `theme_change` (métricas são da Parte 2D).

## Parte 2A — o que foi adicionado (resumo)

| Arquivo | Função |
|---|---|
| `scripts/build.mjs` | `npm run build` (produção → `dist/`), `npm run dev` (watch + servidor + proxy `/api` → `localhost:8080` + live reload), `npm run preview` (serve `dist/`, 404 real, CSP do `vercel.json`) |
| `web/index.html` | Template do HTML (placeholders `{{...}}` preenchidos pelo build) |
| `web/src/main.tsx`, `App.tsx` | Entrada React, providers, SEO por rota, foco no `<main>` ao trocar de página |
| `web/src/router.tsx`, `routes.ts` | Roteador próprio (History API + `useSyncExternalStore`), `Link`, `navigate`, parse/build de URLs |
| `web/src/i18n/context.tsx` | `I18nProvider`/`useI18n` — a URL é a fonte de verdade do idioma |
| `web/src/theme/context.tsx` | `ThemeProvider`/`useTheme` — paleta + modo auto/claro/escuro, persistência |
| `web/src/lib/storage.ts` | `localStorage` seguro (try/catch) |
| `web/src/services/api.ts` | Cliente tipado (`ApiError`, envelope) só das rotas reais da API Go |
| `web/src/seo.ts` | `buildSeo` / `renderHeadTags` (build) / `applySeo` (cliente) |
| `web/src/styles/global.css` | Reset, tipografia, layout, foco visível, `prefers-reduced-motion` |
| `web/public/` | `theme-init.js`, `favicon.svg`, `og-image.png` (1200×630; fonte em `docs/og-image.source.svg`), `resume/`, `profile/` |
| `web/src/content/slugs.ts` | Lista de slugs de projeto usada pelo build (vazia até a Parte 2C) |

### Decisões de URL
- `/{pt|en|es}/` (home) e `/{pt|en|es}/{about|projects|technologies|journey|contact|resume|privacy|admin}`, mais `/{lang}/projects/{slug}`.
- Os segmentos são iguais nos três idiomas (facilita hreflang e troca de idioma).
- `/` redireciona (no cliente) para o idioma salvo → idioma do navegador → `pt`. Canonical da raiz: `/pt/`.
- `admin` recebe `noindex,nofollow`, fica fora do sitemap e é bloqueado no `robots.txt`.
- Slugs de projeto desconhecidos caem no `404.html` (status 404 na Vercel); o roteador do cliente reconhece o formato.

### Variáveis do build
`SITE_URL` (canonical/sitemap, padrão `https://max-godoy-portfolio.vercel.app`), `API_URL` (proxy, padrão `http://localhost:8080`), `WEB_PORT` (padrão 3000 no dev, 4173 no preview).

### Currículos
O build lê `web/public/resume/curriculo-max-godoy-{pt,en,es}.pdf` e gera `dist/resume/manifest.json` com `null` para os ausentes.
**Nenhum PDF veio no ZIP da Etapa 1**: coloque-os em `web/public/resume/` (na Etapa 2D o redirect `/curriculo-max-godoy.pdf` foi removido do `vercel.json` porque apontava para um arquivo inexistente).

## O que existe nesta etapa

| Pasta | Conteúdo |
|---|---|
| `api/index.go` | Função serverless Go da Vercel (roteia toda a API) |
| `cmd/server/main.go` | Mesma API rodando localmente (`go run ./cmd/server`) |
| `internal/config` | Leitura de variáveis de ambiente |
| `internal/store` | Persistência: Turso via HTTP (sem driver) e memória (só dev/testes) + agregação das métricas |
| `internal/server` | Rotas, validação, CORS, rate limit, logs JSON, admin (cookie HMAC), contato (Resend), monitoramento |
| `web/src/theme` | 5 paletas × claro/escuro, contraste derivado por código |
| `web/src/i18n` | Dicionários pt/en/es tipados (`en.ts` e `es.ts` precisam ter a mesma forma de `pt.ts`) |
| `vercel.json`, `.env.example`, `.gitignore`, `package.json`, `tsconfig.json` | Configuração |

## API (prefixo `/api`)

Envelope: `{"ok":true,"data":{...}}` ou `{"ok":false,"error":{"code","message","details"},"requestId"}`.

| Método e rota | Descrição |
|---|---|
| `GET /health` | Disponibilidade |
| `GET /ready` | Verifica o banco (503 se falhar) |
| `GET /info` | Versão, ambiente, uptime, recursos ativos (sem dados sensíveis) |
| `POST /events` | Evento anônimo: `pageview`, `project_view`, `resume_download`, `theme_change` |
| `POST /contact` | Mensagem por e-mail (Resend), com honeypot e limite de 3/hora |
| `POST /admin/login` · `POST /admin/logout` · `GET /admin/session` | Sessão do painel (cookie HttpOnly, SameSite=Strict) |
| `GET /admin/stats?days=30` · `GET /admin/ops` | Métricas e monitoramento (exigem login) |
| `POST /assistant` | Reservado (retorna 501 `not_implemented`) |

## Como rodar a API localmente

```powershell
copy .env.example .env      # preencha apenas o que for usar; sem Turso a API usa memória
go test ./...
go run ./cmd/server         # http://localhost:8080/api/health
```

O Go **não lê o `.env` sozinho**: defina as variáveis no terminal antes de rodar, por exemplo
`$env:SESSION_SECRET="uma-frase-longa-com-mais-de-32-caracteres"; $env:ADMIN_PASSWORD="minha-senha"`.

## Validação realizada nesta etapa (honestidade)

- ✅ `tsc` (strict) nos módulos de tema e i18n: sem erros.
- ✅ Contraste dos tokens de tema calculado para as 10 combinações (texto, texto secundário, link e botão ≥ 4,5:1 sobre as superfícies; `--muted` não deve ser usado sobre `--soft`).
- ✅ (reconferido na Parte 2A) `go vet ./...` sem avisos e `go test ./...` passando; a API também foi executada localmente e consumida pelo frontend. Sem alterações no backend.
- ⚠️ A integração com Turso (HTTP `/v2/pipeline`) e Resend não foi exercitada contra os serviços reais.

## Validação da Parte 2A (o que foi realmente executado)

- ✅ `npm run build` (script `node scripts/build.mjs`): 29 páginas HTML (3 idiomas × 9 rotas + raiz + 404), `sitemap.xml`, `robots.txt`, `resume/manifest.json`.
- ✅ `tsc --noEmit` (strict) sem erros. ⚠️ No ambiente de validação **não havia `@types/react`** nem rede para instalá-lo; usei um *shim* mínimo, temporário e fora do ZIP. Rode `npm install && npm run typecheck` na sua máquina para conferir contra os tipos reais.
- ⚠️ O build foi validado com esbuild 0.28 e React 19.2 disponíveis no ambiente (o `package.json` pede `^0.25` e `^19`; `npm install` na sua máquina resolve as versões).
- ✅ Navegador real (Chromium/Playwright) contra `preview` com a CSP do `vercel.json`: redirecionamento de `/`, navegação por History API, back/forward, foco no `<main>`, troca de idioma preservando a rota, 5 paletas/modos (persistência e `theme-init.js` antes do React), modo automático seguindo o sistema, `localStorage` bloqueado, 404, `noindex` no admin, ausência de scroll horizontal em 360 px, zero erros de console/CSP.
- ✅ `api.ts` exercitado contra a API Go local (memória): health, ready, info, events (inclui 422), contact (422, 503 `contact_unavailable`, honeypot), admin login/session/stats/ops/logout, 401/422, falha de rede e resposta não-JSON.
- ✅ `--dev` (watch, live reload, proxy `/api`) e `--preview` testados.
- ❌ Não testado: envio real de e-mail (Resend), Turso, deploy na Vercel, Safari/Firefox, leitores de tela.

## Validação da Parte 2B (o que foi realmente executado)

- ✅ `npm run build` e `tsc --noEmit` (strict). ⚠️ Typecheck novamente com *shim* mínimo de `@types/react` (sem rede no ambiente): rode `npm install && npm run typecheck` na sua máquina.
- ✅ Chromium/Playwright contra `npm run dev` (CSP ativa), sem erros/avisos de console: navegação desktop; menu mobile (abrir, Escape devolve o foco, clicar fora e navegar fecham); troca PT/EN/ES mantendo a rota; link "pular"; painel de tema (5 paletas × 3 modos, setas do teclado, Escape, clique fora, persistência após reload); painel dentro da tela em 360 px; sem scroll horizontal em 360/768/1280 px; `prefers-reduced-motion` zera transições.
- ✅ Contraste calculado nas 5 paletas × claro/escuro para os pares usados (texto/fundo, tag, idioma ativo, tag de destaque, categoria, link): mínimo 4,54:1 (Monochrome Stone claro, link sobre superfície) — ≥ 4,5:1 em todos.
- ✅ Smoke de produção (`preview`): 30 URLs (3 idiomas × 10 rotas) com 1 `<h1>` e 6 itens de menu; demonstração ausente do bundle.
- ❌ Não testado: Safari/Firefox, leitores de tela reais, dispositivos físicos.
