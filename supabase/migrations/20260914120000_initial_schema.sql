-- TASK-BV-INFRA-02 — Schema inicial do MVP Bora Vê (PostgreSQL / Supabase)
-- Documentação: docs/modelagem-banco.md

-- ---------------------------------------------------------------------------
-- Extensões
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('usuario', 'proprietario', 'administrador');

CREATE TYPE price_range AS ENUM ('economico', 'moderado', 'premium');

CREATE TYPE category_group AS ENUM (
  'interesse',
  'gastronomia',
  'lazer',
  'estabelecimento',
  'evento'
);

CREATE TYPE catalog_status AS ENUM ('ativo', 'inativo', 'pendente_revisao');

CREATE TYPE event_status AS ENUM ('ativo', 'encerrado', 'cancelado');

CREATE TYPE data_origin AS ENUM ('scraping', 'cadastro_manual', 'proprietario');

CREATE TYPE claim_status AS ENUM ('pendente', 'aprovada', 'recusada');

CREATE TYPE promotion_status AS ENUM (
  'aguardando_pagamento',
  'ativa',
  'encerrada',
  'cancelada'
);

CREATE TYPE metric_event_type AS ENUM (
  'visualizacao_perfil',
  'clique_rota',
  'favorito',
  'visualizacao_promocao'
);

CREATE TYPE collection_entity_type AS ENUM ('estabelecimento', 'evento');

CREATE TYPE collection_run_status AS ENUM (
  'em_andamento',
  'sucesso',
  'parcial',
  'falha'
);

-- ---------------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION grant_default_usuario_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'usuario')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Usuários e preferências
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT users_email_format CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));

COMMENT ON COLUMN users.password_hash IS
  'Hash bcrypt gerado pela API. Nunca armazenar senha em texto (RNF05).';

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role user_role NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  price_range price_range,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  category_group category_group NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_slug_not_blank CHECK (btrim(slug) <> ''),
  CONSTRAINT categories_name_not_blank CHECK (btrim(name) <> '')
);

CREATE UNIQUE INDEX categories_slug_unique ON categories (slug);

CREATE TABLE user_preference_categories (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, category_id)
);

-- ---------------------------------------------------------------------------
-- Estabelecimentos
-- ---------------------------------------------------------------------------
CREATE TABLE establishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_normalized text NOT NULL,
  description text,
  street text,
  number text,
  neighborhood text,
  city text NOT NULL DEFAULT 'Imperatriz',
  state text NOT NULL DEFAULT 'MA',
  postal_code text,
  address_normalized text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  phone text,
  phone_digits text,
  whatsapp text,
  email text,
  website text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  opening_hours jsonb,
  price_range price_range,
  status catalog_status NOT NULL DEFAULT 'ativo',
  field_provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  missing_fields text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT establishments_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT establishments_name_normalized_not_blank CHECK (btrim(name_normalized) <> ''),
  CONSTRAINT establishments_latitude_range CHECK (
    latitude IS NULL OR (latitude >= -90 AND latitude <= 90)
  ),
  CONSTRAINT establishments_longitude_range CHECK (
    longitude IS NULL OR (longitude >= -180 AND longitude <= 180)
  )
);

CREATE INDEX establishments_name_normalized_idx
  ON establishments (name_normalized);

CREATE INDEX establishments_address_normalized_idx
  ON establishments (address_normalized)
  WHERE address_normalized IS NOT NULL AND address_normalized <> '';

CREATE UNIQUE INDEX establishments_phone_digits_unique
  ON establishments (phone_digits)
  WHERE phone_digits IS NOT NULL AND phone_digits <> '';

CREATE UNIQUE INDEX establishments_website_unique
  ON establishments (lower(website))
  WHERE website IS NOT NULL AND btrim(website) <> '';

CREATE INDEX establishments_status_price_idx
  ON establishments (status, price_range);

