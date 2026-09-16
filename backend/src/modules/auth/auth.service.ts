import { createHmac } from 'node:crypto';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import {
  deleteUserById,
  findAuthUserByEmail,
  findCategoryIdsBySlugs,
  findUserIdByEmail,
  insertUser,
  insertUserPreferences,
} from './auth.repository';
import { PublicUser } from './auth.types';
import { parseLoginBody, parseRegisterBody } from './auth.validation';

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

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function invalidCredentials(): AppError {
  return new AppError('E-mail ou senha inválidos.', 401, 'INVALID_CREDENTIALS');
}

function requireJwtSecret(): string {
  if (!env.jwtSecret) {
    throw new AppError(
      'Não foi possível entrar. Tente novamente mais tarde.',
      503,
      'AUTH_MISCONFIGURED',
    );
  }
  return env.jwtSecret;
}

function signAccessToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, iat: now, exp: now + TOKEN_TTL_SECONDS }),
  ).toString('base64url');
  const signature = createHmac('sha256', requireJwtSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

/**
 * Autentica um usuário comum (RF02) e devolve um JWT da aplicação.
 */
export async function loginUser(body: unknown): Promise<{ user: PublicUser; token: string }> {
  const input = parseLoginBody(body);
  const row = await findAuthUserByEmail(input.email);
  if (!row) {
    throw invalidCredentials();
  }

  if (!row?.password_hash) {
    throw invalidCredentials();
  }

  let passwordOk = false;
  try {
    passwordOk = await bcrypt.compare(input.password, row.password_hash);
  } catch (error) {
    console.error('[auth.login] bcrypt.compare failed', error);
    throw invalidCredentials();
  }
  if (!passwordOk) {
    throw invalidCredentials();
  }

  return {
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at,
    },
    token: signAccessToken(row.id),
  };
}
