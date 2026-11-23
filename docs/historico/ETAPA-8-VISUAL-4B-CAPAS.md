# ETAPA 8 — Evolução visual, parte 4B: capas dos cartões de projeto

Complemento da parte 4. Com os prints reais enviados pelo autor, a avaliação de "imagem de capa" (deixada em aberto na parte 4) foi concluída. Escopo: só a lista da página **Projetos**; Home, página de detalhe e demais seções não mudaram.

## Imagens usadas (todas fornecidas pelo autor; nada foi criado ou desenhado)
| Projeto | Origem da capa |
|---|---|
| BarberShop do Gui | Print da página inicial do site |
| Portfólio de Power BI | Banner do README do portfólio (recortado só no banner) |
| Studio Patty Leão | Print da página inicial do site |
| EntreLaços | Print da vitrine |
| Estudos em Python | Banner do README do Python Lab (recortado só no banner) |
| InteliBolsas | Print da página inicial (execução local) |
| Segunda Vitrine | Print da página "Sobre" com o logo da iniciativa (a selfie da equipe continua no painel expandido) |
| Banking Analytics | **Sem imagem fornecida** → quadro neutro (ícone de gráfico sobre listras, decorativo, `aria-hidden`) |

Não usado: o print da página "Empresas" da Segunda Vitrine, por conter foto de banco de imagens de uma pessoa (o próprio README a trata como ilustrativa).

## Implementado
1. **Capa no topo do cartão** (`.project-card__cover`, proporção 960×436, `object-fit: cover`, `loading="lazy"`, `width`/`height` reservados). Arquivos em `web/public/projects/covers/<slug>.webp` (23–66 KB cada; originais de até 2,6 MB). Recortes escolhidos à mão para não cortar títulos e logos.
2. **Dados**: novo campo opcional `cover` em `content/projects.ts` (src, tamanho, `alt` em pt/en/es). O campo `image` (foto da página de detalhe) não mudou.
3. **Hover** (só `(hover: hover)` e `.motion-ok`): zoom sutil de 4% na capa. Sem hover/touch e com movimento reduzido, nada se move.
4. **Sem versão online**: projetos sem `demo` e sem `site` (Banking Analytics, Portfólio de Power BI, Estudos em Python, InteliBolsas) mostram no painel expandido "Sem versão online. O código está no GitHub." (3 idiomas, chave `projects.noDeploy`) e não exibem botão de demonstração. Projetos com deploy não mudaram.

## Validação feita
- Build ok (53 páginas); `verify-dist` 1433/1433; `test:web` 26/26; `a11y-check` ok (360 e 1280 px).
- Chromium real: 7 capas carregam, 1 quadro neutro, nota de deploy só nos sem versão online (BarberShop mantém "Ver demonstração"), mobile 375 px em tema escuro sem rolagem horizontal, teclado/Esc/toque da parte 4 intactos, sem erros nem requisições falhas.

## Não validado
- `typecheck` e `contact.test.mjs` (sem `@types/react`/`jsdom`; rode `npm install && npm test`). Backend Go, Vercel e aparelho físico: não testados.

## Pendências de conteúdo (não alteradas; dependem do autor)
- Banking Analytics: enviar um print (ex.: `resultados/grafico_valor_mensal.png` do repositório) para trocar o quadro neutro.
- URL do repositório do Studio Patty Leão: o README colado cita `maxgodoydev-dotcom/studio-patty-leao`, e o site usa `maxgodoydev/Studio_Patty_Leao`. Confirmar qual está correto.
- Tecnologias possivelmente desatualizadas em relação aos READMEs: EntreLaços (README cita Python, GitHub Actions e Vercel; o cartão lista HTML, CSS, JavaScript, JSON) e Segunda Vitrine (README cita HTML, CSS, JavaScript, Supabase, PostgreSQL; o cartão não lista nenhuma).

## Backlog visual restante (por prioridade)
3. **(próxima)** Trajetória: marcador de rolagem/progresso e agrupamento por ano.
4. Transição entre páginas (View Transitions API com fallback) e indicador de seção ativa.
6. Logos oficiais de Power BI e Power Query (SVGs já enviados; falta Excel) e revisão de marcas 2026.
7. Tilt/parallax sutil (opcional) e hero com ilustração própria.
