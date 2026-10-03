import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env';
import { AppError } from '../errors/AppError';

function unauthorized(): AppError {
  return new AppError('Sessão inválida ou expirada. Faça login novamente.', 401, 'UNAUTHORIZED');
}

/**
 * Valida um JWT HS256 emitido por `auth.service` (assinatura + expiração)
 * e devolve o id do usuário (`sub`).
 */
export function verifyAccessToken(token: string): string {
  if (!env.jwtSecret) {
    throw new AppError(
      'Não foi possível validar a sessão. Tente novamente mais tarde.',
      503,
      'AUTH_MISCONFIGURED',
    );
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw unauthorized();
  }
  const [header, payload, signature] = parts;

  try {
    const parsedHeader = JSON.parse(Buffer.from(header, 'base64url').toString('utf8')) as {
      alg?: unknown;
    };
    if (parsedHeader.alg !== 'HS256') {
      throw unauthorized();
    }

    const expected = createHmac('sha256', env.jwtSecret).update(`${header}.${payload}`).digest();
    const received = Buffer.from(signature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      throw unauthorized();
    }

    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: unknown;
      exp?: unknown;
    };
    if (typeof claims.sub !== 'string' || claims.sub === '') {
      throw unauthorized();
    }
    if (typeof claims.exp !== 'number' || claims.exp <= Math.floor(Date.now() / 1000)) {
      throw unauthorized();
    }
    return claims.sub;
  } catch (error) {
    throw error instanceof AppError ? error : unauthorized();
  }
}
