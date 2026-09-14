# BV — Frontend (setup inicial)

Estrutura inicial do projeto frontend, referente à task **TASK-BV-INFRA-04**.

## Stack

- Next.js 16 (App Router)
- TypeScript
- React 19
- CSS normal (CSS Modules, sem framework de CSS)

## Requisitos

- Node.js 20.9 ou superior (recomendado: 22+ ou 24+)

## Como usar

1. Copie todos os arquivos desta pasta para dentro da pasta `frontend/` do repositório do time.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode localmente:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000` — se aparecer a página "Projeto BV — Setup inicial", o primeiro critério de aceite está atendido.

## Estrutura

```
src/
  app/                 → páginas e rotas (App Router)
  features/<domínio>/  → API e UI de um fluxo (ex.: auth)
  lib/api/             → client HTTP do backend
  types/               → tipos compartilhados
  components/          → UI reutilizável (quando surgir)
```

Arquitetura completa: [`docs/arquitetura.md`](../docs/arquitetura.md).

Copie `.env.example` para `.env.local` e ajuste `NEXT_PUBLIC_API_URL` se a API não estiver em `http://localhost:3333`.

## Pendências (próximas tasks)

- Telas de cadastro/login em `app/` usando `features/auth`.

## Nota de segurança

Esse setup usa Next.js 16.3.4 (versão mais recente disponível), pois a linha 14.x não recebe mais correções de segurança da Vercel.
