-- TASK-BV-PREF-02 — Gravação atômica das preferências do usuário (RF03).
--
-- O client do Supabase não expõe transações; esta função faz tudo numa só
-- transação do Postgres (PUT /api/preferences chama via .rpc):
--   * ou grava faixa de preço + categorias, ou não altera nada;
--   * o UPSERT em user_preferences trava a linha do usuário até o fim da
--     transação, então duas atualizações simultâneas do mesmo usuário são
--     executadas uma depois da outra (a última a obter o lock vence, sem
--     misturar os dois conjuntos de categorias);
--   * updated_at é atualizado sempre, inclusive quando só as categorias mudam.
--
-- p_set_price_range = false mantém a faixa de preço atual;
-- p_set_price_range = true grava p_price_range (NULL limpa).
CREATE OR REPLACE FUNCTION replace_user_preferences(
  p_user_id uuid,
  p_category_ids uuid[],
  p_set_price_range boolean DEFAULT false,
  p_price_range price_range DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_category_ids IS NULL THEN
    RAISE EXCEPTION 'p_category_ids não pode ser nulo';
  END IF;

  INSERT INTO user_preferences (user_id, price_range)
  VALUES (p_user_id, CASE WHEN p_set_price_range THEN p_price_range END)
  ON CONFLICT (user_id) DO UPDATE
    SET price_range = CASE
          WHEN p_set_price_range THEN EXCLUDED.price_range
          ELSE user_preferences.price_range
        END,
        updated_at = now();

  DELETE FROM user_preference_categories
  WHERE user_id = p_user_id
    AND category_id <> ALL (p_category_ids);

  INSERT INTO user_preference_categories (user_id, category_id)
  SELECT p_user_id, category_id
  FROM unnest(p_category_ids) AS category_id
  ON CONFLICT DO NOTHING;
END;
$$;

-- Só a API (service_role) deve chamar: a função recebe o user_id por parâmetro.
REVOKE ALL ON FUNCTION replace_user_preferences(uuid, uuid[], boolean, price_range)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION replace_user_preferences(uuid, uuid[], boolean, price_range)
  TO service_role;
