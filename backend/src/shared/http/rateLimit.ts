import { rateLimit } from 'express-rate-limit';

/*
 * Limite por IP no pedido de recuperacao de senha: 5 pedidos a cada
 * 15 minutos. Passou disso, responde 429. A resposta nao depende de a
 * conta existir, entao nao revela quais e-mails estao cadastrados.
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
      },
    });
  },
});

/*
 * Limite por IP na redefinicao de senha: 10 tentativas a cada 15 minutos.
 * Cada tentativa calcula um hash bcrypt, que e uma operacao cara, entao o
 * limite impede que alguem use a rota para gastar processador do servidor.
 */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
      },
    });
  },
});