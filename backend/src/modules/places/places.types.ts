export type LatLng = {
  latitude: number;
  longitude: number;
};

export type PlaceSearchInput = {
  /** Vazio significa a descoberta padrão da cidade (restaurantes, bares e cafés). */
  query: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
};

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
  /** Galeria oficial no Google Maps. A chave não devolve o arquivo da foto. */
  photosUrl: string | null;
};

export type PlaceSearchArea = {
  label: string;
  latitude: number;
  longitude: number;
  neighborhoodResolved: boolean;
  usedDeviceLocation: boolean;
};

export type PlaceSearchResult = {
  query: string;
  area: PlaceSearchArea;
  places: PlaceSummary[];
};

export type PlaceDetails = {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number | null;
  reviewCount: number | null;
  price: string;
  phone: string | null;
  website: string | null;
  mapsUrl: string;
  photosUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  weekdayHours: string[];
};
