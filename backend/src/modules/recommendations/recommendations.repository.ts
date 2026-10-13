import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../shared/errors/AppError";
import { EstablishmentRow } from "./recommendations.types";

function databaseUnavailable(): AppError {
  return new AppError(
    "Não foi possível carregar as recomendações.",
    503,
    "DATABASE_UNAVAILABLE",
  );
}

export async function findPreferenceCategoryIds(
  userId: string,
): Promise<string[]> {
  const { data, error } = await getSupabaseClient()
    .from("user_preference_categories")
    .select("category_id")
    .eq("user_id", userId);

  if (error) {
    console.error(
      "[recommendations.repository] preferences query failed",
      error,
    );
    throw databaseUnavailable();
  }

  return (data ?? []).map((row: { category_id: string }) => row.category_id);
}

export async function findEstablishmentIdsByCategories(
  categoryIds: string[],
): Promise<string[]> {
  if (categoryIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseClient()
    .from("establishment_categories")
    .select("establishment_id")
    .in("category_id", categoryIds);

  if (error) {
    console.error(
      "[recommendations.repository] establishment categories query failed",
      error,
    );
    throw databaseUnavailable();
  }

  return [
    ...new Set(
      (data ?? []).map(
        (row: { establishment_id: string }) => row.establishment_id,
      ),
    ),
  ];
}

export async function findActiveEstablishmentsByIds(
  establishmentIds: string[],
): Promise<EstablishmentRow[]> {
  if (establishmentIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseClient()
    .from("establishments")
    .select(
      "id, name, description, neighborhood, city, price_range, latitude, longitude",
    )
    .in("id", establishmentIds)
    .eq("status", "ativo")
    .limit(12);

  if (error) {
    console.error(
      "[recommendations.repository] establishments query failed",
      error,
    );
    throw databaseUnavailable();
  }

  return (data ?? []) as EstablishmentRow[];
}

export async function findActiveEstablishments(
  limit = 12,
): Promise<EstablishmentRow[]> {
  const { data, error } = await getSupabaseClient()
    .from("establishments")
    .select(
      "id, name, description, neighborhood, city, price_range, latitude, longitude",
    )
    .eq("status", "ativo")
    .limit(limit);

  if (error) {
    console.error("[recommendations.repository] fallback query failed", error);
    throw databaseUnavailable();
  }

  return (data ?? []) as EstablishmentRow[];
}
