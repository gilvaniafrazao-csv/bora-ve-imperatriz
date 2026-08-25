/**
 * Erro de aplicação com status HTTP e código machine-readable.
 * Use isto (em vez de `throw new Error(...)`) para qualquer erro esperado
 * de regra de negócio ou validação — o errorHandler converte para o
 * formato JSON padronizado da API.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
