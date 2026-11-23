# ETAPA 8 — Parte 5: finalização e auditoria (audience, cores, logos, testes, acessibilidade)

Complementa `ETAPA-8-VISUAL-4C.md` (não a repete).

## 1. Campo `audience` (conteúdo)
- `ExpandableProjectCard.tsx`: cada seção do pop-up só aparece com texto real (`trim()`; listas filtram itens vazios). "Problema" e "Contexto" agora são seções separadas (antes, com os dois preenchidos, só um aparecia). Ordem: Problema → Para quem → Contexto → Como funciona → Participação → Tecnologias.
- `pages/ProjectDetail.tsx`: a página completa também exibe "Para quem" (guardado por `trim()`).
- Verificado no navegador: 8 pop-ups, 0 seções vazias, 0 "Para quem" exibidos (nenhum projeto tem o campo preenchido, de propósito).

### Informações que faltam por projeto (nada foi inventado)
Hoje NENHUM projeto tem `problem` nem `audience`. O que os textos atuais já permitem afirmar sobre o problema está na coluna 2 (é só o que o próprio arquivo diz, para você confirmar/reescrever).

| Projeto | O que os textos atuais dizem | Público-alvo a confirmar | O que preciso de você |
|---|---|---|---|
| BarberShop do Gui | Sistema real para barbearia (Zona Sul de SP): agendamentos, gestão, BI | Há perfis de proprietário, recepção e profissional; confirmar se esses são os usuários e quantos usam | Que dor da barbearia o sistema resolve (ex.: como era o agendamento antes), quem usa no dia a dia, se está em produção |
| Banking Analytics | Perguntas de negócio em SQL sobre dados sintéticos | Não informado | Quem é o leitor/usuário imaginado (analista? recrutador? estudo próprio?) e qual pergunta ele responde |
| Portfólio de Power BI | Dashboards operacionais para apoiar decisão | Não informado | Que decisões/áreas os dashboards atendem e para quem foram feitos |
| Studio Patty Leão | ERP simplificado para um salão | O salão (dona/equipe?) | Quem opera o sistema, que problema resolve (planilha? caderno?) e se está em uso |
| EntreLaços | Catálogo digital responsivo, filtros, WhatsApp | Clientes do negócio e/ou dona? | Qual é o negócio, quem navega o catálogo, o que resolvia |
| Estudos em Python | Material de estudo (não experiência profissional) | Você mesmo / quem lê o repositório | Provavelmente "Para quem" não se aplica; confirmar se a seção deve ficar omitida |
| InteliBolsas | CRUD com áreas do aluno, da instituição e administração | Alunos, instituições e administradores (inferência, NÃO confirmada) | Confirmar o público e qual problema do acesso a bolsas o projeto atacava |
| Segunda Vitrine | "Conectar talentos estudantis ao mercado" via soluções para empresas e negócios reais | Empresas/negócios e estudantes (o texto cita os dois) | Confirmar qual é o público principal do site e quantos negócios/projetos já atendeu |

Para preencher: em `web/src/content/projectDetails.ts`, adicione `problem:` e `audience:` nos três idiomas do projeto. A seção aparece sozinha.

## 2. Cores das marcas (`brandColors.ts`)
Metodologia: fonte oficial do projeto/empresa quando existe; caso contrário, o valor atual é mantido e marcado como não confirmado. Os valores foram colocados no arquivo na etapa 4C a partir de memória do catálogo Simple Icons, SEM verificação — portanto, só os confirmados abaixo devem ser tratados como verificados.

| Marca | HEX no arquivo | Status | Fonte / observação |
|---|---|---|---|
| NumPy | `#4DABCF` (era `#013243`) | **Corrigido/confirmado** | Diretrizes de logo do repositório oficial numpy/numpy.org: versão colorida = "Maximum Blue" `#4DABCF` + "Han Blue" `#4D77CF`; versão escura = "Warm Black" `#013243`. Usei `#4DABCF` por ser cor oficial legível em tema claro e escuro; o logo completo tem duas cores (`#4D77CF` não é representada em ícone de cor única). |
| PHP | `#777BB4` | Conferido em fonte secundária | Espelho do catálogo Simple Icons (allsvgicons.com). Não é fonte oficial. |
| Pandas | `#150458` | Conferido em fonte secundária | Idem. Cor escura: já usa o azulejo claro no tema escuro. |
| Render | `#46E3B7` | **NÃO confirmado — pendência** | Não encontrei brand guidelines oficiais da Render. O site de marketing usa violeta, mas só vi isso em fonte de terceiros. Manter com cautela; se preferir, troque por neutro até confirmar em render.com. |
| LinkedIn | `#0A66C2` | Não confirmado | O catálogo Simple Icons removeu a marca (agregadores mantêm a última cor publicada); conferir no guia de marca do LinkedIn. |
| Demais (Python, JavaScript, TypeScript, React, Go, Node.js, MySQL, MongoDB, PostgreSQL, SQLite, Git, GitHub, Vercel, HTML, CSS, Express, Spring Boot, C, C++, Supabase, Maven, Pytest, JSON, Java, Java 21) | inalterados | Não confirmados nesta auditoria | Sem acesso à rede no ambiente de execução. Use `npm i --no-save simple-icons && node scripts/check-brand-colors.mjs` (novo) para comparar com o catálogo e confirme nas páginas de marca de cada projeto. |

