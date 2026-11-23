# Etapa 5 — Clareza dos textos, contraste e teclado

| Item | Resultado |
|---|---|
| Contraste dos 5 temas × claro/escuro | Auditado: 0 falhas em 10 pares texto/fundo. Agora é verificação automática em `scripts/verify-dist.mjs` (mínimo 4.5:1) |
| Navegação por teclado (Home, Projetos, Contato, Trajetória; 360 e 1280 px) | Skip-link visível, ordem lógica, foco sempre visível. Nos cartões de projeto o contorno é desenhado no cartão inteiro (`:has(.project-card__link:focus-visible)`), de propósito |
| Linguagem para leigos | Os 4 cartões de "Áreas de atuação" ganharam uma frase simples antes dos termos técnicos (SQL, DAX, APIs…), em pt/en/es. Nenhum fato novo foi acrescentado |
| Node | `engines.node` = `22.x` (antes `>=20`, que fazia a Vercel usar Node 26) |

Não alterado: data de conclusão da FATEC (pendente de confirmação do Max); hero "com rigor de processo" (identidade; decisão do Max).