CREATE INDEX establishments_geo_idx
  ON establishments (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON COLUMN establishments.field_provenance IS
  'Mapa campo → scraping | cadastro_manual | proprietario (RN01/RN02).';
COMMENT ON COLUMN establishments.missing_fields IS
  'Campos obrigatórios ausentes após coleta ou cadastro (RNF07).';

CREATE TABLE establishment_categories (
  establishment_id uuid NOT NULL REFERENCES establishments (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  PRIMARY KEY (establishment_id, category_id)
);

CREATE TABLE establishment_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments (id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  origin data_origin NOT NULL DEFAULT 'cadastro_manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT establishment_photos_url_not_blank CHECK (btrim(url) <> '')
);

CREATE INDEX establishment_photos_establishment_idx
  ON establishment_photos (establishment_id, sort_order);

-- ---------------------------------------------------------------------------
-- Eventos
-- ---------------------------------------------------------------------------
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_normalized text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  establishment_id uuid REFERENCES establishments (id) ON DELETE SET NULL,
  street text,
  number text,
  neighborhood text,
  city text,
  state text,
  postal_code text,
  address_normalized text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  price_amount numeric(12, 2),
  status event_status NOT NULL DEFAULT 'ativo',
  field_provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  missing_fields text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT events_name_normalized_not_blank CHECK (btrim(name_normalized) <> ''),
  CONSTRAINT events_period_chk CHECK (ends_at IS NULL OR ends_at >= starts_at),
  CONSTRAINT events_price_amount_chk CHECK (price_amount IS NULL OR price_amount >= 0),
  CONSTRAINT events_latitude_range CHECK (
    latitude IS NULL OR (latitude >= -90 AND latitude <= 90)
  ),
  CONSTRAINT events_longitude_range CHECK (
    longitude IS NULL OR (longitude >= -180 AND longitude <= 180)
  )
);

CREATE INDEX events_name_normalized_idx ON events (name_normalized);

CREATE INDEX events_starts_at_idx
  ON events (starts_at)
  WHERE status = 'ativo';

CREATE INDEX events_establishment_idx
  ON events (establishment_id)
  WHERE establishment_id IS NOT NULL;

CREATE INDEX events_geo_idx
  ON events (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE TABLE event_categories (
  event_id uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, category_id)
);

-- ---------------------------------------------------------------------------
-- Favoritos
-- ---------------------------------------------------------------------------
CREATE TABLE favorite_establishments (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  establishment_id uuid NOT NULL REFERENCES establishments (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, establishment_id)
);

CREATE INDEX favorite_establishments_establishment_idx
  ON favorite_establishments (establishment_id);

CREATE TABLE favorite_events (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);

CREATE INDEX favorite_events_event_idx ON favorite_events (event_id);

-- ---------------------------------------------------------------------------
-- Proprietários e reivindicação
-- ---------------------------------------------------------------------------
CREATE TABLE establishment_owners (
  establishment_id uuid NOT NULL REFERENCES establishments (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  is_primary boolean NOT NULL DEFAULT true,
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (establishment_id, user_id)
);

CREATE INDEX establishment_owners_user_idx ON establishment_owners (user_id);

CREATE TABLE establishment_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status claim_status NOT NULL DEFAULT 'pendente',
  evidence_text text,
  evidence_url text,
  reviewed_by uuid REFERENCES users (id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX establishment_claims_one_pending
  ON establishment_claims (user_id, establishment_id)
  WHERE status = 'pendente';

CREATE INDEX establishment_claims_establishment_status_idx
  ON establishment_claims (establishment_id, status);

-- ---------------------------------------------------------------------------
-- Promoções
-- ---------------------------------------------------------------------------
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments (id) ON DELETE RESTRICT,
  created_by_user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  objective text,
  invested_amount numeric(12, 2) NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status promotion_status NOT NULL DEFAULT 'aguardando_pagamento',
  external_payment_id text,
  payment_provider text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promotions_amount_chk CHECK (invested_amount >= 0),
  CONSTRAINT promotions_period_chk CHECK (ends_at > starts_at)
);

CREATE INDEX promotions_establishment_status_idx
  ON promotions (establishment_id, status);

CREATE INDEX promotions_active_period_idx
  ON promotions (starts_at, ends_at)
  WHERE status = 'ativa';

CREATE INDEX promotions_active_investment_idx
  ON promotions (invested_amount DESC)
  WHERE status = 'ativa';

-- ---------------------------------------------------------------------------
-- Métricas
-- ---------------------------------------------------------------------------
CREATE TABLE metric_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments (id) ON DELETE CASCADE,
  promotion_id uuid REFERENCES promotions (id) ON DELETE SET NULL,
  user_id uuid REFERENCES users (id) ON DELETE SET NULL,
  metric_type metric_event_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX metric_events_establishment_type_created_idx
  ON metric_events (establishment_id, metric_type, created_at);

CREATE INDEX metric_events_promotion_idx
  ON metric_events (promotion_id)
  WHERE promotion_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Origem dos dados e coleta
-- ---------------------------------------------------------------------------
CREATE TABLE data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT data_sources_key_not_blank CHECK (btrim(key) <> '')
);

CREATE UNIQUE INDEX data_sources_key_unique ON data_sources (key);

CREATE TABLE establishment_external_ids (
  establishment_id uuid NOT NULL REFERENCES establishments (id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES data_sources (id) ON DELETE RESTRICT,
  external_id text NOT NULL,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (establishment_id, source_id),
  CONSTRAINT establishment_external_ids_external_id_not_blank CHECK (btrim(external_id) <> '')
);

CREATE UNIQUE INDEX establishment_external_ids_source_external_unique
  ON establishment_external_ids (source_id, external_id);

CREATE TABLE event_external_ids (
  event_id uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES data_sources (id) ON DELETE RESTRICT,
  external_id text NOT NULL,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, source_id),
  CONSTRAINT event_external_ids_external_id_not_blank CHECK (btrim(external_id) <> '')
);

CREATE UNIQUE INDEX event_external_ids_source_external_unique
  ON event_external_ids (source_id, external_id);

CREATE TABLE collection_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES data_sources (id) ON DELETE RESTRICT,
  entity_type collection_entity_type NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status collection_run_status NOT NULL DEFAULT 'em_andamento',
  records_created integer NOT NULL DEFAULT 0,
  records_updated integer NOT NULL DEFAULT 0,
  records_skipped_duplicate integer NOT NULL DEFAULT 0,
  error_summary text,
  CONSTRAINT collection_runs_counts_chk CHECK (
    records_created >= 0
    AND records_updated >= 0
    AND records_skipped_duplicate >= 0
  )
);

