import { createHmac } from 'node:crypto';
import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { FakeSupabase } from './fakeSupabase';

export const TEST_JWT_SECRET = 'segredo-somente-para-testes';

export type TestContext = {
  baseUrl: string;
  fake: FakeSupabase;
  close: () => Promise<void>;
};

/**
 * Sobe a API real apontando para o Supabase falso. As variáveis de ambiente
 * precisam existir ANTES de importar o app (config/env.ts lê no import),
 * por isso o `import()` dinâmico.
 */
export async function startTestApp(): Promise<TestContext> {
  const fake = new FakeSupabase();
  const fakeUrl = await fake.start();

  process.env.SUPABASE_URL = fakeUrl;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-de-teste';
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.NODE_ENV = 'test';

  const { createApp } = await import('../../src/app.js');
  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, '127.0.0.1', () => resolve(s));
  });

  return {
    baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    fake,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await fake.stop();
    },
  };
}

type TokenOptions = { exp?: number; alg?: string; secret?: string };

/** Gera um JWT no mesmo formato de auth.service (HS256, `sub`, `exp`). */
export function makeToken(userId: string, options: TokenOptions = {}): string {
  const { exp = Math.floor(Date.now() / 1000) + 600, alg = 'HS256', secret = TEST_JWT_SECRET } =
    options;
  const header = Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: userId, iat: 0, exp })).toString('base64url');
  const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

// Corpo de resposta sem tipagem fixa: os testes validam o formato campo a campo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any;

export async function request(
  ctx: TestContext,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {},
): Promise<{ status: number; json: Json }> {
  const response = await fetch(`${ctx.baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body:
      options.body === undefined
        ? undefined
        : typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body),
  });
  return { status: response.status, json: await response.json().catch(() => null) };
}
