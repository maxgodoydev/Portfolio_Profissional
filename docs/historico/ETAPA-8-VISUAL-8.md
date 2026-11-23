# Etapa 8 — Revisão de datas e capa do Banking Analytics

## Datas dos projetos

As datas foram preenchidas com base nas informações confirmadas pelo responsável pelo portfólio:

- BarberShop do Gui: fevereiro de 2025 (projeto atualizado posteriormente).
- InteliBolsas: setembro de 2025 (ainda sem atualização posterior registrada).
- Studio Patty Leão: março de 2026.
- Banking Analytics, Portfólio de Power BI, EntreLaços, Estudos em Python, Tica Artesanato e PM Bem-Casados: 2026; mês não informado.
- Segunda Vitrine: novembro de 2026, conforme o cadastro que já existia.

Quando somente o ano foi informado, o cadastro usa `AAAA`, sem inventar mês. A formatação de datas já aceita ano isolado e exibe apenas o ano nesse caso.

## Capa do Banking Analytics

Foi criada e adicionada a capa `web/public/projects/covers/banking-analytics.webp`, no formato 960 × 436, e associada ao projeto no cadastro `web/src/content/projects.ts`.

## Validação

- Conferência estática do cadastro: os dez projetos possuem ano/data preenchidos.
- Conferência do arquivo da capa: WebP, 960 × 436.
- Não foi possível concluir `npm ci` neste ambiente por timeout na instalação de dependências. Portanto, typecheck, build e testes automatizados precisam ser executados localmente antes do deploy.
