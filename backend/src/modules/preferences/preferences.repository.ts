import { getSupabaseClient } from '../../config/supabase';
import { AppError } from '../../shared/errors/AppError';
import { PreferencesRow, PriceRange } from './preferences.types';

const FOREIGN_KEY_VIOLATION = '23503';

function toDatabaseUnavailable(): AppError {
  return new AppError(
    'Não foi possível processar as preferências. Tente novamente mais tarde.',
    503,
    'DATABASE_UNAVAILABLE',
  );
}

export async function findPreferencesRow(userId: string): Promise<PreferencesRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('user_preferences')
    .select('price_range, updated_at')
    .eq('user_id', userId)
    .maybeSingle<PreferencesRow>();

  if (error) {
    console.error('[preferences.repository] select preferences failed', error);
    throw toDatabaseUnavailable();
  }
  return data ?? null;
}

type CategoryLink = { category_id: string; category: { slug: string } | null };

async function findCategoryLinks(userId: string): Promise<CategoryLink[]> {
  const { data, error } = await getSupabaseClient()
    .from('user_preference_categories')
    .select('category_id, category:categories(slug)')
    .eq('user_id', userId)
    .returns<CategoryLink[]>();

  if (error || !data) {
    console.error('[preferences.repository] select categories failed', error);
    throw toDatabaseUnavailable();
  }
  return data;
}

export async function findCategorySlugsByUser(userId: string): Promise<string[]> {
  const links = await findCategoryLinks(userId);
  return links.flatMap((link) => (link.category ? [link.category.slug] : []));
}

/**
 * Substitui as preferências do usuário (faixa de preço + categorias) de forma
 * atômica: tudo é feito pela função SQL `replace_user_preferences` numa única
 * transação, que também serializa atualizações simultâneas do mesmo usuário
 * e sempre atualiza `updated_at`. Ver supabase/migrations/20261007120000_*.
 */
export async function replacePreferences(
  userId: string,
  categoryIds: string[],
  priceRange: PriceRange | null | undefined,
): Promise<void> {
  const { error } = await getSupabaseClient().rpc('replace_user_preferences', {
    p_user_id: userId,
    p_category_ids: categoryIds,
    p_set_price_range: priceRange !== undefined,
    p_price_range: priceRange ?? null,
  });

  if (error) {
    if (error.code === FOREIGN_KEY_VIOLATION) {
      throw new AppError('Sessão inválida ou expirada. Faça login novamente.', 401, 'UNAUTHORIZED');
    }
    console.error('[preferences.repository] replace_user_preferences failed', error);
    throw toDatabaseUnavailable();
  }
}
