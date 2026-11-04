import { AppError } from '../../shared/errors/AppError';
import {
  MAX_RADIUS_KM,
  MIN_RADIUS_KM,
  PLACE_CATEGORIES,
  PLACE_PRICES,
  PLACE_SORTS,
  PlaceCategory,
  PlacePrice,
  PlaceSearchInput,
  PlaceSort,
} from './places.types';

const MAX_TEXT = 80;
const MAX_FILTER_LIST = 10;

type FieldError = { field: string; message: string };

/** Minúsculas e sem acentos, para "ao ar livre" e "Vida noturna" casarem com os nomes dos grupos. */
function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/** Aceita `a,b` e `?x=a&x=b`; devolve itens sem vazios (ou null se algum item não for texto). */
function stringList(value: unknown): string[] | null {
  if (value === undefined) {
    return [];
  }
  const parts = Array.isArray(value) ? value : [value];
  if (parts.some((part) => typeof part !== 'string')) {
    return null;
  }
  return (parts as string[])
    .flatMap((part) => part.split(','))
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function parseCategory(value: unknown, errors: FieldError[]): PlaceCategory | undefined {
  const raw = firstString(value);
  if (raw === undefined || ['todos', 'todas'].includes(fold(raw))) {
    return undefined;
  }
  const match = PLACE_CATEGORIES.find((category) => fold(category) === fold(raw));
  if (!match) {
    errors.push({
      field: 'categoria',
      message: `Categoria inválida. Use: ${PLACE_CATEGORIES.join(', ')}.`,
    });
  }
  return match;
}

function parsePrices(value: unknown, errors: FieldError[]): PlacePrice[] {
  const items = stringList(value);
  if (items === null || items.length > MAX_FILTER_LIST) {
    errors.push({ field: 'preco', message: `Use ${PLACE_PRICES.join(', ')}.` });
    return [];
  }
  const unique = [...new Set(items)];
  if (unique.some((item) => !(PLACE_PRICES as readonly string[]).includes(item))) {
    errors.push({ field: 'preco', message: `Faixa de preço inválida. Use: ${PLACE_PRICES.join(', ')}.` });
    return [];
  }
  return unique as PlacePrice[];
}

function parseRadius(value: unknown, errors: FieldError[]): number | undefined {
  const raw = firstString(value);
  if (raw === undefined) {
    return undefined;
  }
  const parsed = Number(raw.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < MIN_RADIUS_KM || parsed > MAX_RADIUS_KM) {
    errors.push({
      field: 'raioKm',
      message: `Informe uma distância entre ${MIN_RADIUS_KM} e ${MAX_RADIUS_KM} km.`,
    });
    return undefined;
  }
  return parsed;
}

function parseBoolean(value: unknown, field: string, errors: FieldError[]): boolean {
  const raw = firstString(value);
  if (raw === undefined) {
    return false;
  }
  const normalized = fold(raw);
  if (['true', '1', 'sim'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'nao'].includes(normalized)) {
    return false;
  }
  errors.push({ field, message: 'Use true ou false.' });
  return false;
}

function parseSort(value: unknown, errors: FieldError[]): PlaceSort {
  const raw = firstString(value);
  if (raw === undefined) {
    return 'relevancia';
  }
  const match = PLACE_SORTS.find((sort) => sort === fold(raw));
  if (!match) {
    errors.push({ field: 'ordenar', message: `Ordenação inválida. Use: ${PLACE_SORTS.join(', ')}.` });
    return 'relevancia';
  }
  return match;
}

function firstString(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseCoordinate(
  value: unknown,
  min: number,
  max: number,
  field: string,
): number | undefined {
  const raw = firstString(value);
  if (raw === undefined) {
    return undefined;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new AppError(`Coordenada inválida: ${field}.`, 400, 'VALIDATION_ERROR', [
      { field, message: `Informe um número entre ${min} e ${max}.` },
    ]);
  }
  return parsed;
}

/**
 * Lê a busca da home/explorar.
 * `q` é o que a pessoa procura. `bairro` é opcional.
 * `lat`/`lon` entram quando ela escolhe "Perto de mim".
 */
export function parsePlaceSearchQuery(query: Record<string, unknown>): PlaceSearchInput {
  const text = firstString(query.q ?? query.busca) ?? '';
  const neighborhoodRaw = firstString(query.bairro ?? query.neighborhood ?? query.regiao);
  const latitude = parseCoordinate(query.lat ?? query.latitude, -90, 90, 'lat');
  const longitude = parseCoordinate(query.lon ?? query.lng ?? query.longitude, -180, 180, 'lon');

  if (text.length > MAX_TEXT) {
    throw new AppError('A busca pode ter no máximo 80 caracteres.', 400, 'VALIDATION_ERROR', [
      { field: 'q', message: 'Use no máximo 80 caracteres.' },
    ]);
  }

  if (neighborhoodRaw && neighborhoodRaw.length > MAX_TEXT) {
    throw new AppError('O bairro pode ter no máximo 80 caracteres.', 400, 'VALIDATION_ERROR', [
      { field: 'bairro', message: 'Use no máximo 80 caracteres.' },
    ]);
  }

  if ((latitude === undefined) !== (longitude === undefined)) {
    throw new AppError('Informe latitude e longitude juntas.', 400, 'VALIDATION_ERROR', [
      { field: 'lat', message: 'lat e lon precisam vir no mesmo pedido.' },
    ]);
  }

  const neighborhood =
    neighborhoodRaw && neighborhoodRaw.toLowerCase() !== 'perto de mim'
      ? neighborhoodRaw
      : undefined;

  // Filtros (todos opcionais): categoria, preco, raioKm, aberto, ordenar.
  const filterErrors: FieldError[] = [];
  const category = parseCategory(query.categoria ?? query.category, filterErrors);
  const prices = parsePrices(query.preco ?? query.price, filterErrors);
  const maxDistanceKm = parseRadius(query.raioKm ?? query.raio, filterErrors);
  const openNow = parseBoolean(query.aberto ?? query.openNow, 'aberto', filterErrors);
  const sort = parseSort(query.ordenar ?? query.sort, filterErrors);

  if (filterErrors.length > 0) {
    throw new AppError('Filtros de busca inválidos.', 400, 'VALIDATION_ERROR', filterErrors);
  }

  return {
    query: text,
    neighborhood,
    latitude,
    longitude,
    category,
    prices,
    maxDistanceKm,
    openNow,
    sort,
  };
}

export function parsePlaceId(value: string): string {
  const id = value.trim();
  if (!/^[A-Za-z0-9_-]{8,200}$/.test(id)) {
    throw new AppError('Identificador de lugar inválido.', 400, 'VALIDATION_ERROR');
  }
  return id;
}
