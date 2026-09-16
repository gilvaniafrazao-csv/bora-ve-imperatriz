import { AppError } from '../../shared/errors/AppError';
import {
  MIN_ONBOARDING_CATEGORIES,
  OnboardingCategorySlug,
  isOnboardingCategorySlug,
} from './onboarding-categories';
import { FieldError, LoginInput, RegisterInput } from './auth.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;
const MAX_PASSWORD_LENGTH = 72;

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  return value.trim();
}

/**
 * Valida o corpo de POST /api/auth/register (RF01 + RF03).
 * Campos da tela de CADASTRO + pelo menos 3 categorias da tela de PREFERÊNCIAS.
 */
export function parseRegisterBody(body: unknown): RegisterInput {
  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const errors: FieldError[] = [];

  const name = asTrimmedString(payload.name);
  const emailRaw = asTrimmedString(payload.email);
  const password = typeof payload.password === 'string' ? payload.password : null;
  const categorySlugs = parseCategorySlugs(payload.categorySlugs, errors);

  if (!name) {
    errors.push({ field: 'name', message: 'Informe como podemos te chamar.' });
  } else if (name.length < MIN_NAME_LENGTH) {
    errors.push({ field: 'name', message: 'O nome deve ter pelo menos 2 caracteres.' });
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push({ field: 'name', message: 'O nome deve ter no máximo 80 caracteres.' });
  }

  if (!emailRaw) {
    errors.push({ field: 'email', message: 'Informe o e-mail.' });
  } else if (!EMAIL_REGEX.test(emailRaw) || emailRaw.length > 254) {
    errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
  }

  if (password === null || password.length === 0) {
    errors.push({ field: 'password', message: 'Informe a senha.' });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    });
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `A senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`,
    });
  }

  if (errors.length > 0) {
    throw new AppError('Dados inválidos para cadastro.', 400, 'VALIDATION_ERROR', errors);
  }

  return {
    name: name as string,
    email: (emailRaw as string).toLowerCase(),
    password: password as string,
    categorySlugs,
  };
}

function parseCategorySlugs(
  value: unknown,
  errors: FieldError[],
): RegisterInput['categorySlugs'] {
  if (!Array.isArray(value)) {
    errors.push({
      field: 'categorySlugs',
      message: `Escolha pelo menos ${MIN_ONBOARDING_CATEGORIES} categorias.`,
    });
    return [];
  }

  const unique: OnboardingCategorySlug[] = [];
  for (const item of value) {
    if (typeof item !== 'string') {
      errors.push({ field: 'categorySlugs', message: 'Categorias inválidas.' });
      return [];
    }
    const slug = item.trim().toLowerCase();
    if (!isOnboardingCategorySlug(slug)) {
      errors.push({ field: 'categorySlugs', message: 'Uma ou mais categorias não são válidas.' });
      return [];
    }
    if (!unique.includes(slug)) {
      unique.push(slug);
    }
  }

  if (unique.length < MIN_ONBOARDING_CATEGORIES) {
    errors.push({
      field: 'categorySlugs',
      message: `Escolha pelo menos ${MIN_ONBOARDING_CATEGORIES} categorias.`,
    });
    return [];
  }

  return unique;
}

/**
 * Valida o corpo de POST /api/auth/login (RF02).
 */
export function parseLoginBody(body: unknown): LoginInput {
  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const errors: FieldError[] = [];

  const emailRaw = asTrimmedString(payload.email);
  const password = typeof payload.password === 'string' ? payload.password : null;

  if (!emailRaw) {
    errors.push({ field: 'email', message: 'Informe o e-mail.' });
  } else if (!EMAIL_REGEX.test(emailRaw) || emailRaw.length > 254) {
    errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
  }

  if (password === null || password.length === 0) {
    errors.push({ field: 'password', message: 'Informe a senha.' });
  }

  if (errors.length > 0) {
    throw new AppError('Dados inválidos para login.', 400, 'VALIDATION_ERROR', errors);
  }

  return {
    email: (emailRaw as string).toLowerCase(),
    password: password as string,
  };
}