CREATE INDEX collection_runs_source_started_idx
  ON collection_runs (source_id, started_at DESC);

CREATE TABLE collection_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES collection_runs (id) ON DELETE CASCADE,
  message text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collection_errors_message_not_blank CHECK (btrim(message) <> '')
);

CREATE INDEX collection_errors_run_idx ON collection_errors (run_id, created_at);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER users_grant_default_role
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION grant_default_usuario_role();

CREATE TRIGGER user_preferences_set_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER establishments_set_updated_at
  BEFORE UPDATE ON establishments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER establishment_claims_set_updated_at
  BEFORE UPDATE ON establishment_claims
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER promotions_set_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Papéis do Supabase (anon / authenticated / service_role).
-- No projeto hospedado eles já existem; o bloco só cria se a migration
-- rodar em um PostgreSQL local de desenvolvimento.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- O backend Express usa Service Role e ignora RLS. As policies protegem
-- acesso direto com a anon key e documentam o modelo de permissão (RNF05).
-- ---------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preference_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_external_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_external_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_errors ENABLE ROW LEVEL SECURITY;

-- Catálogo público (somente leitura do que está ativo)
CREATE POLICY categories_public_read
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY data_sources_public_read
  ON data_sources
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY establishments_public_read
  ON establishments
  FOR SELECT
  TO anon, authenticated
  USING (status = 'ativo');

CREATE POLICY establishment_categories_public_read
  ON establishment_categories
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM establishments e
      WHERE e.id = establishment_categories.establishment_id
        AND e.status = 'ativo'
    )
  );

CREATE POLICY establishment_photos_public_read
  ON establishment_photos
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM establishments e
      WHERE e.id = establishment_photos.establishment_id
        AND e.status = 'ativo'
    )
  );

CREATE POLICY events_public_read
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'ativo');

CREATE POLICY event_categories_public_read
  ON event_categories
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM events ev
      WHERE ev.id = event_categories.event_id
        AND ev.status = 'ativo'
    )
  );

CREATE POLICY promotions_public_active_read
  ON promotions
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'ativa'
    AND now() >= starts_at
    AND now() < ends_at
  );

-- Perfil e preferências do próprio usuário (JWT do Supabase / auth.uid)
CREATE POLICY users_self_select
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY users_self_update
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY user_roles_self_select
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY user_preferences_self_all
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_preference_categories_self_all
  ON user_preference_categories
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY favorite_establishments_self_all
  ON favorite_establishments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY favorite_events_self_all
  ON favorite_events
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY establishment_claims_self_select
  ON establishment_claims
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY establishment_claims_self_insert
  ON establishment_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pendente');

