# BV — Frontend

App Next.js do Bora Vê Imperatriz.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Requisitos

- Node.js 20.9 ou superior (recomendado: 22+ ou 24+)

## Como usar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env.local` e ajuste `NEXT_PUBLIC_API_URL` se a API não estiver em `http://localhost:3333`.
3. Rode localmente:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000` — o cadastro está em `/cadastro` (dados + preferências) e o login em `/login`.

## Estrutura

```
src/
  app/           → rotas, páginas e UI da tela
  lib/           → client HTTP e chamadas de auth
  types/         → tipos compartilhados
```

Tokens de cor e fonte: `src/app/globals.css` (`@theme`).
Arquitetura completa: [`docs/arquitetura.md`](../docs/arquitetura.md).
