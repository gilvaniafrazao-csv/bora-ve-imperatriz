import bcrypt from 'bcrypt';
import { AppError } from '../../shared/errors/AppError';
import {
  deleteUserById,
  findCategoryIdsBySlugs,
  findUserIdByEmail,
  insertUser,
  insertUserPreferences,
} from './auth.repository';
import { PublicUser } from './auth.types';
import { parseRegisterBody } from './auth.validation';

const BCRYPT_ROUNDS = 10;

/**
 * Cria uma conta de usuário comum (RF01) com preferências (RF03).
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

  const categoryIds = await findCategoryIdsBySlugs(input.categorySlugs);
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await insertUser(input, passwordHash);

  try {
    await insertUserPreferences(user.id, categoryIds);
  } catch (error) {
    await deleteUserById(user.id);
    throw error;
  }

  return user;
}
