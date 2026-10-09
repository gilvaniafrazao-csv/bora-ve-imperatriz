import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Middleware global de tratamento de erros. Deve ser o ÚLTIMO middleware
 * registrado no app (depois de todas as rotas).
 *
 * Formato padronizado:
 * { "error": { "code": "BAD_REQUEST", "message": "...", "details": { ... } } }
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

  // Erros do body-parser (corpo inválido/grande) são culpa do cliente, não 500.
  const parseError = err as { type?: string } | null;
  if (parseError?.type === 'entity.parse.failed') {
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'O corpo da requisição não é um JSON válido.' },
    });
    return;
  }
  if (parseError?.type === 'entity.too.large') {
    res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'O corpo da requisição é grande demais.' },
    });
    return;
  }

  console.error('[unhandled error]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}
