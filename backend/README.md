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
backend/
├── src/
│   ├── config/        # variáveis de ambiente e client do Supabase
│   ├── errors/         # AppError — erro de aplicação com status/code
│   ├── middlewares/    # errorHandler padronizado (JSON) e 404
│   ├── routes/         # rotas da API (ex.: health.routes.ts)
│   ├── app.ts           # criação e configuração do Express app
│   └── server.ts        # ponto de entrada (sobe o servidor HTTP)
├── .env.example
├── package.json
└── tsconfig.json
```

## Convenções para as próximas tasks

- **Erros:** lance `AppError(message, statusCode, code)` — o `errorHandler`
  global converte para `{ "error": { "code", "message" } }`. Nunca deixe
  stack trace vazar para o cliente.
- **Senhas (RNF05):** nunca armazenar em texto simples — usar hash (ex.:
  `bcrypt`) antes de persistir, na task de cadastro (`TASK-BV-AUTH-02`).
- **Rotas novas:** criar em `src/routes/<recurso>.routes.ts` e registrar em
  `src/app.ts`, de preferência sob um prefixo `/api/...`.
- **Acesso ao banco:** usar `getSupabaseClient()` de `src/config/supabase.ts`
  (Service Role Key — uso restrito ao backend, nunca exposta ao frontend).
