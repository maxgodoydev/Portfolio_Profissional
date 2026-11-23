# Portfólio de Max Godoy

> **Evolução visual — parte 1 (Etapa 8):** logos de marca (Simple Icons/Font Awesome), hero com painel, fundo ambiente, microinterações e entrada ao rolar. Detalhes e backlog em `docs/historico/ETAPA-8-VISUAL-1.md`. Atribuição: logos de Simple Icons (CC0) e Font Awesome Free Brands (CC BY 4.0, Java e LinkedIn); marcas pertencem aos titulares.

Portfólio profissional de Max Godoy, estudante de Desenvolvimento de Software Multiplataforma na FATEC Zona Sul, com foco em Dados & Analytics, Business Intelligence, desenvolvimento de software e automação de processos.

**Site:** https://max-godoy-portfolio.vercel.app/pt/ · **Idiomas:** português, inglês e espanhol

## O que é

Um site feito para qualquer visitante: recrutadores, empresas, estudantes ou quem só encontrou o link. Linguagem simples, navegação direta, 5 temas (claro, escuro ou automático), acessível por teclado e responsivo.

Páginas: Início, Sobre, Projetos (com busca, filtros e página de cada projeto), Tecnologias, Trajetória, Contato, Currículo e Privacidade. Há também um painel administrativo privado (`/admin`) com métricas anônimas de acesso e monitoramento.

## Tecnologias

| Parte | Escolha |
|---|---|
| Frontend | React 19 + TypeScript, build próprio com esbuild (páginas geradas no build), roteador próprio, i18n pt/en/es |
| Backend | Go 1.22 só com a biblioteca padrão, rodando como função serverless da Vercel |
| Dados | Turso (libSQL, via HTTP) ou memória em desenvolvimento |
| E-mail | Resend (formulário de contato) |
| Hospedagem | Vercel, com deploy automático a partir da branch `main` |

## Estrutura

```
api/index.go         função serverless Go (toda a API)
cmd/server/          a mesma API para rodar localmente
backend/             config, server (rotas, admin, contato) e store (Turso/memória)
web/src/             pages, components, content, i18n, theme, admin, services, styles
web/public/          imagens, ícones e currículos em PDF
scripts/             build, verificação do build, auditoria de acessibilidade, e2e do admin
tests/               testes do frontend (node --test)
docs/                API.md, DEPLOY.md e historico/ (etapas anteriores)
legacy-v1/           site antigo, preservado e ignorado no deploy (.vercelignore)
```

> A pasta do backend chama-se `backend/` (e não `internal/`) porque a Vercel não permite que `api/` importe pacotes `internal/`.

## Como rodar

Requisitos: Node 22, Go 1.22+.

```powershell
npm install
npm test            # typecheck, testes, build, verificação do build e testes Go
npm run dev         # site em http://localhost:3000 (com recarga automática)
go run ./cmd/server # API em http://localhost:8080/api/health (outro terminal)
npm run preview     # build de produção em http://localhost:4173
```

Sem variáveis de ambiente o site e a API funcionam (dados em memória, contato e admin desativados). Para ativar o resto, veja [`docs/DEPLOY.md`](docs/DEPLOY.md) e `.env.example`. O Go **não lê o `.env` sozinho**: defina as variáveis no terminal (`$env:NOME="valor"`).

## Verificações disponíveis

| Comando | O que faz |
|---|---|
| `npm test` | Tudo em sequência: tipos, testes web, build, `verify-dist` (estrutura, SEO, segurança e contraste AA dos 5 temas), testes Go |
| `npm run a11y` | Auditoria de acessibilidade em 11 rotas, 360 e 1280 px (precisa de Playwright e do `npm run preview` rodando) |
| `npm run e2e:admin` | Teste ponta a ponta do painel contra a API real (precisa de Playwright) |
| `go test ./... -cover` | Testes do backend (inclui o cliente Turso contra um servidor falso) |

## Currículos

O build lê `web/public/resume/curriculo-max-godoy-{pt,en,es}.pdf`. Idiomas sem PDF mostram "Em breve".

## Documentação

- [`docs/API.md`](docs/API.md): rotas, formatos, erros e limites
- [`docs/DEPLOY.md`](docs/DEPLOY.md): publicar e configurar variáveis na Vercel, passo a passo
- [`docs/historico/`](docs/historico/): relatórios e auditorias das etapas anteriores

## Privacidade

As métricas são anônimas: sem cookies de rastreamento, sem IP, sem user agent armazenados; respeitam Do Not Track e Global Privacy Control. Detalhes na página de Privacidade do site.
