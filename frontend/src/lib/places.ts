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
  places: PlaceSummary[];
};

export function searchPlaces(
  params: {
    q?: string;
    bairro?: string;
    lat?: string | null;
    lon?: string | null;
  },
  signal?: AbortSignal,
) {
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

  const query = search.toString();
  return apiRequest<PlaceSearchResponse>(`/api/places/search${query ? `?${query}` : ""}`, {
    signal,
  });
}
