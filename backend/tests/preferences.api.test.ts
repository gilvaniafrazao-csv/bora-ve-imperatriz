import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { TestContext, makeToken, request, startTestApp } from './helpers/testApp';

const USER = '11111111-1111-1111-1111-111111111111';
const OUTRO = '33333333-3333-3333-3333-333333333333';

let ctx: TestContext;
let token: string;

before(async () => {
  ctx = await startTestApp();
});
after(() => ctx.close());
beforeEach(() => {
  ctx.fake.reset();
  ctx.fake.addUser(USER);
  ctx.fake.addUser(OUTRO);
  token = makeToken(USER);
});

const put = (body: unknown, t: string | undefined = token) =>
  request(ctx, 'PUT', '/api/preferences', { token: t, body });
const get = (t: string | undefined = token) => request(ctx, 'GET', '/api/preferences', { token: t });

describe('autenticação das rotas de preferências', () => {
  for (const method of ['GET', 'PUT']) {
    it(`${method} sem token -> 401`, async () => {
      const res = await request(ctx, method, '/api/preferences', {
        body: method === 'PUT' ? { categorySlugs: ['sushi', 'pizza', 'bar'] } : undefined,
      });
      assert.equal(res.status, 401);
      assert.equal(res.json.error.code, 'UNAUTHORIZED');
    });
  }

  it('token inválido ou expirado -> 401 e nada é gravado', async () => {
    const corpo = { categorySlugs: ['sushi', 'pizza', 'bar'] };
    const invalidos: [string, string][] = [
      ['sem conteúdo', ''],
      ['texto qualquer', 'lixo'],
      ['sem 3 partes', 'a.b'],
      ['assinado com outro segredo', makeToken(USER, { secret: 'outro' })],
      ['expirado', makeToken(USER, { exp: 1 })],
      ['sem expiração', makeToken(USER, { withoutExp: true })],
      ['conteúdo adulterado', makeToken(USER).replace(/^(\w+)\.\w+/, '$1.e30')],
    ];
    for (const [nome, t] of invalidos) {
      const res = await put(corpo, t);
      assert.equal(res.status, 401, `token ${nome}`);
      assert.equal(res.json.error.code, 'UNAUTHORIZED', `token ${nome}`);
    }
    assert.equal(ctx.fake.links.length, 0);
    assert.equal(ctx.fake.preferences.size, 0);
  });

  it('token válido é aceito e identifica o usuário certo', async () => {
    await put({ categorySlugs: ['sushi', 'pizza', 'bar'] });
    assert.deepEqual(ctx.fake.slugsOf(USER), ['bar', 'pizza', 'sushi']);
    assert.deepEqual(ctx.fake.slugsOf(OUTRO), []);
  });

  it('esquema de autorização diferente de Bearer -> 401', async () => {
    const res = await fetch(`${ctx.baseUrl}/api/preferences`, { headers: { Authorization: token } });
    assert.equal(res.status, 401);
  });
});

describe('registrar preferências (PUT)', () => {
  it('salva categorias válidas e devolve o resultado', async () => {
    const res = await put({ categorySlugs: ['sushi', 'pizza', 'bar'], priceRange: 'moderado' });
    assert.equal(res.status, 200);
    assert.deepEqual(res.json.preferences.categorySlugs, ['bar', 'pizza', 'sushi']);
    assert.equal(res.json.preferences.priceRange, 'moderado');
    assert.equal(res.json.preferences.onboardingCompleted, true);
    assert.deepEqual(ctx.fake.slugsOf(USER), ['bar', 'pizza', 'sushi']);
  });

  it('dados inválidos -> 400 com detalhes e sem gravar nada', async () => {
    const casos: [unknown, string][] = [
      [{}, 'categorySlugs'],
      [{ categorySlugs: ['sushi', 'pizza'] }, 'categorySlugs'],
      [{ categorySlugs: ['sushi', 'pizza', 'sorvete'] }, 'categorySlugs'],
      [{ categorySlugs: ['sushi', 'pizza', 'bar'], priceRange: 'luxo' }, 'priceRange'],
    ];
    for (const [corpo, campo] of casos) {
      const res = await put(corpo);
      assert.equal(res.status, 400, JSON.stringify(corpo));
      assert.equal(res.json.error.code, 'VALIDATION_ERROR');
      assert.equal(res.json.error.details[0].field, campo);
    }
    assert.equal(ctx.fake.links.length, 0);
    assert.equal(ctx.fake.preferences.size, 0);
    assert.ok(!ctx.fake.requests.includes('POST rpc/replace_user_preferences'), 'nem chega ao banco');
  });

  it('usuário do token que não existe mais -> 401', async () => {
    const res = await put({ categorySlugs: ['sushi', 'pizza', 'bar'] }, makeToken('99999999-9999-9999-9999-999999999999'));
    assert.equal(res.status, 401);
    assert.equal(res.json.error.code, 'UNAUTHORIZED');
  });

  it('falha do banco -> 503 sem vazar detalhes internos', async () => {
    ctx.fake.failNext('POST', 'rpc/replace_user_preferences');
    const res = await put({ categorySlugs: ['sushi', 'pizza', 'bar'] });
    assert.equal(res.status, 503);
    assert.equal(res.json.error.code, 'DATABASE_UNAVAILABLE');
    assert.doesNotMatch(JSON.stringify(res.json), /XX000|falha simulada/);
  });
});

