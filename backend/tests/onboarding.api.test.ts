import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { TestContext, request, startTestApp } from './helpers/testApp';

let ctx: TestContext;

before(async () => {
  ctx = await startTestApp();
});
after(() => ctx.close());
beforeEach(() => ctx.fake.reset());

const conta = { name: 'Ana', email: 'Ana@Example.com', password: 'senhaSegura' };

describe('onboarding: cadastro com interesses -> login -> consulta', () => {
  it('as categorias escolhidas no cadastro ficam disponíveis em GET /api/preferences', async () => {
    const cadastro = await request(ctx, 'POST', '/api/auth/register', {
      body: { ...conta, categorySlugs: ['sushi', 'pizza', 'bar'] },
    });
    assert.equal(cadastro.status, 201);
    assert.equal(cadastro.json.user.email, 'ana@example.com');
    assert.equal(cadastro.json.user.password_hash, undefined);

    const login = await request(ctx, 'POST', '/api/auth/login', {
      body: { email: 'ana@example.com', password: 'senhaSegura' },
    });
    assert.equal(login.status, 200);

    const prefs = await request(ctx, 'GET', '/api/preferences', { token: login.json.token });
    assert.equal(prefs.status, 200);
    assert.deepEqual(prefs.json.preferences.categorySlugs, ['bar', 'pizza', 'sushi']);
    assert.equal(prefs.json.preferences.onboardingCompleted, true);
  });

  it('depois do cadastro o usuário consegue editar as preferências', async () => {
    await request(ctx, 'POST', '/api/auth/register', {
      body: { ...conta, categorySlugs: ['sushi', 'pizza', 'bar'] },
    });
    const { json } = await request(ctx, 'POST', '/api/auth/login', {
      body: { email: conta.email, password: conta.password },
    });

    const edit = await request(ctx, 'PUT', '/api/preferences', {
      token: json.token,
      body: { categorySlugs: ['churrasco', 'doces', 'hamburguer'], priceRange: 'economico' },
    });
    assert.equal(edit.status, 200);
    assert.deepEqual(edit.json.preferences.categorySlugs, ['churrasco', 'doces', 'hamburguer']);
    assert.equal(edit.json.preferences.priceRange, 'economico');
  });

  it('cadastro com menos de 3 interesses é recusado e nada é criado', async () => {
    const res = await request(ctx, 'POST', '/api/auth/register', {
      body: { ...conta, categorySlugs: ['sushi', 'pizza'] },
    });
    assert.equal(res.status, 400);
    assert.equal(res.json.error.details[0].field, 'categorySlugs');
    assert.equal(ctx.fake.users.size, 0);
  });

  it('cadastro com categoria inexistente é recusado', async () => {
    const res = await request(ctx, 'POST', '/api/auth/register', {
      body: { ...conta, categorySlugs: ['sushi', 'pizza', 'sorvete'] },
    });
    assert.equal(res.status, 400);
    assert.equal(ctx.fake.users.size, 0);
  });

  it('e-mail já cadastrado -> 409 sem mexer nas preferências existentes', async () => {
    const corpo = { ...conta, categorySlugs: ['sushi', 'pizza', 'bar'] };
    await request(ctx, 'POST', '/api/auth/register', { body: corpo });
    const [userId] = [...ctx.fake.users.keys()];

    const repetido = await request(ctx, 'POST', '/api/auth/register', {
      body: { ...corpo, email: 'ANA@example.com', categorySlugs: ['doces', 'churrasco', 'hamburguer'] },
    });
    assert.equal(repetido.status, 409);
    assert.equal(repetido.json.error.code, 'EMAIL_ALREADY_REGISTERED');
    assert.deepEqual(ctx.fake.slugsOf(userId), ['bar', 'pizza', 'sushi']);
  });

  it('falha ao gravar as categorias desfaz o cadastro (nenhuma conta sem interesses)', async () => {
    ctx.fake.failNext('POST', 'user_preference_categories');
    const res = await request(ctx, 'POST', '/api/auth/register', {
      body: { ...conta, categorySlugs: ['sushi', 'pizza', 'bar'] },
    });
    assert.equal(res.status, 503);
    assert.equal(ctx.fake.users.size, 0);
    assert.ok(ctx.fake.requests.includes('DELETE users'));
  });
});
