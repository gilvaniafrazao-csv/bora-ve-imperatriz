import { getSupabaseClient } from '../../config/supabase';
import { AppError } from '../../shared/errors/AppError';
import { PublicUser, RegisterInput, UserRow } from './auth.types';
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

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('id')
    .ilike('email', email)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw toDatabaseUnavailable();
  }

  return data?.id ?? null;
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
