import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AppError } from '../src/shared/errors/AppError';
import { categoryGroups, distanceKm, priceSymbol } from '../src/modules/places/places.service';
import { parsePlaceSearchQuery } from '../src/modules/places/places.validation';

describe('busca de lugares', () => {
  it('aceita termo, bairro opcional e coordenadas', () => {
    const input = parsePlaceSearchQuery({
      q: ' pizza ',
      bairro: ' Juçara ',
      lat: '-5.52',
      lon: '-47.48',
    });

    assert.equal(input.query, 'pizza');
    assert.equal(input.neighborhood, 'Juçara');
    assert.equal(input.latitude, -5.52);
    assert.equal(input.longitude, -47.48);
  });

  it('trata bairro vazio e "Perto de mim" como ausente', () => {
    const input = parsePlaceSearchQuery({ q: 'bar', regiao: 'Perto de mim' });
    assert.equal(input.neighborhood, undefined);
    assert.equal(parsePlaceSearchQuery({ q: 'bar', bairro: '   ' }).neighborhood, undefined);
  });

  it('recusa coordenada solta ou busca longa demais', () => {
    assert.throws(() => parsePlaceSearchQuery({ q: 'pizza', lat: '-5.5' }), AppError);
    assert.throws(() => parsePlaceSearchQuery({ q: 'a'.repeat(81) }), AppError);
  });

  it('mapeia preço e categoria do Google para os filtros da tela', () => {
    assert.equal(priceSymbol('PRICE_LEVEL_INEXPENSIVE'), '$');
    assert.equal(priceSymbol('PRICE_LEVEL_MODERATE'), '$$');
    assert.equal(priceSymbol('PRICE_LEVEL_EXPENSIVE'), '$$$');
    assert.equal(priceSymbol(undefined), '');
    assert.deepEqual(categoryGroups('pizza_restaurant'), ['Restaurantes']);
    assert.deepEqual(categoryGroups('bar'), ['Bares', 'Vida Noturna']);
  });

  it('calcula distância curta dentro da cidade', () => {
    const km = distanceKm(
      { latitude: -5.5264, longitude: -47.4916 },
      { latitude: -5.5214, longitude: -47.4797 },
    );
    assert.ok(km > 0.5 && km < 3, `distância inesperada: ${km}`);
  });
});
