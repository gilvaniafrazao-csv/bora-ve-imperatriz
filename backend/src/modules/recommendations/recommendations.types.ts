export interface Recommendation {
  id: string;
  name: string;
  description: string | null;
  neighborhood: string | null;
  city: string;
  priceRange: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface EstablishmentRow {
  id: string;
  name: string;
  description: string | null;
  neighborhood: string | null;
  city: string;
  price_range: string | null;
  latitude: number | null;
  longitude: number | null;
}
