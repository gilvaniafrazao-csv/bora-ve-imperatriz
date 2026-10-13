import { findCategoryIdsBySlugs } from '../auth/auth.repository';
import { MIN_ONBOARDING_CATEGORIES } from '../auth/onboarding-categories';
import {
  findCategorySlugsByUser,
  findPreferencesRow,
  replacePreferences,
} from './preferences.repository';
import { UserPreferences } from './preferences.types';
import { parseUpdatePreferencesBody } from './preferences.validation';

/**
 * Consulta as preferências do usuário (RF03) para uso nas recomendações.
 * Usuário sem onboarding concluído recebe lista vazia, não erro.
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const [row, slugs] = await Promise.all([
    findPreferencesRow(userId),
    findCategorySlugsByUser(userId),
  ]);

  const categorySlugs = [...slugs].sort();
  return {
    categorySlugs,
    priceRange: row?.price_range ?? null,
    onboardingCompleted: categorySlugs.length >= MIN_ONBOARDING_CATEGORIES,
    updatedAt: row?.updated_at ?? null,
  };
}

/**
 * Registra/atualiza as preferências do usuário (RF03). Substitui o conjunto
 * de categorias pelo enviado, então serve tanto para o onboarding quanto
 * para a edição posterior.
 */
export async function updateUserPreferences(
  userId: string,
  body: unknown,
): Promise<UserPreferences> {
  const input = parseUpdatePreferencesBody(body);
  const categoryIds = await findCategoryIdsBySlugs(input.categorySlugs);
  await replacePreferences(userId, categoryIds, input.priceRange);
  return getUserPreferences(userId);
}
