import { AppError } from '../../shared/errors/AppError';
import { PlaceSearchInput } from './places.types';

const MAX_TEXT = 80;

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

  return {
    query: text,
    neighborhood,
    latitude,
    longitude,
  };
}

export function parsePlaceId(value: string): string {
  const id = value.trim();
  if (!/^[A-Za-z0-9_-]{8,200}$/.test(id)) {
    throw new AppError('Identificador de lugar inválido.', 400, 'VALIDATION_ERROR');
  }
  return id;
}
