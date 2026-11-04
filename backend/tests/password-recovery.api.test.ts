import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it, mock } from 'node:test';
import bcrypt from 'bcrypt';
import { forgotPasswordLimiter, resetPasswordLimiter } from '../src/shared/http/rateLimit';
import { FakeSmtp } from './helpers/fakeSmtp';
import { hashToken } from './helpers/fakeSupabase';
import { TestContext, request, startTestApp } from './helpers/testApp';

let ctx: TestContext;
const smtp = new FakeSmtp();

before(async () => {
  // O mailer lê a configuração no import: o SMTP falso precisa existir antes do app.
  const { host, port } = await smtp.start();
  process.env.SMTP_HOST = host;
  process.env.SMTP_PORT = String(port);
  ctx = await startTestApp();
});
after(async () => {
  await ctx.close();
  await smtp.stop();
});
beforeEach(async () => {
  ctx.fake.reset();
  smtp.reset();
  // Todas as chamadas saem do mesmo IP: zera o limite por IP entre os testes.
  await forgotPasswordLimiter.resetKey('127.0.0.1');
  await resetPasswordLimiter.resetKey('127.0.0.1'); 
});
afterEach(() => mock.restoreAll());

const USER_ID = '33333333-3333-3333-3333-000000000001';
const EMAIL = `${USER_ID}@example.com`;
const GENERIC_MESSAGE =
  'Se o e-mail fornecido estiver cadastrado, você receberá as instruções de recuperação.';

function tokenFromMail(raw: string): string {
  const match = FakeSmtp.decode(raw).match(/redefinir-senha\?token=([A-Za-z0-9_-]+)/);
  assert.ok(match, 'o e-mail deveria conter o link de redefinição');
  return match[1];
}

const forgot = (email: string) =>
  request(ctx, 'POST', '/api/auth/forgot-password', { body: { email } });
const reset = (token: string, newPassword: string) =>
  request(ctx, 'POST', '/api/auth/reset-password', { body: { token, newPassword } });

describe('POST /api/auth/forgot-password', () => {
  it('pedido válido gera token e envia o e-mail com o link', async () => {
    ctx.fake.addUser(USER_ID);

    const res = await forgot(EMAIL.toUpperCase());
    assert.equal(res.status, 200);
    assert.equal(res.json.message, GENERIC_MESSAGE);

    assert.equal(smtp.messages.length, 1);
    assert.deepEqual(smtp.messages[0].to, [EMAIL]);
    const token = tokenFromMail(smtp.messages[0].raw);

    assert.equal(ctx.fake.resetTokens.length, 1);
    const [row] = ctx.fake.resetTokens;
    assert.equal(row.user_id, USER_ID);
    assert.equal(row.token_hash, hashToken(token), 'o banco guarda só o hash do token');
    assert.equal(row.used_at, null);
  });

  it('e-mail não cadastrado não envia nada e responde igual', async () => {
    const res = await forgot('ninguem@example.com');
    assert.equal(res.status, 200);
    assert.equal(res.json.message, GENERIC_MESSAGE);
    assert.equal(smtp.messages.length, 0);
    assert.equal(ctx.fake.resetTokens.length, 0);
  });

  it('segundo pedido dentro de 60 segundos não envia outro e-mail', async () => {
    ctx.fake.addUser(USER_ID);

    const first = await forgot(EMAIL);
    const second = await forgot(EMAIL);
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.deepEqual(second.json, first.json);
    assert.equal(smtp.messages.length, 1);
    assert.equal(ctx.fake.resetTokens.length, 1);
    assert.equal(ctx.fake.resetTokens[0].used_at, null, 'o primeiro link continua válido');
  });

  it('falha no envio não derruba a requisição e invalida o token criado', async () => {
    ctx.fake.addUser(USER_ID);
    smtp.failNext();
    const errorLog = mock.method(console, 'error', () => undefined);

    const res = await forgot(EMAIL);
    assert.equal(res.status, 200);
    assert.equal(res.json.message, GENERIC_MESSAGE);

    assert.equal(smtp.messages.length, 0);
    assert.equal(ctx.fake.resetTokens.length, 1);
    assert.notEqual(ctx.fake.resetTokens[0].used_at, null, 'o token não pode ficar válido');

    const call = errorLog.mock.calls.find((c) => String(c.arguments[0]).startsWith('[auth.service]'));
    assert.ok(call, 'a falha deveria ser registrada no log');
    const logged = JSON.stringify(call.arguments);
    assert.match(logged, new RegExp(USER_ID));
    assert.doesNotMatch(logged, /redefinir-senha|token=/);
  });

  it('falha de banco responde 503 DATABASE_UNAVAILABLE', async () => {
    ctx.fake.addUser(USER_ID);
    ctx.fake.failNext('GET', 'users');

    const res = await forgot(EMAIL);
    assert.equal(res.status, 503);
    assert.equal(res.json.error.code, 'DATABASE_UNAVAILABLE');
    assert.equal(smtp.messages.length, 0);
  });
});