describe('recuperar preferências (GET) para recomendações', () => {
  it('sem onboarding: 200, lista vazia e onboardingCompleted=false', async () => {
    const res = await get();
    assert.equal(res.status, 200);
    assert.deepEqual(res.json.preferences, {
      categorySlugs: [],
      priceRange: null,
      onboardingCompleted: false,
      updatedAt: null,
    });
  });

  it('devolve exatamente o que foi salvo, ordenado por slug', async () => {
    await put({ categorySlugs: ['sushi', 'churrasco', 'bar'], priceRange: 'premium' });
    const res = await get();
    assert.equal(res.status, 200);
    assert.deepEqual(res.json.preferences.categorySlugs, ['bar', 'churrasco', 'sushi']);
    assert.equal(res.json.preferences.priceRange, 'premium');
    assert.ok(res.json.preferences.updatedAt);
  });

  it('cada usuário vê só as próprias preferências', async () => {
    await put({ categorySlugs: ['sushi', 'pizza', 'bar'] });
    await put({ categorySlugs: ['doces', 'churrasco', 'hamburguer'] }, makeToken(OUTRO));
    assert.deepEqual((await get()).json.preferences.categorySlugs, ['bar', 'pizza', 'sushi']);
    assert.deepEqual(
      (await get(makeToken(OUTRO))).json.preferences.categorySlugs,
      ['churrasco', 'doces', 'hamburguer'],
    );
  });

  it('falha do banco -> 503', async () => {
    ctx.fake.failNext('GET', 'user_preferences');
    const res = await get();
    assert.equal(res.status, 503);
    assert.equal(res.json.error.code, 'DATABASE_UNAVAILABLE');
  });
});

describe('editar preferências (PUT repetido)', () => {
  beforeEach(async () => {
    await put({ categorySlugs: ['sushi', 'pizza', 'bar'], priceRange: 'moderado' });
  });

  it('substitui o conjunto: remove o que saiu e adiciona o novo', async () => {
    const res = await put({ categorySlugs: ['pizza', 'churrasco', 'doces'] });
    assert.deepEqual(res.json.preferences.categorySlugs, ['churrasco', 'doces', 'pizza']);
    assert.deepEqual(ctx.fake.slugsOf(USER), ['churrasco', 'doces', 'pizza']);
  });

  it('é idempotente e não duplica linhas', async () => {
    for (let i = 0; i < 3; i++) {
      assert.equal((await put({ categorySlugs: ['sushi', 'pizza', 'bar'] })).status, 200);
    }
    assert.equal(ctx.fake.links.length, 3);
  });

  it('priceRange ausente mantém, null limpa, valor novo troca', async () => {
    const base = ['sushi', 'pizza', 'bar'];
    assert.equal((await put({ categorySlugs: base })).json.preferences.priceRange, 'moderado');
    assert.equal((await put({ categorySlugs: base, priceRange: 'economico' })).json.preferences.priceRange, 'economico');
    assert.equal((await put({ categorySlugs: base, priceRange: null })).json.preferences.priceRange, null);
  });

  it('edição inválida não altera o que já estava salvo', async () => {
    assert.equal((await put({ categorySlugs: ['sushi'] })).status, 400);
    assert.deepEqual((await get()).json.preferences.categorySlugs, ['bar', 'pizza', 'sushi']);
  });

  it('falha na gravação não altera nada: nem categorias, nem preço, nem updatedAt', async () => {
    const antes = (await get()).json.preferences;
    ctx.fake.failNext('POST', 'rpc/replace_user_preferences');
    const res = await put({ categorySlugs: ['churrasco', 'doces', 'hamburguer'], priceRange: 'premium' });
    assert.equal(res.status, 503);
    assert.deepEqual((await get()).json.preferences, antes);
  });

  it('updatedAt avança mesmo quando só as categorias mudam', async () => {
    const antes = (await get()).json.preferences.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 20));
    const res = await put({ categorySlugs: ['pizza', 'churrasco', 'doces'] });
    assert.ok(Date.parse(res.json.preferences.updatedAt) > Date.parse(antes));
    assert.equal(res.json.preferences.priceRange, 'moderado');
  });

  it('duas atualizações simultâneas terminam com um dos conjuntos inteiro, nunca misturado', async () => {
    const a = ['sushi', 'pizza', 'bar'];
    const b = ['hamburguer', 'churrasco', 'doces'];
    // O fake é atômico por natureza; a garantia real é da função SQL, testada em
    // supabase/tests/replace_user_preferences.test.sql. Aqui fica o contrato da API.
    await Promise.all([put({ categorySlugs: a }), put({ categorySlugs: b })]);
    const final = (await get()).json.preferences.categorySlugs;
    assert.ok(
      JSON.stringify(final) === JSON.stringify([...a].sort()) ||
        JSON.stringify(final) === JSON.stringify([...b].sort()),
      `estado misturado: ${final}`,
    );
  });

  it('não mexe nas preferências de outro usuário', async () => {
    await put({ categorySlugs: ['doces', 'churrasco', 'hamburguer'] }, makeToken(OUTRO));
    await put({ categorySlugs: ['pizza', 'bar', 'sushi'] });
    assert.deepEqual(ctx.fake.slugsOf(OUTRO), ['churrasco', 'doces', 'hamburguer']);
  });
});
