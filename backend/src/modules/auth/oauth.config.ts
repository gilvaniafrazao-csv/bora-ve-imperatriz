import { OAuthProvider } from './oauth.types';

export type OAuthCredentials = {
  apiPublicUrl: string;
  frontendOrigin: string;
  googleClientId?: string;
  googleClientSecret?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
  appleTeamId?: string;
  appleKeyId?: string;
  appleServiceId?: string;
  applePrivateKey?: string;
};

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function frontendOrigin(): string {
  const value = clean(process.env.FRONTEND_URL) ?? 'http://localhost:3000';
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'http://localhost:3000';
    }
    return url.origin;
  } catch {
    return 'http://localhost:3000';
  }
}

/**
 * Lido a cada request para os testes poderem ligar e desligar provedores
 * sem reiniciar o processo. Segredos nunca vão para o navegador.
 */
export function readOAuthConfig(): OAuthCredentials {
  return {
    apiPublicUrl: (clean(process.env.API_PUBLIC_URL) ?? 'http://localhost:3333').replace(/\/+$/, ''),
    frontendOrigin: frontendOrigin(),
    googleClientId: clean(process.env.GOOGLE_OAUTH_CLIENT_ID),
    googleClientSecret: clean(process.env.GOOGLE_OAUTH_CLIENT_SECRET),
    facebookAppId: clean(process.env.FACEBOOK_APP_ID),
    facebookAppSecret: clean(process.env.FACEBOOK_APP_SECRET),
    appleTeamId: clean(process.env.APPLE_TEAM_ID),
    appleKeyId: clean(process.env.APPLE_KEY_ID),
    appleServiceId: clean(process.env.APPLE_SERVICE_ID),
    applePrivateKey: clean(process.env.APPLE_PRIVATE_KEY),
  };
}

export function isProviderConfigured(provider: OAuthProvider): boolean {
  const config = readOAuthConfig();
  if (provider === 'google') {
    return Boolean(config.googleClientId && config.googleClientSecret);
  }
  if (provider === 'facebook') {
    return Boolean(config.facebookAppId && config.facebookAppSecret);
  }
  return Boolean(
    config.appleTeamId && config.appleKeyId && config.appleServiceId && config.applePrivateKey,
  );
}

export function redirectUri(provider: OAuthProvider): string {
  return `${readOAuthConfig().apiPublicUrl}/api/auth/oauth/${provider}/callback`;
}

export function frontendPath(from: 'login' | 'cadastro', params: Record<string, string>): string {
  const url = new URL(`/${from}`, readOAuthConfig().frontendOrigin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function retornoUrl(code: string): string {
  const url = new URL('/auth/retorno', readOAuthConfig().frontendOrigin);
  url.searchParams.set('code', code);
  return url.toString();
}
