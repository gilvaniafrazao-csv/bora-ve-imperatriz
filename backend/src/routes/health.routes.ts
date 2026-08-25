import { Router } from 'express';

export const healthRouter = Router();

/**
 * GET /health
 * Endpoint simples para confirmar que a API está no ar — usado para
 * validar o critério de aceite "o projeto backend é criado e executa
 * localmente" (TASK-BV-INFRA-03).
 */
healthRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'bora-ve-backend',
    timestamp: new Date().toISOString(),
  });
});
