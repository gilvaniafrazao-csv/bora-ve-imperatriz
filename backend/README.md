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
| `npm run typecheck` | Verifica tipos (src + tests) sem gerar build    |
| `npm test`          | Roda os testes automatizados (`tests/`)         |

## Estrutura de pastas

```
backend/src/
├── app.ts                 # composição da API (middlewares + routers)
├── server.ts              # listen HTTP
├── config/                # env e client Supabase
├── shared/                # erros e HTTP comuns
└── modules/
    ├── health/            # GET /health
    ├── auth/              # POST /api/auth/register e POST /api/auth/login
    └── preferences/       # GET e PUT /api/preferences (autenticado)
```

Arquitetura completa: [`docs/arquitetura.md`](../docs/arquitetura.md).

## Convenções para as próximas tasks

- **Módulos:** criar `src/modules/<feature>/` com `routes → controller → service → repository`. Registrar o router em `app.ts`.
- **Erros:** lance `AppError` — o `errorHandler` converte para `{ "error": { "code", "message" } }`.
- **Senhas (RNF05):** hash bcrypt no serviço; o repositório só persiste `password_hash`.
- **Banco:** somente nos `*.repository.ts`, via `getSupabaseClient()` (Service Role no backend).

## Testes

```bash
npm test
```

Usa o test runner nativo do Node (`node:test`) via `tsx`, sem dependências extras e **sem precisar de Supabase nem de `.env`**: os testes sobem a API real contra um Supabase/PostgREST falso em memória (`tests/helpers/fakeSupabase.ts`).

| Arquivo | O que cobre |
| --- | --- |
| `tests/validation.test.ts` | Validação da seleção de interesses (cadastro e preferências) e do JWT |
| `tests/preferences.api.test.ts` | `GET`/`PUT /api/preferences`: autenticação, registro, consulta, edição, isolamento entre usuários e falhas do banco |
| `tests/onboarding.api.test.ts` | Fluxo cadastro com interesses → login → consulta/edição, e rollback do cadastro |

Para simular falha do banco num teste: `ctx.fake.failNext('POST', 'user_preferences')`. O fake só entende as consultas usadas hoje; se um módulo novo usar outra, estenda o `fakeSupabase.ts`. Ele **não** substitui um teste manual contra o Supabase real (RLS, constraints e triggers não são simulados).

## Cadastro (RF01 + RF03)

`POST /api/auth/register`

```json
{
  "name": "Ana",
  "email": "ana@example.com",
  "password": "senhaSegura",
  "categorySlugs": ["sushi", "pizza", "bar"]
}
```

Resposta `201`:

```json
{
  "message": "Conta criada com sucesso.",
  "user": { "id": "...", "name": "Ana", "email": "ana@example.com", "createdAt": "..." }
}
```

A senha é gravada só como hash bcrypt. É obrigatório enviar **pelo menos 3** categorias da tela de preferências (`sushi`, `pizza`, `hamburguer`, `bar`, `churrasco`, `doces`). E-mail duplicado retorna `409`. Campos inválidos retornam `400` com `error.details`.

## Login (RF02)

`POST /api/auth/login`

```json
{
  "email": "ana@example.com",
  "password": "senhaSegura"
}
```

Resposta `200`:

```json
{
  "message": "Login realizado com sucesso.",
  "user": { "id": "...", "name": "Ana", "email": "ana@example.com", "createdAt": "..." },
  "token": "eyJ..."
}
```

E-mail ou senha inválidos retornam `401` com o código `INVALID_CREDENTIALS`. O token é um JWT HS256 (7 dias) assinado com `JWT_SECRET`.

## Preferências (RF03)

Rotas autenticadas: envie `Authorization: Bearer <token>` (o `token` do login). Sem token, token inválido ou expirado retornam `401 UNAUTHORIZED`.

### `PUT /api/preferences` — registrar / editar

Substitui o conjunto de categorias do usuário (serve para o onboarding e para a edição posterior).

```json
{
  "categorySlugs": ["sushi", "pizza", "bar"],
  "priceRange": "moderado"
}
```

- `categorySlugs` (obrigatório): pelo menos **3** entre `sushi`, `pizza`, `hamburguer`, `bar`, `churrasco`, `doces`. Duplicados são ignorados.
- `priceRange` (opcional): `economico` | `moderado` | `premium`. Ausente mantém o valor atual; `null` limpa.

Resposta `200`:

```json
{
  "message": "Preferências salvas com sucesso.",
  "preferences": {
    "categorySlugs": ["bar", "pizza", "sushi"],
    "priceRange": "moderado",
    "onboardingCompleted": true,
    "updatedAt": "..."
  }
}
```

Campos inválidos retornam `400 VALIDATION_ERROR` com `error.details`.

### `GET /api/preferences` — consultar

Resposta `200` com `{ "preferences": { ... } }` no mesmo formato acima. Usuário que ainda não escolheu nada recebe `categorySlugs: []`, `priceRange: null` e `onboardingCompleted: false` (não é erro). `categorySlugs` vem ordenado por slug para a resposta ser estável; é essa lista que o motor de recomendação deve consumir.
