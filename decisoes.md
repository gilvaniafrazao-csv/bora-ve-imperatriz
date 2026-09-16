# Registro de Decisões

## 14/09/2026 — Modelagem inicial do banco (MVP)

Decisões tomadas na estrutura inicial do PostgreSQL/Supabase (`docs/modelagem-banco.md` e `supabase/migrations/20260914120000_initial_schema.sql`):

- **Autenticação própria, não Supabase Auth.** Contas ficam em `users` com `password_hash` (bcrypt na API) e JWT da aplicação, alinhado ao setup do backend e ao RNF05. O client Supabase no Express continua com Service Role.
- **Perfis em `user_roles`.** Toda conta nasce com `usuario`. `proprietario` só após reivindicação aprovada. `administrador` é atribuição manual. O stakeholder “gerente de eventos” fica fora do MVP (cadastro de eventos pelo admin).
- **Catálogo canônico + origem satélite.** `establishments` e `events` são o perfil público. Fontes, IDs externos e rotinas de scraping ficam em `data_sources`, `*_external_ids`, `collection_runs` e `collection_errors`.
- **Hierarquia RN02 via `field_provenance` (JSONB).** Cada campo relevante registra `proprietario`, `cadastro_manual` ou `scraping`. A coleta automática não sobrescreve campo com proveniência `proprietario`.
- **Métricas como log (`metric_events`).** Permite consultar visualizações, rotas, favoritos e promoções por período (RF11), em vez de um contador único que perderia o histórico.
- **Promoções sem ledger financeiro.** Período, valor investido, objetivo, status e `external_payment_id` no gateway externo (RN10). Prioridade de exibição = `invested_amount` entre campanhas ativas; cota de espaços fica na aplicação (RN09).
- **Deduplicação no schema + lookup na coleta.** Uniques de e-mail, `(source_id, external_id)`, telefone e site; colunas `name_normalized` / `address_normalized` para o matching da aplicação (RN06, RNF07).
- **RLS como defesa em profundidade.** Leitura pública do catálogo ativo; escrita pelo owner/`auth.uid()`; coleta restrita. A API com Service Role ignora RLS e permanece responsável pela autorização das rotas.

## 14/09/2026 — Cadastro de usuário comum (RF01 / L01)

A lacuna L01 (criação de conta) foi fechada para o MVP das telas de CADASTRO:

- **Escopo:** usuário comum (`usuario`), com nome, e-mail e senha — os campos da tela. Preferências (tela PREFERENCIA) ficam no RF03; login no RF02.
- **Fora deste endpoint:** OAuth (Apple/Google/Facebook do protótipo) e papéis de proprietário/admin.
- **Contrato:** `POST /api/auth/register`. E-mail único (case-insensitive). Senha com no mínimo 8 caracteres, persistida só como hash bcrypt (RNF05). Confirmação da conta = resposta `201`.

## 16/09/2026 — Preferências no cadastro (RF03)

A conta só é criada no segundo “Bora lá!”, depois de escolher **pelo menos 3** categorias da tela de preferências (`sushi`, `pizza`, `hamburguer`, `bar`, `churrasco`, `doces`). O `POST /api/auth/register` passa a receber `categorySlugs` e grava `user_preferences` + `user_preference_categories`. OAuth continua fora.

## 14/09/2026 — Arquitetura em módulos

Backend organizado por funcionalidade (`src/modules/<feature>`), com camadas `routes → controller → service → repository`. Infra comum em `config/` e `shared/`. Frontend: Next.js App Router com UI colocada na rota, Tailwind v4 e HTTP em `lib/`. Detalhes em `docs/arquitetura.md`.

## 14/09/2026 — Frontend com Tailwind

O CSS Modules e a pasta `features/` saíram do frontend. UI fica junto da rota (`app/cadastro`), estilo em Tailwind v4 (`@theme` em `globals.css`), chamadas HTTP em `lib/api.ts` e `lib/auth.ts`. O visual aprovado do cadastro (radial no verde, painel `#FEEFDD`, Poppins) permanece.
