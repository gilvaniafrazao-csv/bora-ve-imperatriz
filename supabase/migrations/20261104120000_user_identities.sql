-- Contas criadas só com Google, Apple ou Facebook não têm senha.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

COMMENT ON COLUMN users.password_hash IS
  'Hash bcrypt gerado pela API. Nulo apenas em contas criadas só com Google, Apple ou Facebook. Nunca armazenar senha em texto (RNF05).';

CREATE TABLE user_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_subject text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_identities_provider_check
    CHECK (provider IN ('google', 'apple', 'facebook')),
  CONSTRAINT user_identities_subject_not_blank
    CHECK (btrim(provider_subject) <> ''),
  CONSTRAINT user_identities_provider_subject_unique
    UNIQUE (provider, provider_subject)
);

CREATE INDEX user_identities_user_id_idx ON user_identities (user_id);

COMMENT ON TABLE user_identities IS
  'Vínculo entre a conta da aplicação e o identificador estável do provedor (Google, Apple ou Facebook).';

ALTER TABLE user_identities ENABLE ROW LEVEL SECURITY;
