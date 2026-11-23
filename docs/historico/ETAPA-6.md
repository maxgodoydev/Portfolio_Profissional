# Etapa 6 — Documentação profissional e testes de backend

- README reescrito como documento único e profissional; o diário antigo foi preservado em `docs/historico/README-diario-etapas-1-a-5.md`.
- Novos: `docs/API.md` (rotas, corpos, erros, limites) e `docs/DEPLOY.md` (aplicar atualização no Windows, variáveis da Vercel passo a passo, conferência pós-deploy).
- Relatórios das etapas 3, 4 e 5 movidos para `docs/historico/`.
- Novos testes Go: `backend/config/config_test.go` (cobertura 96,6%) e `backend/store/turso_test.go` (cliente Turso contra servidor HTTPS falso; cobertura do pacote store: 38% → 82,7%). Validados por mutação: defeitos introduzidos de propósito fizeram os testes falharem.
- Nenhuma mudança visual nem de comportamento do site ou da API.
