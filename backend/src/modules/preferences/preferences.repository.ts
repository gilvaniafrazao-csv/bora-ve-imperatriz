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
 * Substitui as preferências do usuário. O Supabase JS não expõe transações,
 * então a ordem das operações evita deixar o usuário com menos categorias
 * do que tinha caso algo falhe no meio: primeiro grava o que é novo,
 * só depois remove o que saiu.
 */
export async function replacePreferences(
  userId: string,
  categoryIds: string[],
  priceRange: PriceRange | null | undefined,
): Promise<void> {
  const client = getSupabaseClient();

  const upsert = await client
    .from('user_preferences')
    .upsert(
      priceRange === undefined ? { user_id: userId } : { user_id: userId, price_range: priceRange },
      { onConflict: 'user_id', ignoreDuplicates: priceRange === undefined },
    );
  if (upsert.error) {
    if (upsert.error.code === FOREIGN_KEY_VIOLATION) {
      throw new AppError('Sessão inválida ou expirada. Faça login novamente.', 401, 'UNAUTHORIZED');
    }
    console.error('[preferences.repository] upsert preferences failed', upsert.error);
    throw toDatabaseUnavailable();
  }

  const currentIds = (await findCategoryLinks(userId)).map((link) => link.category_id);
  const toAdd = categoryIds.filter((id) => !currentIds.includes(id));
  const toRemove = currentIds.filter((id) => !categoryIds.includes(id));

  if (toAdd.length > 0) {
    const inserted = await client
      .from('user_preference_categories')
      .insert(toAdd.map((categoryId) => ({ user_id: userId, category_id: categoryId })));
    if (inserted.error) {
      console.error('[preferences.repository] insert categories failed', inserted.error);
      throw toDatabaseUnavailable();
    }
  }

  if (toRemove.length > 0) {
    const removed = await client
      .from('user_preference_categories')
      .delete()
      .eq('user_id', userId)
      .in('category_id', toRemove);
    if (removed.error) {
      console.error('[preferences.repository] delete categories failed', removed.error);
      throw toDatabaseUnavailable();
    }
  }
}
