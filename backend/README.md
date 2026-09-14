# Bora Vê Imperatriz — Backend

API REST em **Node.js + TypeScript**, integrada ao **Supabase (PostgreSQL)**.
Referente à `TASK-BV-INFRA-03 — Setup do projeto backend`.

## Requisitos

- Node.js 18+
- Uma conta/projeto no [Supabase](https://supabase.com)

## Como rodar localmente

```bash
cd backend
npm install
cp .env.example .env
# edite o .env com as credenciais do seu projeto Supabase
npm run dev
```

O servidor sobe em `http://localhost:3333` (porta configurável via `PORT` no `.env`).

Para confirmar que está no ar:

```bash
curl http://localhost:3333/health
```

Resposta esperada:

```json
{ "status": "ok", "service": "bora-ve-backend", "timestamp": "..." }
```

> O servidor sobe mesmo sem as variáveis `SUPABASE_URL` /
> `SUPABASE_SERVICE_ROLE_KEY` preenchidas — elas só são exigidas quando
> alguma rota efetivamente usar o client do Supabase (`src/config/supabase.ts`).
> Isso evita bloquear o setup inicial enquanto o Supabase do projeto ainda
> está sendo configurado (ver TASK-BV-INFRA-02 — Modelagem do banco de dados).

## Scripts

| Comando           | Descrição                                      |
| ------------------ | ----------------------------------------------- |
| `npm run dev`       | Sobe o servidor em modo desenvolvimento (watch) |
| `npm run build`     | Compila TypeScript para `dist/`                 |
| `npm start`         | Roda a versão compilada (`dist/server.js`)      |
| `npm run lint`      | Executa o ESLint                                |
| `npm run typecheck` | Verifica tipos sem gerar build                  |

## Estrutura de pastas

```
backend/src/
├── app.ts                 # composição da API (middlewares + routers)
├── server.ts              # listen HTTP
├── config/                # env e client Supabase
├── shared/                # erros e HTTP comuns
└── modules/
    ├── health/            # GET /health
    └── auth/              # POST /api/auth/register
```

Arquitetura completa: [`docs/arquitetura.md`](../docs/arquitetura.md).

## Convenções para as próximas tasks

- **Módulos:** criar `src/modules/<feature>/` com `routes → controller → service → repository`. Registrar o router em `app.ts`.
- **Erros:** lance `AppError` — o `errorHandler` converte para `{ "error": { "code", "message" } }`.
- **Senhas (RNF05):** hash bcrypt no serviço; o repositório só persiste `password_hash`.
- **Banco:** somente nos `*.repository.ts`, via `getSupabaseClient()` (Service Role no backend).

## Cadastro (RF01)

`POST /api/auth/register`

```json
{
  "name": "Ana",
  "email": "ana@example.com",
  "password": "senhaSegura"
}
```

Resposta `201`:

```json
{
  "message": "Conta criada com sucesso.",
  "user": { "id": "...", "name": "Ana", "email": "ana@example.com", "createdAt": "..." }
}
```

A senha é gravada só como hash bcrypt. E-mail duplicado retorna `409`. Campos inválidos retornam `400` com `error.details`.
