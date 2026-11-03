export type PriceRange = 'economico' | 'moderado' | 'premium';

export type CategoryRow = {
  slug: string;
  name: string;
  category_group: string;
};

export type PhotoRow = {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_cover: boolean;
};

export type EstablishmentRow = {
  id: string;
  name: string;
  description: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  social_links: Record<string, unknown> | null;
  opening_hours: unknown;
  price_range: PriceRange | null;
  establishment_categories: Array<{ categories: CategoryRow | null }> | null;
  establishment_photos: PhotoRow[] | null;
};

export type EstablishmentDetails = {
  id: string;
  name: string;
  description: string | null;
  address: {
    street: string | null;
    number: string | null;
    neighborhood: string | null;
    city: string;
    state: string;
    postalCode: string | null;
  };
  latitude: number | null;
  longitude: number | null;
  contact: {
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    website: string | null;
  };
  socialLinks: Record<string, unknown>;
  openingHours: unknown;
  priceRange: PriceRange | null;
  categories: Array<{ slug: string; name: string; group: string }>;
  photos: Array<{ id: string; url: string; alt: string | null; isCover: boolean }>;
};