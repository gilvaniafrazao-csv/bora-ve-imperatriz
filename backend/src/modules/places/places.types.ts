export type LatLng = {
  latitude: number;
  longitude: number;
};

/** Grupos de categoria exibidos nos filtros (mesmos nomes de `categoryGroups`). */
export const PLACE_CATEGORIES = [
  'Restaurantes',
  'Cafeterias',
  'Bares',
  'Vida Noturna',
  'Cultura',
  'Compras',
  'Ao ar livre',
  'Esportes',
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const PLACE_PRICES = ['$', '$$', '$$$'] as const;
export type PlacePrice = (typeof PLACE_PRICES)[number];

export const PLACE_SORTS = ['relevancia', 'nota', 'distancia'] as const;
export type PlaceSort = (typeof PLACE_SORTS)[number];

export const MIN_RADIUS_KM = 0.5;
export const MAX_RADIUS_KM = 40;

/** Filtros opcionais da busca; sem nenhum, a busca se comporta como antes. */
export type PlaceFilters = {
  category?: PlaceCategory;
  /** Qualquer uma das faixas informadas; vazio = todas. */
  prices: PlacePrice[];
  /** Distância máxima, em km, a partir do centro da busca (você, o bairro ou o centro da cidade). */
  maxDistanceKm?: number;
  openNow: boolean;
  sort: PlaceSort;
};

export type PlaceSearchInput = PlaceFilters & {
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
  /** Filtros que valeram nesta busca (já normalizados). */
  filters: {
    category: PlaceCategory | null;
    prices: PlacePrice[];
    maxDistanceKm: number | null;
    openNow: boolean;
    sort: PlaceSort;
  };
  /** Quantidade de lugares devolvidos depois dos filtros. */
  total: number;
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
