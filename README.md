# Portfólio - Max Godoy

Portfólio profissional com foco em **Dados, Business Intelligence, IA aplicada, automação e desenvolvimento de software**.

## Destaques da versão

- tema claro como padrão e alternância para modo escuro;
- tecnologias com ícones visuais, incluindo Power BI e IA aplicada;
- projetos com filtros, ações específicas e detalhes progressivos;
- dashboards reais de Power BI e arquivos `.pbix` disponíveis para download;
- EntreLaços com acesso à vitrine publicada;
- BASE LAB com identidade visual e acesso ao Discord;
- contato direto por e-mail, LinkedIn, GitHub e Discord, sem banco de dados;
- animações de fundo discretas e suporte a `prefers-reduced-motion`;
- currículo profissional em uma página.

## Rodar no VS Code

```powershell
py app.py
```

Depois acesse:

```text
http://127.0.0.1:8000
```

Também funciona com a extensão **Live Server**, abrindo o arquivo `index.html`.

## Publicar na Vercel

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta.
3. Importe o repositório na Vercel.
4. Use **Other** como framework e não informe comando de build.
5. O diretório de saída deve permanecer como a raiz do projeto.

O site é estático. O arquivo `app.py` existe apenas como servidor local opcional.

## Estrutura principal

```text
index.html
static/
  css/main.css
  js/main.js
  assets/
data/profile.json
curriculo-max-godoy.pdf
vercel.json
```
