import { getSupabaseClient } from '../../config/supabase';
import { AppError } from '../../shared/errors/AppError';
import { EstablishmentRow } from './establishments.types';

const DETAILS_COLUMNS = `
  id, name, description, street, number, neighborhood, city, state, postal_code,
  latitude, longitude, phone, whatsapp, email, website, social_links, opening_hours,
  price_range,
  establishment_categories ( categories ( slug, name, category_group ) ),
  establishment_photos ( id, url, alt, sort_order, is_cover )
`;

/*
 * O backend usa a Service Role e ignora a RLS, entao o filtro de status
 * precisa estar aqui: so estabelecimentos ativos sao publicos.
 */
export async function findActiveEstablishmentById(id: string): Promise<EstablishmentRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('establishments')
    .select(DETAILS_COLUMNS)
    .eq('id', id)
    .eq('status', 'ativo')
    .maybeSingle<EstablishmentRow>();

  if (error) {
    console.error('[establishments.repository] falha ao buscar estabelecimento', error);
    throw new AppError(
      'Não foi possível carregar o estabelecimento. Tente novamente mais tarde.',
      503,
      'DATABASE_UNAVAILABLE',
    );
  }

  return data ?? null;
}