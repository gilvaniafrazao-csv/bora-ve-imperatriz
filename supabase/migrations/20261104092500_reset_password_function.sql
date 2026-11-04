CREATE OR REPLACE FUNCTION reset_password_with_token(p_token_hash text, p_password_hash text)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  UPDATE password_reset_tokens
  SET used_at = now()
  WHERE token_hash = p_token_hash AND used_at IS NULL AND expires_at > now()
  RETURNING user_id INTO v_user_id;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE users SET password_hash = p_password_hash WHERE id = v_user_id;

  UPDATE password_reset_tokens SET used_at = now()
  WHERE user_id = v_user_id AND used_at IS NULL;

  RETURN v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION reset_password_with_token(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION reset_password_with_token(text, text) TO service_role;
