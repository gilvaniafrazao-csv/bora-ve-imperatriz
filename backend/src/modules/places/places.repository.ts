import { AppError } from '../../shared/errors/AppError';
import { env } from '../../config/env';
import { LatLng } from './places.types';

const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

const SEARCH_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.location',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.googleMapsUri',
  'places.googleMapsLinks.photosUri',
  'places.priceLevel',
  'places.currentOpeningHours.openNow',
].join(',');

const AREA_FIELD_MASK = [
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
].join(',');

const DETAILS_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'rating',
  'userRatingCount',
  'googleMapsUri',
  'googleMapsLinks.photosUri',
  'nationalPhoneNumber',
  'websiteUri',
  'regularOpeningHours.weekdayDescriptions',
  'priceLevel',
  'primaryTypeDisplayName',
  'location',
].join(',');

export type GooglePlace = {
  id?: string;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  googleMapsLinks?: { photosUri?: string };
  priceLevel?: string;
  primaryType?: string;
  types?: string[];
  displayName?: { text?: string };
  primaryTypeDisplayName?: { text?: string };
  currentOpeningHours?: { openNow?: boolean };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
};

type GoogleSearchResponse = {
  places?: GooglePlace[];
};

function apiKey(): string {
  if (!env.googleMapsApiKey) {
    throw new AppError(
      'A busca de lugares ainda não está configurada (GOOGLE_MAPS_API_KEY).',
      503,
      'PLACES_NOT_CONFIGURED',
    );
  }
  return env.googleMapsApiKey;
}

async function placesFetch(url: string, init: RequestInit, fieldMask: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey(),
        'X-Goog-FieldMask': fieldMask,
        ...init.headers,
      },
      signal: AbortSignal.timeout(12000),
    });
  } catch (error) {
    console.error('[places] falha de rede', error);
    throw new AppError(
      'Não foi possível consultar o Google Maps agora. Tente de novo em instantes.',
      503,
      'PLACES_UNAVAILABLE',
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[places] google respondeu', response.status, body.slice(0, 400));
    if (response.status === 404) {
      throw new AppError('Lugar não encontrado.', 404, 'PLACE_NOT_FOUND');
    }
    throw new AppError(
      'Não foi possível consultar o Google Maps agora. Tente de novo em instantes.',
      503,
      'PLACES_UNAVAILABLE',
    );
  }

  return response;
}

export async function searchPlacesText(
  textQuery: string,
  center: LatLng,
  radiusMeters: number,
): Promise<GooglePlace[]> {
  const response = await placesFetch(
    TEXT_SEARCH_URL,
    {
      method: 'POST',
      body: JSON.stringify({
        textQuery,
        languageCode: 'pt-BR',
        regionCode: 'BR',
        pageSize: 12,
        locationBias: {
          circle: {
            center,
            radius: radiusMeters,
          },
        },
      }),
    },
    SEARCH_FIELD_MASK,
  );

  const payload = (await response.json()) as GoogleSearchResponse;
  return payload.places ?? [];
}

/** Acha um bairro dentro de Imperatriz para centralizar a busca. */
export async function findNeighborhood(name: string): Promise<{ name: string; location: LatLng } | null> {
  const response = await placesFetch(
    TEXT_SEARCH_URL,
    {
      method: 'POST',
      body: JSON.stringify({
        textQuery: `${name}, Imperatriz, MA, Brasil`,
        languageCode: 'pt-BR',
        regionCode: 'BR',
        pageSize: 5,
        locationBias: {
          circle: {
            center: { latitude: -5.5264, longitude: -47.4916 },
            radius: 20000,
          },
        },
      }),
    },
    AREA_FIELD_MASK,
  );

  const payload = (await response.json()) as GoogleSearchResponse;
  const match = (payload.places ?? []).find((place) => {
    const address = place.formattedAddress ?? '';
    const latitude = place.location?.latitude;
    const longitude = place.location?.longitude;
    return address.includes('Imperatriz') && latitude !== undefined && longitude !== undefined;
  });

  if (!match?.location?.latitude || match.location.longitude === undefined) {
    return null;
  }

  return {
    name: match.displayName?.text?.trim() || name,
    location: {
      latitude: match.location.latitude,
      longitude: match.location.longitude,
    },
  };
}

export async function fetchPlaceDetails(placeId: string): Promise<GooglePlace> {
  const response = await placesFetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    { method: 'GET' },
    DETAILS_FIELD_MASK,
  );
  return (await response.json()) as GooglePlace;
}
