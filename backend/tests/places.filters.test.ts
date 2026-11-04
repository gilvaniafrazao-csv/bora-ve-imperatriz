import './helpers/googleEnv';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  applyPlaceFilters,
  googleOptionsFor,
  hasActiveFilters,
} from '../src/modules/places/places.service.js';
import type { GooglePlace } from '../src/modules/places/places.repository.js';
import type { PlaceFilters, PlaceSummary } from '../src/modules/places/places.types.js';
import { parsePlaceSearchQuery } from '../src/modules/places/places.validation.js';
import { TestContext, request, startTestApp } from './helpers/testApp';

const NO_FILTERS: PlaceFilters = { prices: [], openNow: false, sort: 'relevancia' };

function fieldsOf(query: Record<string, unknown>): string[] {
  try {
    parsePlaceSearchQuery(query);
  } catch (error) {
    return ((error as { details?: { field: string }[] }).details ?? []).map((d) => d.field);
  }
  assert.fail('era esperado um erro de validação');
}

describe('parsePlaceSearchQuery — filtros', () => {
  it('sem filtros: valores neutros', () => {
    const input = parsePlaceSearchQuery({ q: 'pizza' });
    assert.equal(input.category, undefined);
    assert.deepEqual(input.prices, []);
    assert.equal(input.maxDistanceKm, undefined);
    assert.equal(input.openNow, false);
    assert.equal(input.sort, 'relevancia');
  });

  it('categoria ignora caixa e acentos; "Todos" não filtra', () => {
    assert.equal(parsePlaceSearchQuery({ categoria: 'vida noturna' }).category, 'Vida Noturna');
    assert.equal(parsePlaceSearchQuery({ categoria: 'AO AR LIVRE' }).category, 'Ao ar livre');
    assert.equal(parsePlaceSearchQuery({ categoria: 'Todos' }).category, undefined);
  });

  it('preço aceita lista por vírgula, repetido e remove duplicados', () => {
    assert.deepEqual(parsePlaceSearchQuery({ preco: '$,$$' }).prices, ['$', '$$']);
    assert.deepEqual(parsePlaceSearchQuery({ preco: ['$', '$$$', '$'] }).prices, ['$', '$$$']);
  });

  it('raio em km aceita decimal com vírgula; aberto e ordenar', () => {
    assert.equal(parsePlaceSearchQuery({ raioKm: '2,5' }).maxDistanceKm, 2.5);
    assert.equal(parsePlaceSearchQuery({ aberto: 'true' }).openNow, true);
    assert.equal(parsePlaceSearchQuery({ aberto: 'sim' }).openNow, true);
    assert.equal(parsePlaceSearchQuery({ aberto: 'false' }).openNow, false);
    assert.equal(parsePlaceSearchQuery({ ordenar: 'NOTA' }).sort, 'nota');
  });

  const invalidos: [string, Record<string, unknown>, string][] = [
    ['categoria desconhecida', { categoria: 'Inventada' }, 'categoria'],
    ['preço fora da lista', { preco: '$$$$' }, 'preco'],
    ['preço como objeto', { preco: { a: '1' } }, 'preco'],
    ['raio abaixo do mínimo', { raioKm: '0.1' }, 'raioKm'],
    ['raio acima do máximo', { raioKm: '41' }, 'raioKm'],
    ['raio não numérico', { raioKm: 'perto' }, 'raioKm'],
    ['aberto com valor estranho', { aberto: 'talvez' }, 'aberto'],
    ['ordenação desconhecida', { ordenar: 'preco' }, 'ordenar'],
  ];
  for (const [nome, query, campo] of invalidos) {
    it(`rejeita ${nome}`, () => {
      assert.ok(fieldsOf(query).includes(campo), `esperava erro em ${campo}`);
    });
  }

  it('acumula vários erros de filtro de uma vez', () => {
    assert.deepEqual(fieldsOf({ categoria: 'x', preco: 'y', raioKm: '99' }).sort(), [
      'categoria',
      'preco',
      'raioKm',
    ]);
  });
});

