import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { TEST_JWT_SECRET, makeToken } from './helpers/testApp';

type Validation = typeof import('../src/modules/preferences/preferences.validation.js');
type AuthValidation = typeof import('../src/modules/auth/auth.validation.js');
type Jwt = typeof import('../src/shared/auth/jwt.js');

let parseUpdatePreferencesBody: Validation['parseUpdatePreferencesBody'];
let parseRegisterBody: AuthValidation['parseRegisterBody'];
let verifyAccessToken: Jwt['verifyAccessToken'];

before(async () => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  ({ parseUpdatePreferencesBody } = await import('../src/modules/preferences/preferences.validation.js'));
  ({ parseRegisterBody } = await import('../src/modules/auth/auth.validation.js'));
  ({ verifyAccessToken } = await import('../src/shared/auth/jwt.js'));
});

function fieldsOf(fn: () => unknown): string[] {
  try {
    fn();
  } catch (error) {
    return ((error as { details?: { field: string }[] }).details ?? []).map((d) => d.field);
  }
  assert.fail('era esperado um erro de validação');
}

describe('seleção de interesses (PUT /api/preferences)', () => {
  it('aceita 3 categorias válidas', () => {
    const input = parseUpdatePreferencesBody({ categorySlugs: ['sushi', 'pizza', 'bar'] });
    assert.deepEqual(input.categorySlugs, ['sushi', 'pizza', 'bar']);
    assert.equal(input.priceRange, undefined);
  });

  it('normaliza caixa/espaços e remove duplicados', () => {
    const input = parseUpdatePreferencesBody({
      categorySlugs: [' Sushi ', 'PIZZA', 'bar', 'sushi'],
    });
    assert.deepEqual(input.categorySlugs, ['sushi', 'pizza', 'bar']);
  });

  it('duplicados não contam para o mínimo de 3', () => {
    assert.deepEqual(
      fieldsOf(() => parseUpdatePreferencesBody({ categorySlugs: ['sushi', 'sushi', 'pizza'] })),
      ['categorySlugs'],
    );
  });

  for (const [nome, valor] of [
    ['ausente', undefined],
    ['não é lista', 'sushi'],
    ['lista vazia', []],
    ['só 2 categorias', ['sushi', 'pizza']],
    ['slug desconhecido', ['sushi', 'pizza', 'sorvete']],
    ['item que não é texto', ['sushi', 'pizza', 42]],
  ] as const) {
    it(`rejeita categorySlugs ${nome}`, () => {
      assert.deepEqual(
        fieldsOf(() => parseUpdatePreferencesBody({ categorySlugs: valor })),
        ['categorySlugs'],
      );
    });
  }

  it('rejeita corpo que não é objeto', () => {
    assert.deepEqual(fieldsOf(() => parseUpdatePreferencesBody(null)), ['categorySlugs']);
    assert.deepEqual(fieldsOf(() => parseUpdatePreferencesBody('texto')), ['categorySlugs']);
  });

  it('aceita as 3 faixas de preço, null e ausente', () => {
    const base = ['sushi', 'pizza', 'bar'];
    for (const priceRange of ['economico', 'moderado', 'premium']) {
      assert.equal(parseUpdatePreferencesBody({ categorySlugs: base, priceRange }).priceRange, priceRange);
    }
    assert.equal(parseUpdatePreferencesBody({ categorySlugs: base, priceRange: null }).priceRange, null);
    assert.equal(parseUpdatePreferencesBody({ categorySlugs: base }).priceRange, undefined);
  });

  it('rejeita faixa de preço inválida e acumula com outros erros', () => {
    const base = ['sushi', 'pizza', 'bar'];
    assert.deepEqual(
      fieldsOf(() => parseUpdatePreferencesBody({ categorySlugs: base, priceRange: 'luxo' })),
      ['priceRange'],
    );
    assert.deepEqual(
      fieldsOf(() => parseUpdatePreferencesBody({ categorySlugs: ['sushi'], priceRange: 5 })),
      ['categorySlugs', 'priceRange'],
    );
  });
});

describe('seleção de interesses no cadastro (POST /api/auth/register)', () => {
  const valido = { name: 'Ana', email: 'Ana@Example.com', password: 'senhaSegura' };

  it('exige pelo menos 3 categorias', () => {
    assert.deepEqual(
      fieldsOf(() => parseRegisterBody({ ...valido, categorySlugs: ['sushi', 'pizza'] })),
      ['categorySlugs'],
    );
  });

  it('aceita categorias válidas e normaliza o e-mail', () => {
    const input = parseRegisterBody({ ...valido, categorySlugs: ['sushi', 'pizza', 'doces'] });
    assert.equal(input.email, 'ana@example.com');
    assert.deepEqual(input.categorySlugs, ['sushi', 'pizza', 'doces']);
  });
});

describe('verifyAccessToken', () => {
  it('devolve o id do usuário de um token válido', () => {
    assert.equal(verifyAccessToken(makeToken('user-1')), 'user-1');
  });

  const invalidos: [string, string][] = [
    ['vazio', ''],
    ['sem 3 partes', 'a.b'],
    ['assinatura de outro segredo', makeToken('u', { secret: 'outro' })],
    ['expirado', makeToken('u', { exp: 1 })],
    ['alg diferente de HS256', makeToken('u', { alg: 'none' })],
    ['conteúdo adulterado', makeToken('u').replace(/^(\w+)\.\w+/, '$1.e30')],
  ];
  for (const [nome, token] of invalidos) {
    it(`rejeita token ${nome}`, () => {
      assert.throws(() => verifyAccessToken(token), { code: 'UNAUTHORIZED', statusCode: 401 });
    });
  }
});
