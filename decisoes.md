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
