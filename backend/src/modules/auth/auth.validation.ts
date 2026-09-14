import { AppError } from '../../shared/errors/AppError';
import { FieldError, RegisterInput } from './auth.types';

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
 * Valida o corpo de POST /api/auth/register (RF01).
 * Campos alinhados à tela de CADASTRO: nome, e-mail e senha.
 */
export function parseRegisterBody(body: unknown): RegisterInput {
  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const errors: FieldError[] = [];

  const name = asTrimmedString(payload.name);
  const emailRaw = asTrimmedString(payload.email);
  const password = typeof payload.password === 'string' ? payload.password : null;

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
  };
}
