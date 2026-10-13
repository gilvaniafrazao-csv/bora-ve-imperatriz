-- Teste da função replace_user_preferences (TASK-BV-PREF-02).
--
-- Pré-requisito: migrations aplicadas (inclui a 20261007120000_*). Roda numa
-- transação e termina com ROLLBACK, então não deixa dados no banco.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/replace_user_preferences.test.sql
--
-- Qualquer falha aborta com "FALHA: ..." e código de saída diferente de zero.
SET client_encoding = 'UTF8';

BEGIN;

CREATE FUNCTION pg_temp.slugs_of(u uuid) RETURNS text
LANGUAGE sql AS $$
  SELECT coalesce(string_agg(c.slug, ',' ORDER BY c.slug), '')
  FROM user_preference_categories l
  JOIN categories c ON c.id = l.category_id
  WHERE l.user_id = u
$$;

DO $$
DECLARE
  v_user uuid := gen_random_uuid();
  v_a uuid[];
  v_b uuid[];
  v_bogus uuid := 'ffffffff-ffff-ffff-ffff-ffffffffffff';
  v_price price_range;
  v_updated timestamptz;
  v_sig text := 'replace_user_preferences(uuid, uuid[], boolean, price_range)';
BEGIN
  INSERT INTO users (id, name, email, password_hash)
  VALUES (v_user, 'Teste SQL', v_user || '@teste.local', 'x');

  SELECT array_agg(id ORDER BY slug) INTO v_a FROM categories WHERE slug IN ('sushi', 'pizza', 'bar');
  SELECT array_agg(id ORDER BY slug) INTO v_b FROM categories WHERE slug IN ('hamburguer', 'churrasco', 'doces');
  IF cardinality(v_a) <> 3 OR cardinality(v_b) <> 3 THEN
    RAISE EXCEPTION 'FALHA: categorias do onboarding ausentes (aplique todas as migrations)';
  END IF;

  -- 1. Registrar categorias + preço
  PERFORM replace_user_preferences(v_user, v_a, true, 'moderado');
  IF pg_temp.slugs_of(v_user) <> 'bar,pizza,sushi' THEN
    RAISE EXCEPTION 'FALHA 1: categorias = %', pg_temp.slugs_of(v_user);
  END IF;
  SELECT price_range INTO v_price FROM user_preferences WHERE user_id = v_user;
  IF v_price IS DISTINCT FROM 'moderado' THEN RAISE EXCEPTION 'FALHA 1: preço = %', v_price; END IF;

  -- 2. Trocar só as categorias: substitui o conjunto, mantém o preço e atualiza updated_at.
  --    (envelhece updated_at sem o gatilho para provar que a função o atualiza sozinha)
  ALTER TABLE user_preferences DISABLE TRIGGER user_preferences_set_updated_at;
  UPDATE user_preferences SET updated_at = now() - interval '1 day' WHERE user_id = v_user;
  ALTER TABLE user_preferences ENABLE TRIGGER user_preferences_set_updated_at;

  PERFORM replace_user_preferences(v_user, v_b, false);
  IF pg_temp.slugs_of(v_user) <> 'churrasco,doces,hamburguer' THEN
    RAISE EXCEPTION 'FALHA 2: categorias = %', pg_temp.slugs_of(v_user);
  END IF;
  SELECT price_range, updated_at INTO v_price, v_updated FROM user_preferences WHERE user_id = v_user;
  IF v_price IS DISTINCT FROM 'moderado' THEN RAISE EXCEPTION 'FALHA 2: preço mudou para %', v_price; END IF;
  IF v_updated < now() - interval '1 minute' THEN
    RAISE EXCEPTION 'FALHA 2: updated_at não foi atualizado (%)', v_updated;
  END IF;

  -- 3. Preço: NULL explícito limpa; valor novo grava
  PERFORM replace_user_preferences(v_user, v_b, true, NULL);
  SELECT price_range INTO v_price FROM user_preferences WHERE user_id = v_user;
  IF v_price IS NOT NULL THEN RAISE EXCEPTION 'FALHA 3: preço deveria ser nulo, é %', v_price; END IF;
  PERFORM replace_user_preferences(v_user, v_b, true, 'premium');
  SELECT price_range INTO v_price FROM user_preferences WHERE user_id = v_user;
  IF v_price IS DISTINCT FROM 'premium' THEN RAISE EXCEPTION 'FALHA 3: preço = %', v_price; END IF;

  -- 4. Tudo ou nada: preço novo + categoria inexistente não pode alterar nada
  BEGIN
    PERFORM replace_user_preferences(v_user, ARRAY[v_a[1], v_a[2], v_bogus], true, 'economico');
    RAISE EXCEPTION 'FALHA 4: deveria ter violado a chave estrangeira';
  EXCEPTION WHEN foreign_key_violation THEN
    NULL;
  END;
  SELECT price_range INTO v_price FROM user_preferences WHERE user_id = v_user;
  IF v_price IS DISTINCT FROM 'premium' OR pg_temp.slugs_of(v_user) <> 'churrasco,doces,hamburguer' THEN
    RAISE EXCEPTION 'FALHA 4: a falha alterou dados (preço %, categorias %)', v_price, pg_temp.slugs_of(v_user);
  END IF;

  -- 5. Usuário inexistente: chave estrangeira (a API responde 401)
  BEGIN
    PERFORM replace_user_preferences(gen_random_uuid(), v_a, false);
    RAISE EXCEPTION 'FALHA 5: deveria ter violado a chave estrangeira';
  EXCEPTION WHEN foreign_key_violation THEN
    NULL;
  END;

  -- 6. Idempotente: repetir não duplica linhas
  PERFORM replace_user_preferences(v_user, v_b, false);
  PERFORM replace_user_preferences(v_user, v_b, false);
  IF (SELECT count(*) FROM user_preference_categories WHERE user_id = v_user) <> 3 THEN
    RAISE EXCEPTION 'FALHA 6: linhas duplicadas';
  END IF;

  -- 7. Array nulo é recusado
  BEGIN
    PERFORM replace_user_preferences(v_user, NULL, false);
    RAISE EXCEPTION 'FALHA 7: deveria recusar array nulo';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'FALHA%' THEN RAISE; END IF;
  END;

  -- 8. Permissões: só o service_role executa
  IF has_function_privilege('anon', v_sig, 'EXECUTE')
     OR has_function_privilege('authenticated', v_sig, 'EXECUTE')
     OR NOT has_function_privilege('service_role', v_sig, 'EXECUTE') THEN
    RAISE EXCEPTION 'FALHA 8: permissões incorretas (deve ser só service_role)';
  END IF;

  RAISE NOTICE 'replace_user_preferences: 8 grupos de verificação OK';
END;
$$;

ROLLBACK;