function summary(overrides: Partial<PlaceSummary> & { id: string }): PlaceSummary {
  return {
    name: overrides.id,
    category: 'Restaurante',
    categories: ['Restaurantes'],
    address: 'Imperatriz',
    rating: null,
    reviewCount: null,
    price: '',
    openNow: null,
    latitude: -5.5,
    longitude: -47.5,
    distanceKm: null,
    mapsUrl: 'x',
    photosUrl: null,
    ...overrides,
  };
}

describe('applyPlaceFilters / googleOptionsFor', () => {
  const places = [
    summary({ id: 'a', price: '$', rating: 4.0, reviewCount: 10, openNow: true, distanceKm: 1 }),
    summary({ id: 'b', price: '$$', rating: 4.8, reviewCount: 5, openNow: false, distanceKm: 3, categories: ['Bares', 'Vida Noturna'] }),
    summary({ id: 'c', price: '$$', rating: 4.8, reviewCount: 50, openNow: true, distanceKm: null }),
    summary({ id: 'd', price: '', rating: null, openNow: null, distanceKm: 2 }),
  ];
  const ids = (list: PlaceSummary[]) => list.map((p) => p.id);

  it('sem filtros devolve tudo, na mesma ordem', () => {
    assert.deepEqual(ids(applyPlaceFilters(places, NO_FILTERS)), ['a', 'b', 'c', 'd']);
  });

  it('categoria usa os grupos do lugar', () => {
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, category: 'Bares' })), ['b']);
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, category: 'Vida Noturna' })), ['b']);
  });

  it('preço: lugar sem preço não passa quando há filtro', () => {
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, prices: ['$$'] })), ['b', 'c']);
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, prices: ['$', '$$'] })), ['a', 'b', 'c']);
  });

  it('aberto agora: só quem está aberto (null não conta)', () => {
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, openNow: true })), ['a', 'c']);
  });

  it('distância: sem localização não passa; limite é inclusivo', () => {
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, maxDistanceKm: 2 })), ['a', 'd']);
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, maxDistanceKm: 3 })), ['a', 'b', 'd']);
  });

  it('ordenar por nota: maior primeiro, empate pelas avaliações, sem nota por último', () => {
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, sort: 'nota' })), ['c', 'b', 'a', 'd']);
  });

  it('ordenar por distância: menor primeiro, sem localização por último', () => {
    assert.deepEqual(ids(applyPlaceFilters(places, { ...NO_FILTERS, sort: 'distancia' })), ['a', 'd', 'b', 'c']);
  });

  it('não altera a lista original', () => {
    const copy = ids(places);
    applyPlaceFilters(places, { ...NO_FILTERS, sort: 'nota', prices: ['$$'] });
    assert.deepEqual(ids(places), copy);
  });

  it('googleOptionsFor: 12 sem filtros; 20 com filtros; preço vira priceLevel', () => {
    assert.equal(hasActiveFilters(NO_FILTERS), false);
    assert.deepEqual(googleOptionsFor(NO_FILTERS), { pageSize: 12 });
    assert.deepEqual(googleOptionsFor({ ...NO_FILTERS, openNow: true, prices: ['$$$'] }), {
      pageSize: 20,
      openNow: true,
      priceLevels: ['PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE'],
    });
    assert.deepEqual(googleOptionsFor({ ...NO_FILTERS, category: 'Bares' }), { pageSize: 20 });
    assert.equal(
      googleOptionsFor({ ...NO_FILTERS, sort: 'nota' }).pageSize,
      12,
      'ordenar sozinho não é filtro',
    );
  });
});

// ---------- API, com o Google simulado ----------

type GoogleCall = { url: string; body: Record<string, unknown> };
type GoogleReply = { status: number; body: unknown };

const USER = { lat: -5.5264, lon: -47.4916 };
/** Ponto a `km` quilômetros ao norte do usuário (1° de latitude ≈ 111,19 km). */
const at = (km: number) => ({ latitude: USER.lat + km / 111.19, longitude: USER.lon });

