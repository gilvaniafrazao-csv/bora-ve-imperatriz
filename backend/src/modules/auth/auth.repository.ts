import { getSupabaseClient } from '../../config/supabase';
import { AppError } from '../../shared/errors/AppError';
import { AuthUserRow, PublicUser, RegisterInput, UserRow } from './auth.types';
import { OnboardingCategorySlug } from './onboarding-categories';

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false;
  }
  return (
    error.code === '23505' ||
    /duplicate key|users_email_lower_unique/i.test(error.message ?? '')
  );
}

function toDatabaseUnavailable(): AppError {
  return new AppError(
    'Não foi possível concluir o cadastro. Tente novamente mais tarde.',
    503,
    'DATABASE_UNAVAILABLE',
  );
}

/*
 * Busca por igualdade exata, não por ILIKE: no ILIKE, `_` e `%` são curingas
 * (`joao_silva@x.com` casaria com `joaoXsilva@x.com`, gerando falso "e-mail já
 * cadastrado" no cadastro e erro no login). A API sempre normaliza o e-mail
 * para minúsculas antes de gravar e de buscar (auth.validation.ts), então a
 * comparação exata é suficiente.
 */
export async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle<{ id: string }>();

  if (error) {
    throw toDatabaseUnavailable();
  }

  return data?.id ?? null;
}

export async function findAuthUserByEmail(email: string): Promise<AuthUserRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('id, name, email, created_at, password_hash')
    .eq('email', email.toLowerCase())
    .maybeSingle<AuthUserRow>();

  if (error) {
    throw toDatabaseUnavailable();
  }

  return data ?? null;
}

export async function findCategoryIdsBySlugs(
  slugs: OnboardingCategorySlug[],
): Promise<string[]> {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .select('id, slug')
    .in('slug', slugs);

  if (error || !data) {
    throw toDatabaseUnavailable();
  }

  const idBySlug = new Map(data.map((row: { id: string; slug: string }) => [row.slug, row.id]));
  const missing = slugs.filter((slug) => !idBySlug.has(slug));
  if (missing.length > 0) {
    throw new AppError(
      'Não foi possível carregar as categorias de interesse.',
      503,
      'CATEGORIES_UNAVAILABLE',
    );
  }

  return slugs.map((slug) => idBySlug.get(slug) as string);
}

export async function insertUser(
  input: Pick<RegisterInput, 'name' | 'email'>,
  passwordHash: string,
): Promise<PublicUser> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .insert({
      name: input.name,
      email: input.email,
      password_hash: passwordHash,
    })
    .select('id, name, email, created_at')
    .single<UserRow>();

  if (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(
        'Este e-mail já está cadastrado.',
        409,
        'EMAIL_ALREADY_REGISTERED',
      );
    }

    console.error('[auth.repository] insert failed', error);
    throw toDatabaseUnavailable();
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    createdAt: data.created_at,
  };
}

export async function insertUserPreferences(
  userId: string,
  categoryIds: string[],
): Promise<void> {
  const client = getSupabaseClient();

  const preferences = await client.from('user_preferences').insert({ user_id: userId });
  if (preferences.error) {
    console.error('[auth.repository] preferences insert failed', preferences.error);
    throw toDatabaseUnavailable();
  }

  const categories = await client.from('user_preference_categories').insert(
    categoryIds.map((categoryId) => ({
      user_id: userId,
      category_id: categoryId,
    })),
  );

  if (categories.error) {
    console.error('[auth.repository] preference categories insert failed', categories.error);
    throw toDatabaseUnavailable();
  }
}

export async function deleteUserById(userId: string): Promise<void> {
  const { error } = await getSupabaseClient().from('users').delete().eq('id', userId);
  if (error) {
    console.error('[auth.repository] compensating user delete failed', error);
  }
}

export async function insertPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('password_reset_tokens')
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error('[auth.repository] falha ao salvar token de recuperação', error);
    throw toDatabaseUnavailable();
  }
}

export async function invalidateUserResetTokens(userId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('used_at', null);

  if (error) {
    console.error('[auth.repository] falha ao invalidar tokens', error);
    throw toDatabaseUnavailable();
  }
}

export async function invalidateResetToken(tokenHash: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
    .is('used_at', null);

  if (error) {
    console.error('[auth.repository] falha ao invalidar token', error);
    throw toDatabaseUnavailable();
  }
}

/**
 * Consome o token e grava a nova senha numa única transação (função SQL
 * reset_password_with_token): só funciona se o token existir, ainda não
 * tiver sido usado e não tiver expirado. Se algo falhar, nada é gravado e o
 * link continua válido. Devolve o id do usuário, ou null se o token não vale.
 */
export async function resetPasswordWithToken(
  tokenHash: string,
  passwordHash: string,
): Promise<string | null> {
  const { data, error } = await getSupabaseClient().rpc('reset_password_with_token', {
    p_token_hash: tokenHash,
    p_password_hash: passwordHash,
  });

  if (error) {
    console.error('[auth.repository] reset_password_with_token failed', error);
    throw toDatabaseUnavailable();
  }

  return (data as string | null) ?? null;
}

export async function findLatestResetTokenCreatedAt(userId: string): Promise<Date | null> {
  const { data, error } = await getSupabaseClient()
    .from('password_reset_tokens')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ created_at: string }>();

  if (error) {
    console.error('[auth.repository] falha ao consultar ultimo token', error);
    throw toDatabaseUnavailable();
  }

  return data ? new Date(data.created_at) : null;
}

