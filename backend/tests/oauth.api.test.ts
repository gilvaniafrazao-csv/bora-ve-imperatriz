import assert from 'node:assert/strict';
import { createSign, generateKeyPairSync, KeyObject } from 'node:crypto';
import { after, before, beforeEach, describe, it } from 'node:test';
import { applePersonName, resetOAuthJwksCache, setOAuthFetch } from '../src/modules/auth/oauth.providers';
import { resetOAuthStore } from '../src/modules/auth/oauth.store';
import { TestContext, request, startTestApp } from './helpers/testApp';

let ctx: TestContext;
let privateKey: KeyObject;
let tokenCalls = 0;
let currentToken = '';

const GOOGLE_CLIENT = 'test-google-client';

before(async () => {
  ctx = await startTestApp();
  process.env.GOOGLE_OAUTH_CLIENT_ID = GOOGLE_CLIENT;
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = 'test-google-secret';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.API_PUBLIC_URL = 'http://localhost:3333';
  delete process.env.APPLE_TEAM_ID;
  delete process.env.APPLE_KEY_ID;
  delete process.env.APPLE_SERVICE_ID;
  delete process.env.APPLE_PRIVATE_KEY;

  const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
  privateKey = pair.privateKey;
  const publicJwk = pair.publicKey.export({ format: 'jwk' });
  publicJwk.kid = 'test-key';
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';

  setOAuthFetch(async (input) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith('https://oauth2.googleapis.com/token')) {
      tokenCalls += 1;
      return Response.json({
        id_token: currentToken,
        access_token: 'access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      });
    }
    if (url.startsWith('https://www.googleapis.com/oauth2/v3/certs')) {
      return Response.json({ keys: [publicJwk] });
    }
    throw new Error(`fetch inesperado no teste: ${url}`);
  });
});

after(async () => {
  setOAuthFetch(null);
  await ctx.close();
});

beforeEach(() => {
  ctx.fake.reset();
  resetOAuthStore();
  resetOAuthJwksCache();
  tokenCalls = 0;
  currentToken = '';
});

async function googleIdToken(claims: {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  nonce: string;
}): Promise<string> {
  const payload: Record<string, unknown> = { nonce: claims.nonce, name: claims.name ?? 'Ana Social' };
  if (claims.email) {
    payload.email = claims.email;
    payload.email_verified = claims.emailVerified ?? false;
  }
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'test-key' })).toString(
    'base64url',
  );
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iss: 'https://accounts.google.com',
      aud: GOOGLE_CLIENT,
      sub: claims.sub,
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url');
  const signature = createSign('RSA-SHA256').update(`${header}.${body}`).sign(privateKey);
  return `${header}.${body}.${signature.toString('base64url')}`;
}

async function startGoogle(from: 'login' | 'cadastro' = 'login') {
  const start = await request(ctx, 'GET', `/api/auth/oauth/google/start?from=${from}`, {
    redirect: 'manual',
  });
  assert.equal(start.status, 302);
  const location = new URL(start.location ?? '');
  const state = location.searchParams.get('state');
  const nonce = location.searchParams.get('nonce');
  const cookie = start.cookies.find((item) => item.startsWith('oauth_tx='));
  assert.ok(state);
  assert.ok(nonce);
  assert.ok(cookie);
  const value = decodeURIComponent(cookie.split(';')[0].slice('oauth_tx='.length));
  assert.equal(value, state);
  assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(
    location.searchParams.get('redirect_uri'),
    'http://localhost:3333/api/auth/oauth/google/callback',
  );
  return { state, nonce, cookieHeader: `oauth_tx=${value}` };
}

async function callbackGoogle(state: string, cookieHeader: string) {
  return request(ctx, 'GET', `/api/auth/oauth/google/callback?code=codigo-falso&state=${state}`, {
    redirect: 'manual',
    headers: { cookie: cookieHeader },
  });
}