CREATE POLICY establishment_owners_self_select
  ON establishment_owners
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY establishments_owner_update
  ON establishments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM establishment_owners eo
      WHERE eo.establishment_id = establishments.id
        AND eo.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM establishment_owners eo
      WHERE eo.establishment_id = establishments.id
        AND eo.user_id = auth.uid()
    )
  );

CREATE POLICY establishment_photos_owner_all
  ON establishment_photos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM establishment_owners eo
      WHERE eo.establishment_id = establishment_photos.establishment_id
        AND eo.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM establishment_owners eo
      WHERE eo.establishment_id = establishment_photos.establishment_id
        AND eo.user_id = auth.uid()
    )
  );

CREATE POLICY promotions_owner_select
  ON promotions
  FOR SELECT
  TO authenticated
  USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM establishment_owners eo
      WHERE eo.establishment_id = promotions.establishment_id
        AND eo.user_id = auth.uid()
    )
  );

CREATE POLICY metric_events_owner_select
  ON metric_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM establishment_owners eo
      WHERE eo.establishment_id = metric_events.establishment_id
        AND eo.user_id = auth.uid()
    )
  );

-- Coleta e IDs externos: sem acesso anon/authenticated (somente service role)
-- RLS habilitada sem policy = deny para esses papéis.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE
  categories,
  data_sources,
  establishments,
  establishment_categories,
  establishment_photos,
  events,
  event_categories,
  promotions
TO anon, authenticated;

GRANT SELECT, UPDATE ON TABLE users TO authenticated;
GRANT SELECT ON TABLE user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  user_preferences,
  user_preference_categories,
  favorite_establishments,
  favorite_events,
  establishment_photos
TO authenticated;
GRANT SELECT, INSERT ON TABLE establishment_claims TO authenticated;
GRANT SELECT ON TABLE establishment_owners TO authenticated;
GRANT UPDATE ON TABLE establishments TO authenticated;
GRANT SELECT ON TABLE metric_events TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ---------------------------------------------------------------------------
-- Seeds
-- ---------------------------------------------------------------------------
INSERT INTO data_sources (key, name) VALUES
  ('google_maps', 'Google Maps'),
  ('instagram', 'Instagram'),
  ('tiktok', 'TikTok'),
  ('manual_admin', 'Cadastro manual da administração'),
  ('owner', 'Informações do proprietário');

INSERT INTO categories (slug, name, category_group) VALUES
  -- Interesse (onboarding / recomendações)
  ('restaurantes', 'Restaurantes', 'interesse'),
  ('bares', 'Bares', 'interesse'),
  ('cafeterias', 'Cafeterias', 'interesse'),
  ('cultura', 'Cultura', 'interesse'),
  ('compras', 'Compras', 'interesse'),
  ('vida-noturna', 'Vida noturna', 'interesse'),
  ('ao-ar-livre', 'Ao ar livre', 'interesse'),
  -- Gastronomia
  ('comida-brasileira', 'Comida brasileira', 'gastronomia'),
  ('comida-japonesa', 'Comida japonesa', 'gastronomia'),
  ('pizza', 'Pizza', 'gastronomia'),
  ('hamburguer', 'Hambúrguer', 'gastronomia'),
  ('vegetariano', 'Vegetariano', 'gastronomia'),
  ('sobremesas', 'Sobremesas', 'gastronomia'),
  -- Lazer
  ('shows', 'Shows', 'lazer'),
  ('esportes', 'Esportes', 'lazer'),
  ('familia', 'Família', 'lazer'),
  ('romantico', 'Romântico', 'lazer'),
  -- Tipo de estabelecimento (filtros RF06)
  ('restaurante', 'Restaurante', 'estabelecimento'),
  ('bar', 'Bar', 'estabelecimento'),
  ('cafeteria', 'Cafeteria', 'estabelecimento'),
  ('lanchonete', 'Lanchonete', 'estabelecimento'),
  ('shopping', 'Shopping', 'estabelecimento'),
  ('parque', 'Parque', 'estabelecimento'),
  -- Tipo de evento
  ('show', 'Show', 'evento'),
  ('festival', 'Festival', 'evento'),
  ('feira', 'Feira', 'evento'),
  ('teatro', 'Teatro', 'evento'),
  ('esportivo', 'Esportivo', 'evento');
