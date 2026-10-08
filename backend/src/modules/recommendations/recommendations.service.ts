import {
  findActiveEstablishments,
  findActiveEstablishmentsByIds,
  findEstablishmentIdsByCategories,
  findPreferenceCategoryIds,
} from './recommendations.repository';
import {
  EstablishmentRow,
  Recommendation,
} from './recommendations.types';

function toRecommendation(row: EstablishmentRow): Recommendation {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    neighborhood: row.neighborhood,
    city: row.city,
    priceRange: row.price_range,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

export interface RecommendationRepository {
  findPreferenceCategoryIds(userId: string): Promise<string[]>;

  findEstablishmentIdsByCategories(
    categoryIds: string[],
  ): Promise<string[]>;

  findActiveEstablishmentsByIds(
    establishmentIds: string[],
  ): Promise<EstablishmentRow[]>;

  findActiveEstablishments(limit?: number): Promise<EstablishmentRow[]>;
}

const repository: RecommendationRepository = {
  findPreferenceCategoryIds,
  findEstablishmentIdsByCategories,
  findActiveEstablishmentsByIds,
  findActiveEstablishments,
};

export async function getRecommendations(
  userId: string,
  repo: RecommendationRepository = repository,
): Promise<Recommendation[]> {
  const categoryIds = await repo.findPreferenceCategoryIds(userId);

  if (categoryIds.length === 0) {
    const fallback = await repo.findActiveEstablishments();
    return fallback.map(toRecommendation);
  }

  const establishmentIds =
    await repo.findEstablishmentIdsByCategories(categoryIds);

  if (establishmentIds.length === 0) {
    const fallback = await repo.findActiveEstablishments();
    return fallback.map(toRecommendation);
  }

  const establishments =
    await repo.findActiveEstablishmentsByIds(establishmentIds);

  if (establishments.length === 0) {
    const fallback = await repo.findActiveEstablishments();
    return fallback.map(toRecommendation);
  }

  return establishments.map(toRecommendation);
}