import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { healthRouter } from './routes/health.routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

  // Rotas
  app.use(healthRouter);
  // Próximas tasks (AUTH-02, AUTH-03, ...) devem registrar suas rotas aqui,
  // idealmente sob um prefixo, ex.: app.use('/api/auth', authRouter);

  // Sempre por último: 404 e error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
