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

Para simular falha do banco num teste: `ctx.fake.failNext('POST', 'rpc/replace_user_preferences')`. O fake só entende as consultas usadas hoje; se um módulo novo usar outra, estenda o `fakeSupabase.ts`. Ele **não** substitui um teste manual contra o Supabase real (RLS, constraints e triggers não são simulados).

### Teste da função SQL (Postgres real)

A gravação atômica das preferências é feita pela função `replace_user_preferences` (migration `20261007120000_*`), que o fake só imita. Ela tem um teste próprio, que precisa de um PostgreSQL com as migrations aplicadas e não deixa dados (termina com `ROLLBACK`):

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/replace_user_preferences.test.sql
```

Cobre: registrar, trocar só as categorias (mantém o preço e atualiza `updated_at`), limpar/trocar o preço, **tudo ou nada** quando uma categoria é inválida, usuário inexistente, idempotência e permissões (só `service_role`).

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

> **Requer a migration `supabase/migrations/20261007120000_replace_user_preferences.sql`** aplicada no banco (função `replace_user_preferences`, usada pelo `PUT` para gravar tudo numa única transação). Sem ela o `PUT` responde `503`. Aplique com `supabase db push` ou colando o SQL no editor do Supabase.

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


## Busca de lugares e filtros (`/api/places/search`)

`GET /api/places/search` — rota **pública**. Busca lugares reais de Imperatriz no **Google Places (New)**; exige `GOOGLE_MAPS_API_KEY` no backend (sem ela responde `503 PLACES_NOT_CONFIGURED`). Todos os parâmetros são opcionais e os filtros se combinam (E):

| Parâmetro | Exemplo | O que faz |
| --- | --- | --- |
| `q` | `q=pizza` | O que a pessoa procura (até 80 caracteres). Vazio = descoberta da cidade |
| `bairro` (ou `regiao`) | `bairro=Juçara` | Centraliza a busca no bairro |
| `lat`, `lon` | `lat=-5.52&lon=-47.49` | Posição da pessoa ("Perto de mim"); juntas |
| `categoria` | `categoria=Bares` | `Restaurantes`, `Cafeterias`, `Bares`, `Vida Noturna`, `Cultura`, `Compras`, `Ao ar livre` ou `Esportes` (ignora caixa e acento; `Todos` não filtra) |
| `preco` | `preco=$,$$` | `$`, `$$` e/ou `$$$` (qualquer uma). Lugar sem faixa de preço não aparece quando há filtro de preço |
| `raioKm` | `raioKm=3` | Distância máxima (0,5 a 40 km) a partir de você, do bairro ou do centro da cidade. Lugar sem localização fica de fora |
| `aberto` | `aberto=true` | Só quem está aberto agora (sem horário informado não conta) |
| `ordenar` | `ordenar=nota` | `relevancia` (padrão, ordem do Google), `nota` (maior primeiro) ou `distancia` (mais perto primeiro) |

Resposta `200`: `{ query, area, filters, total, places }`. `filters` mostra o que valeu (já normalizado) e `total` é a quantidade depois dos filtros; cada lugar traz `category`, `categories`, `rating`, `reviewCount`, `price`, `openNow`, `distanceKm`, `mapsUrl` etc. Filtro inválido: `400 VALIDATION_ERROR` com `error.details`.

**Como os filtros são aplicados** (duas camadas):
1. **No pedido ao Google**, quando ele suporta: `openNow`, `priceLevels` e `pageSize: 20` (12 sem filtros), para o Google já devolver lugares que casam. Só `categoria` sem texto troca o assunto da busca (ex.: `bares e pubs`).
2. **No servidor**, sempre (`applyPlaceFilters`): categoria, preço, aberto e raio são conferidos de novo e a ordenação é aplicada. É a camada confiável, que vale mesmo se o Google ignorar algum filtro.

Se o Google recusar um pedido que levava `openNow`/`priceLevels`, o servidor tenta **uma vez** sem eles e filtra por conta própria. Sem filtros, não há nova tentativa.

> Os testes (`tests/places.filters.test.ts`) simulam o Google; nada neste fluxo foi testado contra a API real do Google.