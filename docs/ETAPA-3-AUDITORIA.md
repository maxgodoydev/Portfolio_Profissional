# Etapa 3 — Auditoria final (2026-11-19)

## Evidências (executadas em ambiente Linux, sem rede)
| Verificação | Resultado |
|---|---|
| `go vet`, `gofmt -l` | limpos |
| `go test -count=1 ./...` e `-race ./internal/...` | passam (cobertura: server 82%, store 38% — o cliente Turso não é testado sem rede; config sem testes) |
| `tests/admin.test.mjs` | 12/12 |
| Build + `verify-dist` | 50 páginas, 1118/1118 verificações |
| `scripts/e2e-admin.mjs` (Chromium + API Go real) | 18/18 |
| Typecheck | só com shim de tipos do React; **rode `npm test` no seu PC** |
| `tests/analytics` e `tests/contact` (jsdom) | **não executados** (sem jsdom no ambiente) |
| Teste manual do responsável (Windows) | login, Visão geral, Analytics e Monitoramento aprovados |

## Auditoria
- Rotas `/admin/session|stats|ops` exigem cookie assinado (401), `admin_disabled` → 503; cookie `HttpOnly`, `SameSite=Strict`, `Secure` em HTTPS, `Path=/api`, 8 h; HMAC-SHA256 com comparação em tempo constante; senha comparada em tempo constante; respostas da API com `Cache-Control: no-store`; CORS só para a própria origem/`ALLOWED_ORIGINS`.
- Painel sem dados simulados (nenhum `Math.random`, nenhum número fixo); monitoramento mostra apenas o que `/health`, `/ready`, `/info` e `/admin/ops` devolvem; o que não é verificável aparece como "Não verificado".
- `/admin` é `noindex`, fora do sitemap e bloqueado no `robots.txt`; CSP sem scripts inline.

## Problema encontrado e corrigido
**Limite de login contornável com cabeçalhos de IP forjados** (`X-Forwarded-For`/`X-Real-IP`): comprovado com 8 tentativas erradas seguidas, todas 401, sem bloqueio. Correção: limite **global** de 30 tentativas/15 min (`globalLoginMax`), independente do IP, com teste. Trade-off: alguém pode bloquear o login por até 15 min (aceitável em painel pessoal). Na Vercel os cabeçalhos de IP são definidos pela plataforma, então o risco real lá é menor, mas não verificado aqui.

## Pendências
**A. Obrigatórias para concluir a Etapa 3:** nenhuma encontrada. Pendência de evidência: rodar `npm install && npm test` no seu computador (jsdom + typecheck real).

**B. Antes de publicar em produção**
1. Turso: `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (sem isso os dados são em memória, variam por instância serverless e o limite de login é por instância).
2. `SESSION_SECRET` (≥ 32 caracteres aleatórios) e `ADMIN_PASSWORD_SHA256` (preferível) ou `ADMIN_PASSWORD`. O hash é SHA-256 sem sal: use senha longa (≥ 16 caracteres, única).
3. `APP_ENV=production`, `SITE_URL` real; `ALLOWED_ORIGINS` só se usar outro domínio.
4. E-mail: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (domínio verificado). Enquanto ausente, o formulário responde 503 e o painel mostra "Indisponível" — comportamento correto.
5. Currículos em PDF (`web/public/resume/curriculo-max-godoy-{pt,en,es}.pdf`) — o build avisa que estão ausentes.
6. Primeiro deploy: validar em `/pt/admin` → Monitoramento (banco `turso`, persistência Operacional) e que `/api/admin/stats` sem login retorna 401.
7. Sessão é sem estado: "Sair" apaga o cookie, mas um cookie copiado vale até expirar (8 h). Para revogar tudo, troque `SESSION_SECRET`.

**C. Melhorias futuras:** revogação de sessão no servidor; hash de senha com custo (bcrypt/argon2); testes automatizados de responsividade no CI (hoje só no e2e local); testes do cliente Turso com banco de teste; agregação de métricas no servidor (hoje `EventsSince` lê eventos do período); alertas externos de uptime.
