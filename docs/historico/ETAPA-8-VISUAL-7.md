# Etapa 8 — Visual 7 (referências Débora e Iago)

## Implementado
1. **Paginação de projetos** (`web/src/pages/Projects.tsx`): `PAGE_SIZE = 3`; botões numerados e setas; `aria-current="page"` na atual; `?page=N` na URL (voltar/avançar do navegador funciona); página inexistente cai na última; buscar ou filtrar volta à página 1; ao trocar de página o foco vai para a lista e a rolagem respeita `prefers-reduced-motion`. A ordem é a dos grupos (Negócios, Acadêmicos, Estudos); cada página mostra os cabeçalhos de grupo que ela contém.
2. **Cartão**: ano (`created`, só quando confirmado) e selo de situação (`status: 'inProgress'`).
3. **Home**: "O que eu construo" com ícones (as 4 áreas que já existiam) e seção "Por que ter presença digital?" com os 7 benefícios pedidos e um exemplo real (capa do EntreLaços). Hover de zoom e elevação só com `prefers-reduced-motion: no-preference`.
4. **Projetos novos**: Tica Artesanato e PM Bem-Casados (grupo Acadêmicos, em desenvolvimento).
5. **Contato**: WhatsApp (wa.me) na página Contato e no rodapé.
6. **Correções**: "Contamac Consultoria Contábil"; h2 oculto na Trajetória (salto h1→h3); stubs do jsdom no teste do formulário.

## Já existia na base (não refeito)
Capas e zoom nos cartões, pop-up do projeto, animações de entrada (`data-reveal`), busca e filtros, paletas, ícones de marca.

## Não feito (por falta de dado ou evidência)
- **Ano** de BarberShop, Banking Analytics, Power BI, Studio Patty Leão, EntreLaços, Estudos em Python, InteliBolsas, Tica e PM: só Segunda Vitrine (2026) está confirmado. Preencher `created: 'AAAA'` em `projects.ts`.
- **Capas** de Tica e PM (aparece o quadro neutro). Adicionar `cover` em `projects.ts` + arquivo 960×436 em `web/public/projects/covers/`.
- **IA aplicada** e **integração de sistemas** em "O que eu construo": sem evidência nos projetos; não incluídos.
