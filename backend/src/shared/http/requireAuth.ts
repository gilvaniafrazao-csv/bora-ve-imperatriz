import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../auth/jwt';
import { AppError } from '../errors/AppError';

/**
 * Exige `Authorization: Bearer <jwt>` e disponibiliza o id do usuário em
 * `res.locals.userId`. Use com `getAuthenticatedUserId(res)` no controller.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const match = /^Bearer\s+(\S+)$/i.exec(req.header('authorization') ?? '');
  if (!match) {
    next(new AppError('Autenticação necessária.', 401, 'UNAUTHORIZED'));
    return;
  }

  try {
    res.locals.userId = verifyAccessToken(match[1]);
    next();
  } catch (error) {
    next(error);
  }
}

export function getAuthenticatedUserId(res: Response): string {
  return res.locals.userId as string;
}
