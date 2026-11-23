# Etapa 8 — Visual 10: modal dos projetos (uma rolagem, mais amplo, em blocos de história)

## Layout
- Modal de 42rem → **64rem** (máx.), com 2 colunas ≥ 52em e 1 coluna no celular (folha inferior, como antes).
- **Uma única rolagem vertical**: só o `<dialog>` rola (`overflow-y:auto`). Removidas as rolagens do `.pd-body` e do contêiner flex; o botão fechar ficou fixo (sticky) no topo. Conferido em 9 modais × 2 larguras: nenhum elemento interno com rolagem.
- Capa mais alta (até 40dvh), cabeçalho com título, resumo curto, tipo/status/data e atalho "Ir para os links".

## Narrativa (contexto e problema antes da stack)
Ordem dos blocos: **Contexto** (com o **problema** em destaque) → **Público** → **Solução** → **Minha contribuição** (+ equipe/foto) → **Funcionalidades** → **Tecnologias** → **Resultados** → **Links**. Blocos sem dado não aparecem.

## Dados (sem inventar)
- `problem`, `context`, `solution`, `features`, `participation`, `team`: já existiam.
- **Novo `audience`**: derivado do texto que já estava no site (perfis do BarberShop, "artesã autônoma", "confeiteira autônoma", áreas do InteliBolsas, objetivo da Segunda Vitrine etc.). **Confirme cada frase.**
- **Novo `results`**: só Segunda Vitrine (site publicado, página no LinkedIn — já citados na solução) + "Demonstração publicada online" quando há link de demo. **Nenhuma métrica, usuário ou impacto foi criado.** Para enriquecer, informe resultados reais (uso, feedback, números).
- Os repositórios/READMEs não vieram no ZIP; nada foi lido de lá.

## Arquivos
`components/ExpandableProjectCard.tsx`, `styles/cards.css`, `content/projectDetails.ts`, `i18n/{pt,en,es}.ts` (`projects.modal`).

## Testes
Executados: build, typecheck (com shim de tipos do React), `verify-dist` 2081/2081, `a11y` (360/1280 px), conferência no navegador (rolagens, Esc, PageDown, atalho de links, desktop/mobile). Não executados: `contact.test.mjs` e `projects.test.mjs` (falta `jsdom` aqui), `go test`.
