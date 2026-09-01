import 'dotenv/config';

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Confira o arquivo .env (veja .env.example).`,
    );
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3333),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim()),

  // Em desenvolvimento sem Supabase configurado ainda, deixamos o valor
  // opcional para não travar o `npm run dev` — mas ao usar o client
  // (src/config/supabase.ts) a ausência será validada.
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  jwtSecret: process.env.JWT_SECRET,
};

export function assertSupabaseEnv(): { url: string; serviceRoleKey: string } {
  return {
    url: required('SUPABASE_URL', env.supabaseUrl),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY', env.supabaseServiceRoleKey),
  };
}
