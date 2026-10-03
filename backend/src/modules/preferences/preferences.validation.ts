import { AppError } from '../../shared/errors/AppError';
import { parseCategorySlugs } from '../auth/auth.validation';
import { FieldError } from '../auth/auth.types';
import { PRICE_RANGES, PriceRange, UpdatePreferencesInput } from './preferences.types';

function isPriceRange(value: unknown): value is PriceRange {
  return typeof value === 'string' && (PRICE_RANGES as readonly string[]).includes(value);
}

/**
 * Valida o corpo de PUT /api/preferences (RF03).
 * `categorySlugs` é obrigatório (mínimo de 3, mesmas regras do cadastro);
 * `priceRange` é opcional (`null` limpa, ausente mantém o valor atual).
 */
export function parseUpdatePreferencesBody(body: unknown): UpdatePreferencesInput {
  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const errors: FieldError[] = [];

  const categorySlugs = parseCategorySlugs(payload.categorySlugs, errors);

  let priceRange: UpdatePreferencesInput['priceRange'];
  if (payload.priceRange === undefined) {
    priceRange = undefined;
  } else if (payload.priceRange === null || isPriceRange(payload.priceRange)) {
    priceRange = payload.priceRange;
  } else {
    errors.push({
      field: 'priceRange',
      message: `Faixa de preço inválida. Use: ${PRICE_RANGES.join(', ')}.`,
    });
  }

  if (errors.length > 0) {
    throw new AppError('Dados inválidos para preferências.', 400, 'VALIDATION_ERROR', errors);
  }

  return { categorySlugs, priceRange };
}