Observações: Java usa laranja `#ED8B00` (tom do ícone do catálogo; a marca Java/Oracle tem mais de uma versão); HTML e CSS usam as cores dos escudos HTML5/CSS3 do W3C/catálogo; JSON e Express são pretos e, por isso, ficam sobre o azulejo claro.

## 3. Logos oficiais
Repositório `microsoft/PowerBI-Icons` (consultado): **arquivado em 29/10/2024** (somente leitura); a própria Microsoft aponta os ícones do Fabric na documentação para versões novas. Licença: **CC BY 4.0** (exige atribuição) para os ícones e MIT para código; o aviso legal diz que a licença **não concede direitos sobre nomes, logos ou marcas da Microsoft**.
- Disponíveis: `SVG/Power-BI.svg`, `SVG/Power-Query-Colored.svg` (Power Query), `SVG/Excel-Workbook.svg` (ícone de pasta de trabalho do Excel).
- **Arquivos recebidos do usuário nesta revisão:** `Power-BI.svg`, `Power-Query-Colored.svg` e `microsoft-excel-logo.svg`.
- Power BI e Power Query foram integrados como SVGs multicoloridos. O Excel também foi integrado a partir do arquivo enviado; sua origem/licença específica não foi confirmada e deve ser verificada antes da publicação.
- `scripts/gen-ms-icons.mjs` gera `web/src/components/brandImages.ts` com data URIs e remove metadados/DOCTYPE desnecessários, rejeitando scripts, handlers e referências externas. O arquivo Excel enviado foi renomeado para `Excel-Workbook.svg` apenas na pasta temporária usada para executar o gerador.
- A página Tecnologias agora apresenta atribuição para Power BI e Power Query: Microsoft, CC BY 4.0, repositório `microsoft/PowerBI-Icons`. A atribuição não transfere direitos sobre marcas. O ícone Excel permanece com origem/licença pendente de confirmação.
- **Decisão sua**: aceitar o uso dos nomes/logos Microsoft só para identificar a tecnologia usada.
- DAX: não existe logo (é linguagem de fórmulas). SQL: não existe logo próprio da linguagem (o do SQL Server é outra marca). Ambos ficam sem ícone, sem representação inventada. Matplotlib: o projeto tem um ícone "oficial" no repositório (PR #15889 menciona), mas a licença/uso não foi confirmada; pendente.
- Tamanho/alinhamento/contraste/mobile: logos existentes verificados no navegador (azulejo claro para marcas escuras; 0 alvos < 24 px; sem overflow em 360/390/820/1024/1280 px). Os 3 logos Microsoft só poderão ser avaliados visualmente depois de gerados.

## 4. Testes executados (resultados reais)
| Verificação | Resultado |
|---|---|
| `node scripts/build.mjs` | ok, 53 páginas |
| `verify-dist` | 1461/1461 |
| `node --test tests/*.test.mjs` | 26 de 27 passam; `contact.test.mjs` não roda: pacote `jsdom` ausente neste ambiente (não é falha de código; rode `npm install && npm test`) |
| `tsc --noEmit` | Não conclusivo: sem `@types/react` aqui; nos arquivos alterados não apareceu erro além dos causados por tipos ausentes. Rode `npm run typecheck` |
| `a11y-check` (15 rotas × 360 e 1280 px) | Primeira execução FALHOU (ver abaixo); após correções: todas ok |
| Auditoria manual no Chromium (Playwright) | ver abaixo |

### Falhas encontradas e corrigidas
1. Título do cartão com alvo de 22 px (< 24 px, WCAG 2.5.8) em /projects → `min-height` e `line-height` (cards.css).
2. `/es/` com rolagem horizontal em 360 px: tooltip (`.tip`) das tecnologias estendia a página → quebra de linha, largura máxima e `overflow-x: clip` em html/body.
3. Região rolável do pop-up sem nome/foco → `tabindex=0`, `role=region`, `aria-labelledby`.

### Acessibilidade (verificado de fato)
- Teclado: Tab chega ao título do cartão, Enter abre o pop-up, foco vai para dentro, ciclo Fechar → demonstração → GitHub → página completa → conteúdo; o fundo fica inerte (foco passa pelo navegador e volta ao pop-up); Esc fecha e devolve o foco ao título; foco visível (contorno de 3 px) no cartão e no corpo do pop-up.
- ARIA/semântica: `<dialog>` modal com `aria-labelledby`, `aria-haspopup="dialog"` e `aria-expanded` no gatilho, links externos com aviso de nova aba, resultados da busca em `role=status`.
- Contraste: texto do pop-up ≥ 5,09:1 nas 10 combinações tema × modo (mínimo exigido 4,5:1). Brilho neon é decorativo.
- Movimento reduzido: animação do pop-up = nenhuma com `prefers-reduced-motion`.
- Busca/filtros: "python" → 2 projetos (anunciado "2 de 8 projetos"); termo sem resultado → estado vazio.
- **Não validado**: leitor de tela real (NVDA/JAWS/VoiceOver/TalkBack) — NÃO declaro compatibilidade; nenhum teste em aparelho físico; Safari/Firefox; zoom 200 %.

### Responsividade (Chromium emulado, não aparelho real)
| Largura | Colunas | Overflow | Pop-up cabe na tela | Links no topo visíveis | Alvos < 24 px |
|---|---|---|---|---|---|
| 360 | 1 | não | sim | sim | 0 |
| 390 | 1 | não | sim | sim | 0 |
| 820 (tablet) | 2 | não | sim | sim | 0 |
| 1024 | 3 | não | sim | sim | 0 |
| 1280 | 4 | não | sim | sim | 0 |

## 5. Arquivos
Modificados: `web/src/components/{ExpandableProjectCard.tsx,BrandIcon.tsx,brandColors.ts}`, `web/src/pages/ProjectDetail.tsx`, `web/src/styles/cards.css`.
Novos: `web/src/components/brandImages.ts`, `scripts/gen-ms-icons.mjs`, `scripts/check-brand-colors.mjs`, `docs/historico/ETAPA-8-VISUAL-5.md`.
(As mudanças da etapa 4C — cartões compactos, pop-up, neon, ícones do menu, i18n — estão descritas em `ETAPA-8-VISUAL-4C.md`.)

## 6. Pendências que dependem de você
Conteúdo `problem`/`audience` (tabela acima) · confirmar Render e LinkedIn e, se quiser, rodar `check-brand-colors.mjs` · rodar `gen-ms-icons.mjs` e decidir sobre as marcas Microsoft · licença do ícone do Matplotlib · `npm install && npm test` · testar em leitor de tela e aparelhos reais.


## 7. Revisão complementar (23/11/2026)
- `ProjectDetail.tsx`: padronizada a validação de `context`, `problem`, `audience` e `solution` com `trim()`. Listas de `features` e `participation` agora descartam itens vazios ou compostos apenas por espaços.
- `brandColors.ts`: Render atualizado de `#46E3B7` para `#000000`, valor atualmente exibido pelo catálogo Simple Icons. **Isso é uma referência do catálogo, não uma confirmação de HEX oficial da Render.** LinkedIn permanece como cor de referência não confirmada por guideline oficial.
- NumPy permanece em `#4DABCF`, cor oficial do conjunto colorido; o guia oficial também especifica `#4D77CF` como a segunda cor do logotipo.
- Dependências: `jsdom` já consta em `package.json` e `package-lock.json`; a mensagem anterior sobre ausência se refere ao ambiente em que os testes foram executados, não à declaração do projeto. Reinstalar com `npm ci` antes de rodar os testes.
- Playwright não consta nas dependências declaradas. O script `a11y-check.mjs` agora apresenta instrução explícita caso a dependência esteja ausente. Para executar a auditoria, instalar `playwright` e o Chromium conforme a mensagem do script. A dependência ainda não foi adicionada ao lockfile.
- Logos: Power BI, Power Query e Excel agora estão embutidos em `brandImages.ts`. Os dois primeiros vieram da coleção Microsoft `PowerBI-Icons`; a origem/licença do SVG de Excel enviado pelo usuário ainda precisa ser confirmada. O gerador remove DOCTYPE/metadados de exportação e rejeita scripts, eventos e referências externas.
- Renderização: `BrandIcon.tsx` usa `object-fit: contain` para preservar proporções dos SVGs em tamanhos quadrados.
- Atribuição: a página Tecnologias exibe a licença CC BY 4.0 e a origem Microsoft para Power BI e Power Query; a licença do arquivo Excel permanece explicitamente pendente.
- Testes nesta revisão: `npm test` não passou da etapa `typecheck` porque a instalação de dependências disponível estava incompleta (React e seus tipos não foram resolvidos). `npm run test:web` também falhou porque o pacote `esbuild` não pôde ser resolvido. Portanto, build, typecheck e suíte completa continuam sem certificação nesta revisão.

## 8. Integração dos SVGs fornecidos (23/11/2026)
- `brandImages.ts` contém agora os três SVGs fornecidos nesta conversa, após validação XML e remoção de DTD/metadados não necessários. Os arquivos-fonte sanitizados foram preservados em `assets/brand-logos/`.
- `BrandIcon.tsx` preserva a proporção com `object-fit: contain`.
- `Technologies.tsx` e os dicionários `pt.ts`, `en.ts`, `es.ts` exibem a atribuição dos ícones Microsoft e informam que a licença do SVG de Excel precisa ser confirmada.
- `gen-ms-icons.mjs` foi reforçado para sanitizar DTD/metadados e bloquear scripts, handlers e referências externas.
- Não foi possível certificar `npm test`: a instalação local de dependências neste ambiente está incompleta; `typecheck` não resolveu React e `test:web` não resolveu esbuild.
