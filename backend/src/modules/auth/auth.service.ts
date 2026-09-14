import bcrypt from 'bcrypt';
import { AppError } from '../../shared/errors/AppError';
import { findUserIdByEmail, insertUser } from './auth.repository';
import { PublicUser } from './auth.types';
import { parseRegisterBody } from './auth.validation';

const BCRYPT_ROUNDS = 10;

/**
 * Cria uma conta de usuário comum (RF01).
 * O papel `usuario` é concedido pelo trigger do banco.
 */
export async function registerUser(body: unknown): Promise<PublicUser> {
  const input = parseRegisterBody(body);

  const existingId = await findUserIdByEmail(input.email);
  if (existingId) {
    throw new AppError(
      'Este e-mail já está cadastrado.',
      409,
      'EMAIL_ALREADY_REGISTERED',
    );
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  return insertUser(input, passwordHash);
}