describe('login social', () => {
  it('provedor desconhecido responde 404', async () => {
    const res = await request(ctx, 'GET', '/api/auth/oauth/github/start');
    assert.equal(res.status, 404);
  });

  it('Apple sem configuração volta para o cadastro com erro claro', async () => {
    const res = await request(ctx, 'GET', '/api/auth/oauth/apple/start?from=cadastro', {
      redirect: 'manual',
    });
    assert.equal(res.status, 302);
    const location = new URL(res.location ?? '');
    assert.equal(location.pathname, '/cadastro');
    assert.equal(location.searchParams.get('oauth_error'), 'nao-configurado');
    assert.equal(location.searchParams.get('provedor'), 'apple');
  });

  it('state diferente do cookie não chama o provedor', async () => {
    const started = await startGoogle();
    const res = await callbackGoogle('outro-state', started.cookieHeader);
    assert.equal(res.status, 302);
    assert.equal(new URL(res.location ?? '').searchParams.get('oauth_error'), 'state');
    assert.equal(tokenCalls, 0);
  });

  it('o mesmo state não pode ser reutilizado', async () => {
    const started = await startGoogle();
    currentToken = await googleIdToken({
      sub: 'google-replay',
      email: 'replay@example.com',
      emailVerified: true,
      nonce: started.nonce,
    });
    const first = await callbackGoogle(started.state, started.cookieHeader);
    assert.equal(new URL(first.location ?? '').pathname, '/auth/retorno');
    const second = await callbackGoogle(started.state, started.cookieHeader);
    assert.equal(new URL(second.location ?? '').searchParams.get('oauth_error'), 'state');
  });

  it('e-mail não verificado não vincula conta que já tem senha', async () => {
    await request(ctx, 'POST', '/api/auth/register', {
      body: {
        name: 'Ana',
        email: 'ana@example.com',
        password: 'senhaSegura',
        categorySlugs: ['sushi', 'pizza', 'bar'],
      },
    });
    const started = await startGoogle();
    currentToken = await googleIdToken({
      sub: 'google-ana',
      email: 'ana@example.com',
      emailVerified: false,
      nonce: started.nonce,
    });
    const res = await callbackGoogle(started.state, started.cookieHeader);
    assert.equal(new URL(res.location ?? '').searchParams.get('oauth_error'), 'email-nao-verificado');
    assert.equal(ctx.fake.identities.length, 0);
    assert.equal(ctx.fake.users.size, 1);
  });

  it('e-mail verificado vincula a conta existente e a senha continua valendo', async () => {
    await request(ctx, 'POST', '/api/auth/register', {
      body: {
        name: 'Ana',
        email: 'ana@example.com',
        password: 'senhaSegura',
        categorySlugs: ['sushi', 'pizza', 'bar'],
      },
    });
    const started = await startGoogle();
    currentToken = await googleIdToken({
      sub: 'google-ana',
      email: 'ana@example.com',
      emailVerified: true,
      nonce: started.nonce,
    });
    const back = await callbackGoogle(started.state, started.cookieHeader);
    const code = new URL(back.location ?? '').searchParams.get('code');
    const exchanged = await request(ctx, 'POST', '/api/auth/oauth/exchange', { body: { code } });
    assert.equal(exchanged.status, 200);
    assert.equal(exchanged.json.status, 'session');
    assert.equal(ctx.fake.identities.length, 1);
    assert.equal(ctx.fake.identities[0].provider, 'google');

    const again = await request(ctx, 'POST', '/api/auth/oauth/exchange', { body: { code } });
    assert.equal(again.json.token, exchanged.json.token);

    const login = await request(ctx, 'POST', '/api/auth/login', {
      body: { email: 'ana@example.com', password: 'senhaSegura' },
    });
    assert.equal(login.status, 200);
  });

  it('conta nova fica pendente até as preferências e não entra com senha', async () => {
    const started = await startGoogle();
    currentToken = await googleIdToken({
      sub: 'google-nova',
      email: 'nova@example.com',
      emailVerified: true,
      name: 'Pessoa Nova',
      nonce: started.nonce,
    });
    const back = await callbackGoogle(started.state, started.cookieHeader);
    const handoff = new URL(back.location ?? '').searchParams.get('code');
    const exchanged = await request(ctx, 'POST', '/api/auth/oauth/exchange', { body: { code: handoff } });
    assert.equal(exchanged.json.status, 'pending');
    assert.equal(exchanged.json.name, 'Pessoa Nova');
    assert.equal(exchanged.json.email, 'nova@example.com');
    assert.equal(ctx.fake.users.size, 0);

    const cedo = await request(ctx, 'POST', '/api/auth/oauth/register', {
      body: { code: exchanged.json.code, categorySlugs: ['sushi', 'pizza'] },
    });
    assert.equal(cedo.status, 400);
    assert.equal(ctx.fake.users.size, 0);

    const created = await request(ctx, 'POST', '/api/auth/oauth/register', {
      body: { code: exchanged.json.code, categorySlugs: ['sushi', 'pizza', 'bar'] },
    });
    assert.equal(created.status, 201);
    assert.equal(created.json.user.email, 'nova@example.com');
    assert.equal(created.json.user.password_hash, undefined);
    assert.equal([...ctx.fake.users.values()][0].password_hash, null);
    assert.equal(ctx.fake.identities.length, 1);

    const login = await request(ctx, 'POST', '/api/auth/login', {
      body: { email: 'nova@example.com', password: 'qualquer-senha' },
    });
    assert.equal(login.status, 401);
    assert.equal(login.json.error.code, 'INVALID_CREDENTIALS');

    const prefs = await request(ctx, 'GET', '/api/preferences', { token: created.json.token });
    assert.equal(prefs.status, 200);
    assert.deepEqual(prefs.json.preferences.categorySlugs, ['bar', 'pizza', 'sushi']);
  });

  it('sem e-mail a conta não é criada', async () => {
    const started = await startGoogle();
    currentToken = await googleIdToken({ sub: 'google-sem-email', nonce: started.nonce });
    const res = await callbackGoogle(started.state, started.cookieHeader);
    assert.equal(new URL(res.location ?? '').searchParams.get('oauth_error'), 'sem-email');
    assert.equal(ctx.fake.users.size, 0);
  });

  it('guarda o nome que a Apple manda só na primeira autorização', () => {
    assert.equal(
      applePersonName('{"name":{"firstName":"Ana","lastName":"Clara"}}'),
      'Ana Clara',
    );
    assert.equal(applePersonName('nao-json'), null);
  });
});