describe('POST /api/auth/reset-password', () => {
  it('token válido troca a senha e o login passa a usar a nova', async () => {
    ctx.fake.addUser(USER_ID);
    await forgot(EMAIL);
    const token = tokenFromMail(smtp.messages[0].raw);

    const res = await reset(token, 'novaSenhaForte');
    assert.equal(res.status, 200);
    assert.equal(res.json.message, 'Senha redefinida com sucesso.');

    const hash = ctx.fake.users.get(USER_ID)?.password_hash as string;
    assert.ok(await bcrypt.compare('novaSenhaForte', hash));
    assert.ok(ctx.fake.resetTokens.every((row) => row.used_at !== null));

    const login = await request(ctx, 'POST', '/api/auth/login', {
      body: { email: EMAIL, password: 'novaSenhaForte' },
    });
    assert.equal(login.status, 200);
  });

  const invalidTokens: [string, (fake: TestContext['fake']) => void][] = [
    ['inexistente', () => undefined],
    [
      'expirado',
      (fake) => fake.addResetToken(USER_ID, 'token-de-teste', { expiresAt: new Date(Date.now() - 1000) }),
    ],
    ['já usado', (fake) => fake.addResetToken(USER_ID, 'token-de-teste', { usedAt: new Date() })],
  ];

  for (const [label, setup] of invalidTokens) {
    it(`token ${label} -> 400 INVALID_RESET_TOKEN sem trocar a senha`, async () => {
      ctx.fake.addUser(USER_ID);
      setup(ctx.fake);

      const res = await reset('token-de-teste', 'novaSenhaForte');
      assert.equal(res.status, 400);
      assert.equal(res.json.error.code, 'INVALID_RESET_TOKEN');
      assert.equal(ctx.fake.users.get(USER_ID)?.password_hash, 'x');
    });
  }

  it('o mesmo link não funciona duas vezes', async () => {
    ctx.fake.addUser(USER_ID);
    ctx.fake.addResetToken(USER_ID, 'token-de-teste');

    assert.equal((await reset('token-de-teste', 'novaSenhaForte')).status, 200);
    const again = await reset('token-de-teste', 'outraSenhaForte');
    assert.equal(again.status, 400);
    assert.equal(again.json.error.code, 'INVALID_RESET_TOKEN');
  });

  for (const [label, password] of [
    ['curta', 'a'.repeat(7)],
    ['longa', 'a'.repeat(73)],
  ]) {
    it(`senha ${label} demais -> 400 VALIDATION_ERROR sem consumir o token`, async () => {
      ctx.fake.addUser(USER_ID);
      ctx.fake.addResetToken(USER_ID, 'token-de-teste');

      const res = await reset('token-de-teste', password);
      assert.equal(res.status, 400);
      assert.equal(res.json.error.code, 'VALIDATION_ERROR');
      assert.equal(res.json.error.details[0].field, 'newPassword');
      assert.equal(ctx.fake.resetTokens[0].used_at, null);
      assert.ok(!ctx.fake.requests.includes('POST rpc/reset_password_with_token'));
    });
  }

  it('falha de banco -> 503 DATABASE_UNAVAILABLE e o link continua valendo', async () => {
    ctx.fake.addUser(USER_ID);
    ctx.fake.addResetToken(USER_ID, 'token-de-teste');
    ctx.fake.failNext('POST', 'rpc/reset_password_with_token');
    mock.method(console, 'error', () => undefined);

    const res = await reset('token-de-teste', 'novaSenhaForte');
    assert.equal(res.status, 503);
    assert.equal(res.json.error.code, 'DATABASE_UNAVAILABLE');
    assert.equal(ctx.fake.users.get(USER_ID)?.password_hash, 'x');
    assert.equal(ctx.fake.resetTokens[0].used_at, null);

    assert.equal((await reset('token-de-teste', 'novaSenhaForte')).status, 200);
  });
});