function gp(options: {
  id: string;
  name: string;
  type: string;
  typeName: string;
  rating?: number;
  count?: number;
  price?: string;
  open?: boolean;
  km?: number | null;
  address?: string;
}): GooglePlace {
  return {
    id: options.id,
    displayName: { text: options.name },
    formattedAddress: options.address ?? 'Rua X, 100 - Centro, Imperatriz - MA',
    primaryType: options.type,
    primaryTypeDisplayName: { text: options.typeName },
    rating: options.rating,
    userRatingCount: options.count,
    priceLevel: options.price,
    currentOpeningHours: options.open === undefined ? undefined : { openNow: options.open },
    location: options.km === null ? undefined : at(options.km ?? 0),
    googleMapsUri: `https://maps.example/${options.id}`,
  };
}

const DEFAULT_PLACES: GooglePlace[] = [
  gp({ id: 'p1', name: 'Pizzaria Nostra', type: 'restaurant', typeName: 'Pizzaria', rating: 4.8, count: 120, price: 'PRICE_LEVEL_MODERATE', open: true, km: 1.2 }),
  gp({ id: 'p2', name: 'Café da Praça', type: 'cafe', typeName: 'Cafeteria', rating: 4.7, count: 80, price: 'PRICE_LEVEL_INEXPENSIVE', open: true, km: 2.1 }),
  gp({ id: 'p3', name: 'Varanda 51', type: 'bar', typeName: 'Bar', rating: 4.6, count: 200, price: 'PRICE_LEVEL_EXPENSIVE', open: false, km: 3.4 }),
  gp({ id: 'p4', name: 'Espaço Cultural', type: 'museum', typeName: 'Museu', rating: 4.5, count: 50, open: true, km: 4.3 }),
  gp({ id: 'p5', name: 'Balada Neon', type: 'night_club', typeName: 'Casa noturna', price: 'PRICE_LEVEL_MODERATE', km: 8 }),
  gp({ id: 'p6', name: 'Marmitaria Sem Mapa', type: 'restaurant', typeName: 'Restaurante', rating: 4.0, count: 10, price: 'PRICE_LEVEL_INEXPENSIVE', open: true, km: null }),
  gp({ id: 'p7', name: 'Lugar de Outra Cidade', type: 'restaurant', typeName: 'Restaurante', rating: 5, address: 'Av. Y - São Luís - MA', km: 1 }),
];

let ctx: TestContext;
let calls: GoogleCall[] = [];
let googlePlaces: GooglePlace[] = DEFAULT_PLACES;
let neighborhood: { name: string; km: number } | null = null;
let googleReply: ((call: GoogleCall) => GoogleReply) | null = null;
const realFetch = globalThis.fetch;

before(async () => {
  ctx = await startTestApp();
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith('https://places.googleapis.com/')) {
      return realFetch(input, init);
    }
    const call: GoogleCall = { url, body: JSON.parse(String(init?.body ?? '{}')) };
    const isNeighborhood = String(call.body.textQuery).endsWith('Imperatriz, MA, Brasil');
    if (isNeighborhood) {
      const place = neighborhood
        ? { displayName: { text: neighborhood.name }, formattedAddress: 'Imperatriz - MA', location: at(neighborhood.km) }
        : null;
      return new Response(JSON.stringify({ places: place ? [place] : [] }), { status: 200 });
    }
    calls.push(call);
    const reply = googleReply ? googleReply(call) : { status: 200, body: { places: googlePlaces } };
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  }) as typeof fetch;
});
after(async () => {
  globalThis.fetch = realFetch;
  await ctx.close();
});
beforeEach(() => {
  calls = [];
  googlePlaces = DEFAULT_PLACES;
  neighborhood = null;
  googleReply = null;
});

const search = (query = '') => request(ctx, 'GET', `/api/places/search${query}`);
const ids = (res: { json: { places: { id: string }[] } }) => res.json.places.map((p) => p.id);
const LOC = `lat=${USER.lat}&lon=${USER.lon}`;

describe('GET /api/places/search — sem filtros (comportamento original)', () => {
  it('continua devolvendo a lista do Google, sem filtrar, com 12 resultados pedidos', async () => {
    const res = await search();
    assert.equal(res.status, 200);
    assert.deepEqual(ids(res), ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], 'p7 é de outra cidade');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].body.pageSize, 12);
    assert.equal(calls[0].body.textQuery, 'restaurantes, bares e cafés em Imperatriz, MA');
    assert.equal('openNow' in calls[0].body, false);
    assert.equal('priceLevels' in calls[0].body, false);
  });

  it('informa os filtros aplicados (todos neutros) e o total', async () => {
    const res = await search();
    assert.deepEqual(res.json.filters, {
      category: null,
      prices: [],
      maxDistanceKm: null,
      openNow: false,
      sort: 'relevancia',
    });
    assert.equal(res.json.total, 6);
  });
});

