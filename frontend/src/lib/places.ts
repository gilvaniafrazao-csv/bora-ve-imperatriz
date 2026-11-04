import { apiRequest } from "@/lib/api";

export type PlaceSummary = {
  id: string;
  name: string;
  category: string;
  categories: string[];
  address: string;
  rating: number | null;
  reviewCount: number | null;
  price: string;
  openNow: boolean | null;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  mapsUrl: string;
  photosUrl: string | null;
};

export type PlaceSearchResponse = {
  query: string;
  area: {
    label: string;
    latitude: number;
    longitude: number;
    neighborhoodResolved: boolean;
    usedDeviceLocation: boolean;
  };
  /** Só vêm de uma API com filtros; ficam opcionais por segurança. */
  filters?: {
    category: string | null;
    prices: string[];
    maxDistanceKm: number | null;
    openNow: boolean;
    sort: PlaceSort;
  };
  total?: number;
  places: PlaceSummary[];
};

export type PlaceSort = "relevancia" | "nota" | "distancia";

export type PlaceSearchParams = {
  q?: string;
  bairro?: string;
  lat?: string | null;
  lon?: string | null;
  /** Nome do grupo (ex.: "Bares"); "Todos" ou vazio não filtra. */
  categoria?: string;
  /** "$", "$$" ou "$$$"; vazio não filtra. */
  preco?: string;
  /** Distância máxima em km, a partir de você, do bairro ou do centro. */
  raioKm?: number;
  aberto?: boolean;
  ordenar?: PlaceSort;
};

export function searchPlaces(params: PlaceSearchParams, signal?: AbortSignal) {
  const search = new URLSearchParams();

  if (params.q?.trim()) {
    search.set("q", params.q.trim());
  }
  if (params.bairro?.trim()) {
    search.set("bairro", params.bairro.trim());
  }
  if (params.lat && params.lon) {
    search.set("lat", params.lat);
    search.set("lon", params.lon);
  }
  if (params.categoria && params.categoria !== "Todos") {
    search.set("categoria", params.categoria);
  }
  if (params.preco) {
    search.set("preco", params.preco);
  }
  if (params.raioKm !== undefined) {
    search.set("raioKm", String(params.raioKm));
  }
  if (params.aberto) {
    search.set("aberto", "true");
  }
  if (params.ordenar && params.ordenar !== "relevancia") {
    search.set("ordenar", params.ordenar);
  }

  const query = search.toString();
  return apiRequest<PlaceSearchResponse>(`/api/places/search${query ? `?${query}` : ""}`, {
    signal,
  });
}
