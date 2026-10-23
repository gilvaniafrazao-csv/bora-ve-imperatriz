import { createHash, createHmac, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import {
  consumeResetToken,
  insertPasswordResetToken,
  invalidateUserResetTokens,
  deleteUserById,
  findAuthUserByEmail,
  findCategoryIdsBySlugs,
  findUserIdByEmail,
  insertUser,
  insertUserPreferences,
  updateUserPassword,
} from './auth.repository';
import { PublicUser } from './auth.types';
import {
  parseForgotPasswordBody,
  parseLoginBody,
  parseRegisterBody,
  parseResetPasswordBody,
} from './auth.validation';
import { sendPasswordResetEmail } from '../../shared/mail/mailer';

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

  const passwordOk = await bcrypt.compare(input.password, row.password_hash);
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

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Gera um token de uso único (validade de 1 hora), guarda só o hash no banco
 * e envia o link por e-mail. A resposta é sempre a mesma, exista a conta ou
 * não, para não revelar quais e-mails estão cadastrados.
 */
export async function requestPasswordRecovery(body: unknown): Promise<void> {
  const { email } = parseForgotPasswordBody(body);

  const user = await findAuthUserByEmail(email);
  if (!user) {
    return;
  }

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await invalidateUserResetTokens(user.id);
  await insertPasswordResetToken(user.id, hashResetToken(token), expiresAt);

  const link = `${env.frontendUrl}/redefinir-senha?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, link);
  } catch (error) {
    console.error('[auth.service] falha ao enviar e-mail de recuperação', error);
  }
}

export async function resetUserPassword(body: unknown): Promise<void> {
  const { token, newPassword } = parseResetPasswordBody(body);

  const userId = await consumeResetToken(hashResetToken(token));
  if (!userId) {
    throw new AppError(
      'Link inválido ou expirado. Peça uma nova recuperação de senha.',
      400,
      'INVALID_RESET_TOKEN',
    );
  }

  const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await updateUserPassword(userId, newPasswordHash);
  await invalidateUserResetTokens(userId);
}