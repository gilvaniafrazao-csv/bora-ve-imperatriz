import 'dotenv/config';

function cleanEnv(value: string | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
  return trimmed.length > 0 ? trimmed : undefined;
}

function required(name: string, value: string | undefined): string {
  const cleaned = cleanEnv(value);
  if (!cleaned) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Confira o arquivo .env (veja .env.example).`,
    );
  }
  return cleaned;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3333),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean),

  // Em desenvolvimento sem Supabase configurado ainda, deixamos o valor
  // opcional para não travar o `npm run dev` — mas ao usar o client
  // (src/config/supabase.ts) a ausência será validada.
  supabaseUrl: cleanEnv(process.env.SUPABASE_URL)?.replace(/\/+$/, ''),
  supabaseServiceRoleKey: cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),

  jwtSecret: cleanEnv(process.env.JWT_SECRET),
};

export function assertSupabaseEnv(): { url: string; serviceRoleKey: string } {
  return {
    url: required('SUPABASE_URL', env.supabaseUrl),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY', env.supabaseServiceRoleKey),
  };
}
