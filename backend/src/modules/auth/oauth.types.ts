export const OAUTH_PROVIDERS = ['google', 'apple', 'facebook'] as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export type OAuthFrom = 'login' | 'cadastro';

export type ProviderProfile = {
  provider: OAuthProvider;
  subject: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
};

export type PendingProfile = {
  provider: OAuthProvider;
  subject: string;
  email: string;
  name: string;
};

export function isOAuthProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}
