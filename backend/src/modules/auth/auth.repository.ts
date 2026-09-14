import { getSupabaseClient } from '../../config/supabase';
import { AppError } from '../../shared/errors/AppError';
import { PublicUser, RegisterInput, UserRow } from './auth.types';

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
