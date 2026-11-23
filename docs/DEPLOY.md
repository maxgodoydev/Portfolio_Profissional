# Publicação e configuração (Vercel)

O deploy é automático: cada `git push` na branch `main` do GitHub publica o site na Vercel. Não é preciso mexer no projeto da Vercel para publicar código novo.

## Aplicar uma atualização (PowerShell)

1. Extraia o ZIP em uma **pasta vazia** (os arquivos ficam direto na raiz).
2. Copie para o repositório, **sem apagar nada** (`/E`, nunca `/MIR`):
   ```powershell
   robocopy "C:\caminho\da\pasta-extraida" "C:\caminho\do\repositorio" /E /XD node_modules .git
   ```
3. Dentro do repositório:
   ```powershell
   cd "C:\caminho\do\repositorio"
   npm install
   npm test
   git status --short
   ```
   Confira que só aparecem arquivos esperados. Se o relatório da etapa listar arquivos removidos ou movidos, use `git rm` neles.
4. Publique:
   ```powershell
   git add -A
   git commit -m "Descrição curta da etapa"
   git push origin main
   ```
5. Acompanhe em Vercel → Deployments até aparecer **Ready**.

## Variáveis de ambiente

Configure em Vercel → Project → Settings → Environment Variables (marque **Production**) e faça um novo deploy (Deployments → ⋯ → Redeploy) para valerem. Nunca coloque valores reais no GitHub.

| Variável | Para quê | Obrigatória? |
|---|---|---|
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Guardar métricas e limites de requisição de forma permanente | Recomendada. Sem elas tudo vai para a memória e some a cada reinício |
| `SESSION_SECRET` | Assinar a sessão do painel (mínimo 32 caracteres) | Só para usar o `/admin` |
| `ADMIN_PASSWORD_SHA256` | Senha do painel, guardada como hash | Só para usar o `/admin` (use esta **ou** `ADMIN_PASSWORD`) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | Receber as mensagens do formulário por e-mail | Só para o formulário de contato |
| `CONTACT_FROM_EMAIL` | Remetente. Sem domínio verificado no Resend, só `Portfólio <onboarding@resend.dev>` | Opcional |
| `SITE_URL` | Endereço público (canonical, sitemap) | Opcional (padrão: o endereço atual) |
| `ALLOWED_ORIGINS` | Outras origens permitidas por CORS | Normalmente vazia |

### Passo a passo

**1. Turso (métricas permanentes)**
1. Crie uma conta em turso.tech e um banco de dados.
2. Copie a URL do banco (`libsql://...`) para `TURSO_DATABASE_URL`.
3. Gere um token de acesso ao banco e coloque em `TURSO_AUTH_TOKEN`. As tabelas são criadas automaticamente no primeiro uso.

**2. Painel administrativo**

Gere o segredo da sessão (PowerShell):
```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```
Copie o resultado para `SESSION_SECRET`.

Gere o hash da sua senha (troque `minha-senha-longa`; a senha em si não vai para a Vercel):
```powershell
$b=[Text.Encoding]::UTF8.GetBytes("minha-senha-longa"); ([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($b)) -replace '-','').ToLower()
```
Copie o resultado para `ADMIN_PASSWORD_SHA256`. Depois do redeploy, entre em `/pt/admin`.

**3. Formulário de contato (Resend)**
1. Crie uma conta em resend.com e uma chave de API: coloque em `RESEND_API_KEY`.
2. Coloque em `CONTACT_TO_EMAIL` o e-mail que vai receber as mensagens (com o remetente de teste, o Resend só entrega para o e-mail da sua própria conta).

### Conferir depois do deploy

- `https://max-godoy-portfolio.vercel.app/api/health` → `ok: true`
- `/api/ready` → `ok: true` (banco acessível)
- `/api/info` → em `features`, `metricsPersistent` deve ser `true` (Turso ativo) e `contact` deve ser `true` (e-mail configurado)
- Em `/pt/admin`, a tela de monitoramento deve indicar armazenamento persistente
- Envie uma mensagem de teste pelo formulário de contato

## Segurança

- Troque o segredo ou a senha se suspeitar de vazamento: o novo `SESSION_SECRET` encerra todas as sessões abertas.
- A sessão é sem estado (cookie assinado): não há como encerrar uma sessão específica antes das 8 horas, só trocando o segredo.
- O arquivo `.env` real nunca deve ir ao GitHub (já está no `.gitignore`).

## Node

`package.json` fixa `engines.node` em `22.x` para a Vercel usar uma versão estável.
