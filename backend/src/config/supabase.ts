import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { assertSupabaseEnv } from './env';

let client: SupabaseClient | null = null;

/**
 * Retorna um client Supabase único (singleton), usando a Service Role Key.
 * A conexão só é criada na primeira chamada — assim o servidor consegue
 * subir mesmo antes das credenciais do Supabase estarem configuradas
 * (útil neste momento inicial do setup, TASK-BV-INFRA-03).
 */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const { url, serviceRoleKey } = assertSupabaseEnv();
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
