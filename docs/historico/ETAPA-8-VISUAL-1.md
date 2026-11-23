# ETAPA 8 — Evolução visual, parte 1

Escopo pequeno e testável, seguindo a diretriz visual (prioridade: usabilidade → identidade → feedback → motion → decoração).

## Diagnóstico (a partir de capturas reais do site)
- Hero genérico (título, texto, dois botões) e seção "Resumo rápido" separada, repetindo cartões iguais.
- Tecnologias sem nenhuma identificação visual; a seção "Tecnologias" da Home era só texto.
- Cartões de destaque com alturas diferentes; seção "Em desenvolvimento" repetia o selo do título; selo quebrando de linha.
- Sem estados de botão além do hover; links sem pistas de movimento; footer sem composição; fundo liso; sem entrada de conteúdo.

## Implementado
1. **Logos de marca** (`components/BrandIcon.tsx`, `brandIcons.ts` gerado por `scripts/gen-brand-icons.mjs`): Simple Icons (CC0) e Font Awesome Free (CC BY 4.0, só Java e LinkedIn). Monocromáticos (`currentColor`), acompanham os 5 temas. Usados em Tecnologias, tags dos projetos, faixa de tecnologias da Home e footer. **Sem logo disponível (não inventados):** Power BI, DAX, Power Query, Excel, SQL, Matplotlib → glifo neutro tracejado + nota na legenda.
2. **Hero**: duas colunas; "Resumo rápido" virou painel com ícones (formação com 12/2028, experiência, foco). Home sem seção duplicada.
3. **Fundo** (`.ambient`): luz radial + grade tênue, CSS puro, deriva lenta (42 s) só com movimento permitido. Intensidade 12% para manter contraste ≥ 4,5:1 em 5 temas × claro/escuro.
4. **Microinterações**: botões (hover/active/disabled/loading com spinner no envio do contato), setas que deslizam em links e CTAs, cartões de projeto com altura igual; hover só em `(hover: hover)`, com `:active` para toque.
5. **Entrada ao rolar** (`lib/reveal.ts`, `data-reveal`): fade + 16 px, stagger nos grids; só com `IntersectionObserver` e sem `prefers-reduced-motion`; sem isso tudo fica visível.
6. **Footer**: faixa de destaque, GitHub / LinkedIn / e-mail com ícones.
7. `Timeline`, rotas, i18n (nova chave `technologies.noLogoNote` nos 3 idiomas) e backend: sem outras mudanças.

## Backlog visual (próximas partes, por prioridade)
1. Busca/filtros de Projetos: chips ativos, contagem animada, destaque do termo, estado vazio ilustrado.
2. Cartões de projeto expansíveis (acordeão acessível) e imagem de capa na lista.
3. Trajetória: marcador de rolagem/progresso e agrupamento por ano.
4. Transição entre páginas (View Transitions API com fallback) e indicador de seção ativa.
5. Menu mobile com animação e item atual destacado; tooltips nos logos.
6. Logos oficiais de Power BI/Excel (baixar dos kits oficiais da Microsoft) e revisão de marcas "2026" quando houver rede.
7. Tilt/parallax sutil (opcional, só ponteiro fino) e hero com ilustração própria.
