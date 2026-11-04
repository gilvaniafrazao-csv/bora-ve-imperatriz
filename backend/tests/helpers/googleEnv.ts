/**
 * Precisa ser o PRIMEIRO import do teste: config/env.ts lê as variáveis no
 * momento em que é carregado, e os imports do serviço de lugares o carregam.
 */
process.env.GOOGLE_MAPS_API_KEY = 'chave-de-teste';
