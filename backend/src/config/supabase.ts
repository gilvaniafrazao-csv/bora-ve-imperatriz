import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../shared/errors/AppError';
import { assertSupabaseEnv } from './env';

let client: SupabaseClient | null = null;

function isLegacyJwtKey(key: string): boolean {
  return key.startsWith('eyJ') && key.split('.').length === 3;
}

/**
 * Chaves novas (`sb_secret_...`) não são JWT. Se o client as manda em
 * `Authorization: Bearer`, o PostgREST responde Invalid JWT e a API cai em 500.
 */
function fetchWithoutSecretAsBearer(apiKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set('apikey', apiKey);
    const authorization = headers.get('Authorization');
    if (!authorization || authorization === `Bearer ${apiKey}`) {
      headers.delete('Authorization');
    }
    return fetch(input, { ...init, headers });
  };
}

/**
 * Retorna um client Supabase único (singleton), usando a Service Role Key.
 * A conexão só é criada na primeira chamada — assim o servidor consegue
 * subir mesmo antes das credenciais do Supabase estarem configuradas
 * (útil neste momento inicial do setup, TASK-BV-INFRA-03).
 */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    try {
      const { url, serviceRoleKey } = assertSupabaseEnv();
      client = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: isLegacyJwtKey(serviceRoleKey)
          ? undefined
          : { fetch: fetchWithoutSecretAsBearer(serviceRoleKey) },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('[supabase] failed to create client', error);
      throw new AppError(
        'Não foi possível conectar ao banco. Tente novamente mais tarde.',
        503,
        'DATABASE_UNAVAILABLE',
      );
    }
  }
  return client;
}
