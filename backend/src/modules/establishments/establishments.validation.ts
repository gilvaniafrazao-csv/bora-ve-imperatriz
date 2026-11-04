import { AppError } from '../../shared/errors/AppError';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseEstablishmentId(value: unknown): string {
  const id = typeof value === 'string' ? value.trim() : '';

  if (!UUID_REGEX.test(id)) {
    throw new AppError('Identificador de estabelecimento inválido.', 400, 'VALIDATION_ERROR', [
      { field: 'id', message: 'Informe um identificador válido.' },
    ]);
  }

  return id.toLowerCase();
}