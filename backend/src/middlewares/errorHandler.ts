import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Middleware global de tratamento de erros. Deve ser o ÚLTIMO middleware
 * registrado no app (depois de todas as rotas).
 *
 * Formato padronizado de erro (RNF05 / boas práticas do projeto):
 * {
 *   "error": {
 *     "code": "BAD_REQUEST",
 *     "message": "Mensagem legível para o cliente",
 *     "details": { ... }   // opcional
 *   }
 * }
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Erro não previsto: não vazar detalhes internos/stack para o cliente.
  console.error('[unhandled error]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    },
  });
}

/**
 * Handler para rotas não encontradas (404), no mesmo formato padronizado.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}
