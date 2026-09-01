import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`[bora-ve-backend] rodando em http://localhost:${env.port} (${env.nodeEnv})`);
  console.log(`[bora-ve-backend] health-check: http://localhost:${env.port}/health`);
});