describe('GET /api/places/search — categoria', () => {
  it('só a categoria: pergunta ao Google pelo tipo e mantém só esse grupo', async () => {
    const res = await search('?categoria=Bares');
    assert.deepEqual(ids(res), ['p3']);
    assert.match(String(calls[0].body.textQuery), /^bares e pubs em Imperatriz, MA$/);
    assert.equal(calls[0].body.pageSize, 20);
  });

  it('com texto: o texto manda no pedido, a categoria filtra o resultado', async () => {
    const res = await search('?q=pizza&categoria=Restaurantes');
    assert.match(String(calls[0].body.textQuery), /^pizza em Imperatriz/);
    assert.deepEqual(ids(res), ['p1', 'p6']);
  });

  it('"Vida Noturna" inclui bares e casas noturnas; ignora caixa e acento', async () => {
    assert.deepEqual(ids(await search('?categoria=vida%20noturna')), ['p3', 'p5']);
  });

  it('"Todos" equivale a não filtrar', async () => {
    const res = await search('?categoria=Todos');
    assert.equal(res.json.filters.category, null);
    assert.equal(res.json.total, 6);
  });
});

describe('GET /api/places/search — preço', () => {
  it('envia priceLevels ao Google e filtra o resultado', async () => {
    const res = await search('?preco=%24%24');
    assert.deepEqual(calls[0].body.priceLevels, ['PRICE_LEVEL_MODERATE']);
    assert.deepEqual(ids(res), ['p1', 'p5']);
  });

  it('várias faixas; "$$$" cobre caro e muito caro', async () => {
    const res = await search('?preco=%24,%24%24%24');
    assert.deepEqual(calls[0].body.priceLevels, [
      'PRICE_LEVEL_INEXPENSIVE',
      'PRICE_LEVEL_EXPENSIVE',
      'PRICE_LEVEL_VERY_EXPENSIVE',
    ]);
    assert.deepEqual(ids(res), ['p2', 'p3', 'p6']);
  });

  it('lugar sem faixa de preço não aparece quando há filtro de preço', async () => {
    const res = await search('?preco=%24%24%24');
    assert.ok(!ids(res).includes('p4'));
  });
});

describe('GET /api/places/search — aberto agora', () => {
  it('envia openNow ao Google e mantém só quem está aberto (sem horário não conta)', async () => {
    const res = await search('?aberto=true');
    assert.equal(calls[0].body.openNow, true);
    assert.deepEqual(ids(res), ['p1', 'p2', 'p4', 'p6']);
  });

  it('aberto=false não filtra', async () => {
    const res = await search('?aberto=false');
    assert.equal('openNow' in calls[0].body, false);
    assert.equal(res.json.total, 6);
  });
});

describe('GET /api/places/search — distância', () => {
  it('raioKm mantém quem está a até X km da sua posição; sem localização fica de fora', async () => {
    const res = await search(`?${LOC}&raioKm=3`);
    assert.deepEqual(ids(res), ['p1', 'p2']);
    assert.equal(res.json.area.usedDeviceLocation, true);
    assert.equal(res.json.filters.maxDistanceKm, 3);
  });

  it('o limite é inclusivo', async () => {
    assert.deepEqual(ids(await search(`?${LOC}&raioKm=3.4`)), ['p1', 'p2', 'p3']);
  });

  it('sem posição do usuário, mede a partir do centro da cidade', async () => {
    const res = await search('?raioKm=2');
    assert.deepEqual(ids(res), ['p1']);
    assert.equal(res.json.area.usedDeviceLocation, false);
  });

  it('com bairro, mede a partir do bairro', async () => {
    neighborhood = { name: 'Juçara', km: 10 };
    googlePlaces = [
      ...DEFAULT_PLACES,
      gp({ id: 'p8', name: 'Perto do Juçara', type: 'cafe', typeName: 'Cafeteria', rating: 4.2, count: 9, km: 10.5 }),
    ];
    // a Balada Neon (p5) fica a exatamente 2 km do bairro; com raio de 1 km só o p8 (0,5 km) entra
    const res = await search('?bairro=Ju%C3%A7ara&raioKm=1');
    assert.deepEqual(ids(res), ['p8']);
    assert.equal(res.json.area.neighborhoodResolved, true);
  });
});

