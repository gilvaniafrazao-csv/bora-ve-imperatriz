import { fetchPlaceDetails, findNeighborhood, GooglePlace, searchPlacesText } from './places.repository';
import {
  LatLng,
  PlaceDetails,
  PlaceSearchInput,
  PlaceSearchResult,
  PlaceSummary,
} from './places.types';

/** Centro aproximado de Imperatriz (MA). */
const IMPERATRIZ: LatLng = { latitude: -5.5264, longitude: -47.4916 };

const CITY_RADIUS_METERS = 14000;
const NEIGHBORHOOD_RADIUS_METERS = 4000;
const NEAR_ME_RADIUS_METERS = 5000;
const NEAR_CITY_MAX_KM = 40;

const DEFAULT_QUERY = 'restaurantes, bares e cafés';

const CATEGORY_GROUPS: Record<string, string[]> = {
  restaurant: ['Restaurantes'],
  food: ['Restaurantes'],
  meal_takeaway: ['Restaurantes'],
  meal_delivery: ['Restaurantes'],
  ice_cream_shop: ['Restaurantes'],
  cafe: ['Cafeterias'],
  coffee_shop: ['Cafeterias'],
  bakery: ['Cafeterias'],
  bar: ['Bares', 'Vida Noturna'],
  pub: ['Bares', 'Vida Noturna'],
  wine_bar: ['Bares', 'Vida Noturna'],
  night_club: ['Vida Noturna'],
  museum: ['Cultura'],
  art_gallery: ['Cultura'],
  movie_theater: ['Cultura'],
  performing_arts_theater: ['Cultura'],
  library: ['Cultura'],
  shopping_mall: ['Compras'],
  clothing_store: ['Compras'],
  supermarket: ['Compras'],
  market: ['Compras'],
  store: ['Compras'],
  park: ['Ao ar livre'],
  tourist_attraction: ['Ao ar livre'],
  zoo: ['Ao ar livre'],
  gym: ['Esportes'],
  stadium: ['Esportes'],
  sports_complex: ['Esportes'],
};

export function distanceKm(from: LatLng, to: LatLng): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function priceSymbol(priceLevel: string | undefined): string {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE':
    case 'PRICE_LEVEL_INEXPENSIVE':
      return '$';
    case 'PRICE_LEVEL_MODERATE':
      return '$$';
    case 'PRICE_LEVEL_EXPENSIVE':
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return '$$$';
    default:
      return '';
  }
}

export function categoryGroups(primaryType: string | undefined): string[] {
  if (!primaryType) {
    return ['Lugares'];
  }
  if (CATEGORY_GROUPS[primaryType]) {
    return CATEGORY_GROUPS[primaryType];
  }
  if (primaryType.includes('restaurant')) {
    return ['Restaurantes'];
  }
  return ['Lugares'];
}

export async function searchPlaces(input: PlaceSearchInput): Promise<PlaceSearchResult> {
  const subject = input.query.trim() || DEFAULT_QUERY;
  const where = input.neighborhood ? `${input.neighborhood}, Imperatriz, MA` : 'Imperatriz, MA';

  let center = IMPERATRIZ;
  let radius = CITY_RADIUS_METERS;
  let label = 'Imperatriz, MA';
  let neighborhoodResolved = false;
  let usedDeviceLocation = false;

  if (
    input.latitude !== undefined &&
    input.longitude !== undefined &&
    distanceKm(IMPERATRIZ, { latitude: input.latitude, longitude: input.longitude }) <=
      NEAR_CITY_MAX_KM
  ) {
    center = { latitude: input.latitude, longitude: input.longitude };
    radius = NEAR_ME_RADIUS_METERS;
    label = 'Perto de você, em Imperatriz';
    usedDeviceLocation = true;
  }

  if (input.neighborhood) {
    const area = await findNeighborhood(input.neighborhood);
    if (area) {
      center = area.location;
      radius = NEIGHBORHOOD_RADIUS_METERS;
      label = `${area.name}, Imperatriz`;
      neighborhoodResolved = true;
      usedDeviceLocation = false;
    } else {
      label = `${input.neighborhood}, Imperatriz`;
    }
  }

  const googlePlaces = await searchPlacesText(`${subject} em ${where}`, center, radius);
  const places = googlePlaces
    .filter((place) => (place.formattedAddress ?? '').includes('Imperatriz'))
    .map((place) => toSummary(place, center))
    .filter((place): place is PlaceSummary => place !== null);

  return {
    query: subject,
    area: {
      label,
      latitude: center.latitude,
      longitude: center.longitude,
      neighborhoodResolved,
      usedDeviceLocation,
    },
    places,
  };
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const place = await fetchPlaceDetails(placeId);
  const name = place.displayName?.text?.trim();
  if (!name) {
    return {
      id: placeId,
      name: 'Lugar',
      category: place.primaryTypeDisplayName?.text?.trim() || 'Lugar',
      address: place.formattedAddress ?? '',
      rating: place.rating ?? null,
      reviewCount: place.userRatingCount ?? null,
      price: priceSymbol(place.priceLevel),
      phone: place.nationalPhoneNumber ?? null,
      website: place.websiteUri ?? null,
      mapsUrl: place.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}`,
      photosUrl: place.googleMapsLinks?.photosUri ?? null,
      latitude: place.location?.latitude ?? null,
      longitude: place.location?.longitude ?? null,
      weekdayHours: place.regularOpeningHours?.weekdayDescriptions ?? [],
    };
  }

  return {
    id: place.id || placeId,
    name,
    category: place.primaryTypeDisplayName?.text?.trim() || 'Lugar',
    address: place.formattedAddress ?? '',
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    price: priceSymbol(place.priceLevel),
    phone: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    mapsUrl: place.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}`,
    photosUrl: place.googleMapsLinks?.photosUri ?? null,
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    weekdayHours: place.regularOpeningHours?.weekdayDescriptions ?? [],
  };
}

function toSummary(place: GooglePlace, center: LatLng): PlaceSummary | null {
  const id = place.id;
  const name = place.displayName?.text?.trim();
  if (!id || !name) {
    return null;
  }

  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  const hasLocation = latitude !== undefined && longitude !== undefined;
  const groups = categoryGroups(place.primaryType);
  const category = place.primaryTypeDisplayName?.text?.trim() || groups[0] || 'Lugar';

  return {
    id,
    name,
    category,
    categories: groups,
    address: place.formattedAddress ?? '',
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    price: priceSymbol(place.priceLevel),
    openNow: place.currentOpeningHours?.openNow ?? null,
    latitude: hasLocation ? latitude : null,
    longitude: hasLocation ? longitude : null,
    distanceKm: hasLocation ? round1(distanceKm(center, { latitude, longitude })) : null,
    mapsUrl: place.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Imperatriz')}`,
    photosUrl: place.googleMapsLinks?.photosUri ?? null,
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
