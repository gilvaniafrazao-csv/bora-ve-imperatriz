import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getRecommendations,
  RecommendationRepository,
} from "./recommendations.service";
import { EstablishmentRow } from "./recommendations.types";

const personalized: EstablishmentRow = {
  id: "establishment-1",
  name: "Pizzaria Teste",
  description: "Pizza artesanal",
  neighborhood: "Centro",
  city: "Imperatriz",
  price_range: "$$",
  latitude: null,
  longitude: null,
};

const fallback: EstablishmentRow = {
  id: "establishment-2",
  name: "Café Teste",
  description: "Cafeteria",
  neighborhood: "Centro",
  city: "Imperatriz",
  price_range: "$",
  latitude: null,
  longitude: null,
};

function createRepository(
  overrides: Partial<RecommendationRepository> = {},
): RecommendationRepository {
  return {
    findPreferenceCategoryIds: async () => ["category-1"],
    findEstablishmentIdsByCategories: async () => ["establishment-1"],
    findActiveEstablishmentsByIds: async () => [personalized],
    findActiveEstablishments: async () => [fallback],
    ...overrides,
  };
}

describe("getRecommendations", () => {
  it("retorna estabelecimentos compatíveis com as preferências", async () => {
    const result = await getRecommendations("user-1", createRepository());

    assert.equal(result.length, 1);
    assert.equal(result[0].id, "establishment-1");
    assert.equal(result[0].name, "Pizzaria Teste");
  });

  it("usa fallback quando o usuário não possui preferências", async () => {
    const repo = createRepository({
      findPreferenceCategoryIds: async () => [],
    });

    const result = await getRecommendations("user-1", repo);

    assert.equal(result.length, 1);
    assert.equal(result[0].id, "establishment-2");
  });

  it("usa fallback quando não existem estabelecimentos compatíveis", async () => {
    const repo = createRepository({
      findEstablishmentIdsByCategories: async () => [],
    });

    const result = await getRecommendations("user-1", repo);

    assert.equal(result.length, 1);
    assert.equal(result[0].id, "establishment-2");
  });

  it("usa fallback quando os estabelecimentos compatíveis não estão ativos", async () => {
    const repo = createRepository({
      findActiveEstablishmentsByIds: async () => [],
    });

    const result = await getRecommendations("user-1", repo);

    assert.equal(result.length, 1);
    assert.equal(result[0].id, "establishment-2");
  });
});