describe('GET /api/places/search — ordenação e combinação', () => {
  it('ordenar=nota: maior nota primeiro, sem nota por último', async () => {
    assert.deepEqual(ids(await search('?ordenar=nota')), ['p1', 'p2', 'p3', 'p4', 'p6', 'p5']);
  });

  it('ordenar=distancia: mais perto primeiro, sem localização por último', async () => {
    assert.deepEqual(ids(await search(`?${LOC}&ordenar=distancia`)), ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
  });

  it('ordenar sozinho não troca o tamanho do pedido nem filtra', async () => {
    const res = await search('?ordenar=nota');
    assert.equal(calls[0].body.pageSize, 12);
    assert.equal(res.json.total, 6);
  });

  it('todos os filtros juntos (E)', async () => {
    const res = await search(`?${LOC}&categoria=Cafeterias&preco=%24&aberto=true&raioKm=5&ordenar=nota`);
    assert.deepEqual(ids(res), ['p2']);
    assert.deepEqual(res.json.filters, {
      category: 'Cafeterias',
      prices: ['$'],
      maxDistanceKm: 5,
      openNow: true,
      sort: 'nota',
    });
  });

  it('filtros sem nenhum resultado -> 200 com lista vazia', async () => {
    const res = await search('?categoria=Esportes');
    assert.equal(res.status, 200);
    assert.deepEqual(res.json.places, []);
    assert.equal(res.json.total, 0);
  });
});

describe('GET /api/places/search — se o Google recusar os filtros', () => {
  it('tenta de novo sem os filtros do pedido e ainda filtra no servidor', async () => {
    googleReply = (call) =>
      'openNow' in call.body || 'priceLevels' in call.body
        ? { status: 400, body: { error: 'INVALID_ARGUMENT' } }
        : { status: 200, body: { places: DEFAULT_PLACES } };
    const res = await search('?aberto=true&preco=%24');
    assert.equal(res.status, 200);
    assert.equal(calls.length, 2);
    assert.equal('openNow' in calls[1].body, false);
    assert.equal('priceLevels' in calls[1].body, false);
    assert.equal(calls[1].body.pageSize, 20);
    assert.deepEqual(ids(res), ['p2', 'p6']);
  });

  it('se a segunda tentativa também falhar -> 503', async () => {
    googleReply = () => ({ status: 500, body: {} });
    const res = await search('?aberto=true');
    assert.equal(res.status, 503);
    assert.equal(res.json.error.code, 'PLACES_UNAVAILABLE');
    assert.equal(calls.length, 2);
  });

  it('sem filtros do Google no pedido não há segunda tentativa', async () => {
    googleReply = () => ({ status: 500, body: {} });
    const res = await search('?categoria=Bares');
    assert.equal(res.status, 503);
    assert.equal(calls.length, 1);
  });
});

describe('GET /api/places/search — filtros inválidos', () => {
  const invalidos: [string, string, string][] = [
    ['categoria desconhecida', '?categoria=Inventada', 'categoria'],
    ['preço inválido', '?preco=%24%24%24%24', 'preco'],
    ['raio fora do intervalo', '?raioKm=99', 'raioKm'],
    ['aberto inválido', '?aberto=talvez', 'aberto'],
    ['ordenação inválida', '?ordenar=preco', 'ordenar'],
  ];
  for (const [nome, query, campo] of invalidos) {
    it(`${nome} -> 400 com detalhes e sem chamar o Google`, async () => {
      const res = await search(query);
      assert.equal(res.status, 400);
      assert.equal(res.json.error.code, 'VALIDATION_ERROR');
      assert.ok(res.json.error.details.some((d: { field: string }) => d.field === campo));
      assert.equal(calls.length, 0);
    });
  }
});
