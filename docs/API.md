# API

Prefixo `/api`. Todas as respostas têm `Cache-Control: no-store`.

## Formato

Sucesso: `{ "ok": true, "data": { ... } }`
Erro: `{ "ok": false, "error": { "code": "...", "message": "...", "details": ... }, "requestId": "..." }`

## Rotas

| Método e rota | Acesso | Descrição |
|---|---|---|
| `GET /health` | público | Disponibilidade |
| `GET /ready` | público | Verifica o banco (503 se falhar) |
| `GET /info` | público | Versão, ambiente, uptime e recursos ativos (sem dados sensíveis) |
| `POST /events` | público | Evento anônimo de uso |
| `POST /contact` | público | Envia mensagem por e-mail (Resend) |
| `POST /admin/login` | público | Abre a sessão do painel |
| `POST /admin/logout` | público | Encerra a sessão |
| `GET /admin/session` | cookie | Indica se a sessão é válida |
| `GET /admin/stats?days=N` | cookie | Métricas agregadas; `N` de 1 a 365 (padrão 30) |
| `GET /admin/ops` | cookie | Monitoramento: serviços, contadores e últimos erros |
| `POST /assistant` | — | Reservado; responde 501 `not_implemented` (recurso desativado) |

## Corpos de requisição

**`POST /events`**: `{ "type", "path", "target", "lang", "theme", "referrer" }`. Tipos: `pageview`, `project_view`, `resume_download`, `theme_change`. `referrer` aceita só o domínio. Eventos de Do Not Track/GPC e de robôs são ignorados; duplicados são descartados. Nenhum IP nem user agent é gravado. Limite: 120 por minuto por origem.

**`POST /contact`**: `{ "name", "email", "message", "lang", "website" }`. `website` é uma armadilha para robôs (deve ficar vazio). Limite: 3 por hora por origem.

**`POST /admin/login`**: `{ "password" }`. Cookie `admin_session`: HttpOnly, SameSite=Strict, Secure em HTTPS, `Path=/api`, 8 horas.

## Códigos de erro

| Código | Quando |
|---|---|
| `validation_error` | Campo inválido (inclui `days` fora de 1..365) |
| `invalid_body` | JSON inválido ou grande demais |
| `invalid_credentials` | Senha incorreta |
| `unauthorized` | Sem sessão válida |
| `admin_disabled` | Painel não configurado (503) |
| `contact_unavailable` | Resend não configurado (503) |
| `email_failed` | O provedor de e-mail recusou o envio |
| `rate_limited` | Limite de requisições (429) |
| `origin_not_allowed` | Origem não permitida por CORS |
| `store_unavailable` | Banco indisponível |
| `not_found` / `method_not_allowed` / `not_implemented` / `internal_error` | Usos óbvios |

## Limites de login

5 tentativas por 15 minutos por origem, mais um limite global de 30 por 15 minutos (impede contornar o limite forjando cabeçalhos). Consequência aceita: um ataque pode bloquear o login por até 15 minutos. A senha errada demora 400 ms para responder.

## CORS

Mesma origem sempre permitida; outras apenas se listadas em `ALLOWED_ORIGINS`.
