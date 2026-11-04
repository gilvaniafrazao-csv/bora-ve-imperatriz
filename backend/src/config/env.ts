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
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  mailFrom: process.env.MAIL_FROM,
  frontendUrl: (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/+$/, ''),
};

export function assertSupabaseEnv(): { url: string; serviceRoleKey: string } {
  return {
    url: required('SUPABASE_URL', env.supabaseUrl),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY', env.supabaseServiceRoleKey),
  };
}

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  ignoreTLS: boolean;
  auth?: { user: string; pass: string };
  from: string;
};

export function getMailConfig(): MailConfig {
  if (env.nodeEnv === 'production') {
    return {
      host: required('SMTP_HOST', env.smtpHost),
      port: env.smtpPort ?? (env.smtpSecure ? 465 : 587),
      secure: env.smtpSecure,
      requireTLS: !env.smtpSecure,
      ignoreTLS: false,
      auth: {
        user: required('SMTP_USER', env.smtpUser),
        pass: required('SMTP_PASS', env.smtpPass),
      },
      from: required('MAIL_FROM', env.mailFrom),
    };
  }

  // Desenvolvimento: Mailpit local do Supabase, sem TLS e sem credenciais.
  return {
    host: env.smtpHost ?? '127.0.0.1',
    port: env.smtpPort ?? 54325,
    secure: false,
    requireTLS: false,
    ignoreTLS: true,
    from: env.mailFrom ?? 'Bora Ve <nao-responda@boraveimperatriz.local>',
  };
}
