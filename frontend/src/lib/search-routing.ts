export type SearchType = "lugares" | "eventos";

const eventKeywords = [
  "show",
  "shows",
  "festival",
  "festivais",
  "evento",
  "eventos",
  "concerto",
  "apresentacao",
  "espetaculo",
  "feira",
  "exposicao",
  "palestra",
  "workshop",
  "musica ao vivo",
];

const placeKeywords = [
  "restaurante",
  "pizza",
  "pizzaria",
  "bar",
  "cafeteria",
  "cafe",
  "hamburgueria",
  "shopping",
  "loja",
  "parque",
  "hotel",
  "sorveteria",
  "churrascaria",
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function detectSearchType(
  search: string,
  fallback: SearchType = "lugares",
): SearchType {
  const normalized = normalizeText(search);

  const containsKeyword = (keywords: string[]) =>
    keywords.some((keyword) =>
      new RegExp(`(^|\\W)${keyword}(?=\\W|$)`, "i").test(normalized),
    );

  const hasEvent = containsKeyword(eventKeywords);
  const hasPlace = containsKeyword(placeKeywords);

  if (hasEvent && !hasPlace) return "eventos";
  if (hasPlace && !hasEvent) return "lugares";

  return fallback;
}

export function buildSearchUrl(
  search: string,
  fallback: SearchType = "lugares",
) {
  const term = search.trim();
  const tipo = detectSearchType(term, fallback);

  const params = new URLSearchParams({ tipo });

  if (term) {
    params.set("busca", term);
  }

  return `/explorar?${params.toString()}`;
}
