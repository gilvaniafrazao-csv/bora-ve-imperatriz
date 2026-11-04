import { createHash, randomBytes } from 'node:crypto';
import { AppError } from '../../shared/errors/AppError';

type Jose = typeof import('jose', { with: { 'resolution-mode': 'import' } });

type JwtClaims = {
  sub?: string;
  nonce?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  given_name?: string;
};

let joseModule: Promise<Jose> | null = null;

function loadJose(): Promise<Jose> {
  joseModule ??= import('jose') as Promise<Jose>;
  return joseModule;
}
import { readOAuthConfig, redirectUri } from './oauth.config';
import { OAuthProvider, ProviderProfile } from './oauth.types';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const APPLE_AUTHORIZE_URL = 'https://appleid.apple.com/auth/authorize';
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';
const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const FACEBOOK_GRAPH = 'https://graph.facebook.com/v21.0';
const FACEBOOK_JWKS_URL = 'https://www.facebook.com/.well-known/oauth/openid/jwks/';

type FetchImpl = typeof fetch;

let fetchImpl: FetchImpl = globalThis.fetch.bind(globalThis);

/** Permite aos testes responder Google, Apple e Facebook sem rede. */
export function setOAuthFetch(next: FetchImpl | null): void {
  fetchImpl = next ?? globalThis.fetch.bind(globalThis);
}

const jwksCache = new Map<string, { keys: ReturnType<Jose['createLocalJWKSet']>; expiresAt: number }>();

export function resetOAuthJwksCache(): void {
  jwksCache.clear();
}

export function createPkceVerifier(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function createNonce(): string {
  return randomBytes(16).toString('base64url');
}

function providerFailure(): AppError {
  return new AppError(
    'O provedor não concluiu o login. Tente novamente.',
    502,
    'OAUTH_PROVIDER_ERROR',
  );
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function postForm(url: string, fields: Record<string, string>): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams(fields),
    });
  } catch (error) {
    console.error('[oauth] token request failed', error instanceof Error ? error.message : 'network');
    throw providerFailure();
  }

  const body = await readJson(response);
  if (!response.ok || !body || typeof body !== 'object') {
    throw providerFailure();
  }
  return body;
}

async function keySet(url: string): Promise<ReturnType<Jose['createLocalJWKSet']>> {
  const cached = jwksCache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.keys;
  }

  let response: Response;
  try {
    response = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  } catch (error) {
    console.error('[oauth] jwks request failed', error instanceof Error ? error.message : 'network');
    throw providerFailure();
  }

  const body = await readJson(response);
  if (!response.ok || !body || typeof body !== 'object' || !('keys' in body)) {
    throw providerFailure();
  }

  const { createLocalJWKSet } = await loadJose();
  const keys = createLocalJWKSet(body as Parameters<Jose['createLocalJWKSet']>[0]);
  jwksCache.set(url, { keys, expiresAt: Date.now() + 10 * 60 * 1000 });
  return keys;
}

function isVerified(value: unknown): boolean {
  return value === true || value === 'true';
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function verifyIdToken(
  idToken: string,
  jwksUrl: string,
  options: { issuer: string | string[]; audience: string; nonce: string },
): Promise<JwtClaims> {
  try {
    const { jwtVerify } = await loadJose();
    const keys = await keySet(jwksUrl);
    const { payload } = await jwtVerify(idToken, keys, {
      issuer: options.issuer,
      audience: options.audience,
    });
    if (payload.nonce !== options.nonce) {
      throw providerFailure();
    }
    return payload as JwtClaims;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('[oauth] id_token rejected', error instanceof Error ? error.message : 'invalid');
    throw providerFailure();
  }
}

export function authorizationUrl(
  provider: OAuthProvider,
  input: { state: string; nonce: string; challenge: string },
): string {
  const config = readOAuthConfig();
  const callback = redirectUri(provider);

  if (provider === 'google') {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', config.googleClientId ?? '');
    url.searchParams.set('redirect_uri', callback);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', input.state);
    url.searchParams.set('nonce', input.nonce);
    url.searchParams.set('code_challenge', input.challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('prompt', 'select_account');
    return url.toString();
  }

  if (provider === 'facebook') {
    const url = new URL(`${FACEBOOK_GRAPH}/dialog/oauth`);
    url.searchParams.set('client_id', config.facebookAppId ?? '');
    url.searchParams.set('redirect_uri', callback);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email public_profile');
    url.searchParams.set('state', input.state);
    url.searchParams.set('nonce', input.nonce);
    url.searchParams.set('code_challenge', input.challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    return url.toString();
  }

  const url = new URL(APPLE_AUTHORIZE_URL);
  url.searchParams.set('client_id', config.appleServiceId ?? '');
  url.searchParams.set('redirect_uri', callback);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('response_mode', 'form_post');
  url.searchParams.set('scope', 'name email');
  url.searchParams.set('state', input.state);
  url.searchParams.set('nonce', input.nonce);
  url.searchParams.set('code_challenge', input.challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export function normalizePem(value: string): string {
  const unquoted = value.trim().replace(/^["']|["']$/g, '');
  return unquoted.includes('\\n') ? unquoted.replace(/\\n/g, '\n') : unquoted;
}

let appleKeyCache: { pem: string; key: Awaited<ReturnType<Jose['importPKCS8']>> } | null = null;

async function appleClientSecret(): Promise<{ secret: string; serviceId: string }> {
  const config = readOAuthConfig();
  const teamId = config.appleTeamId;
  const keyId = config.appleKeyId;
  const serviceId = config.appleServiceId;
  const privateKey = config.applePrivateKey;
  if (!teamId || !keyId || !serviceId || !privateKey) {
    throw providerFailure();
  }

  const pem = normalizePem(privateKey);
  try {
    const { importPKCS8, SignJWT } = await loadJose();
    if (appleKeyCache?.pem !== pem) {
      appleKeyCache = { pem, key: await importPKCS8(pem, 'ES256') };
    }
    const secret = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: keyId })
      .setIssuer(teamId)
      .setSubject(serviceId)
      .setAudience('https://appleid.apple.com')
      .setIssuedAt()
      .setExpirationTime('180d')
      .sign(appleKeyCache.key);
    return { secret, serviceId };
  } catch (error) {
    console.error('[oauth] apple client secret failed', error instanceof Error ? error.message : 'invalid key');
    throw providerFailure();
  }
}

function profileFromClaims(
  provider: OAuthProvider,
  payload: JwtClaims,
  nameOverride: string | null,
): ProviderProfile {
  const subject = asString(payload.sub);
  if (!subject) {
    throw providerFailure();
  }
  return {
    provider,
    subject,
    email: asString(payload.email)?.toLowerCase() ?? null,
    emailVerified: isVerified(payload.email_verified),
    name: nameOverride ?? asString(payload.name) ?? asString(payload.given_name),
  };
}

export async function exchangeGoogleCode(input: {
  code: string;
  verifier: string;
  nonce: string;
}): Promise<ProviderProfile> {
  const config = readOAuthConfig();
  const body = await postForm(GOOGLE_TOKEN_URL, {
    code: input.code,
    client_id: config.googleClientId ?? '',
    client_secret: config.googleClientSecret ?? '',
    redirect_uri: redirectUri('google'),
    grant_type: 'authorization_code',
    code_verifier: input.verifier,
  });
  const idToken = asString((body as { id_token?: unknown }).id_token);
  if (!idToken || !config.googleClientId) {
    throw providerFailure();
  }
  const payload = await verifyIdToken(idToken, GOOGLE_JWKS_URL, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: config.googleClientId,
    nonce: input.nonce,
  });
  return profileFromClaims('google', payload, null);
}

/**
 * A Apple só manda o nome na primeira autorização, no campo `user` do POST.
 */
export function applePersonName(userField: unknown): string | null {
  let parsed: unknown = userField;
  if (typeof userField === 'string') {
    try {
      parsed = JSON.parse(userField) as unknown;
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== 'object' || !('name' in parsed)) {
    return null;
  }
  const name = (parsed as { name?: { firstName?: unknown; lastName?: unknown } }).name;
  if (!name) {
    return null;
  }
  const parts = [name.firstName, name.lastName].filter((part): part is string => typeof part === 'string');
  const joined = parts.map((part) => part.trim()).filter(Boolean).join(' ');
  return joined || null;
}

export async function exchangeAppleCode(input: {
  code: string;
  verifier: string;
  nonce: string;
  personName: string | null;
}): Promise<ProviderProfile> {
  const { secret, serviceId } = await appleClientSecret();
  const body = await postForm(APPLE_TOKEN_URL, {
    code: input.code,
    client_id: serviceId,
    client_secret: secret,
    redirect_uri: redirectUri('apple'),
    grant_type: 'authorization_code',
    code_verifier: input.verifier,
  });
  const idToken = asString((body as { id_token?: unknown }).id_token);
  if (!idToken) {
    throw providerFailure();
  }
  const payload = await verifyIdToken(idToken, APPLE_JWKS_URL, {
    issuer: 'https://appleid.apple.com',
    audience: serviceId,
    nonce: input.nonce,
  });
  return profileFromClaims('apple', payload, input.personName);
}

export async function exchangeFacebookCode(input: {
  code: string;
  verifier: string;
  nonce: string;
}): Promise<ProviderProfile> {
  const config = readOAuthConfig();
  const appId = config.facebookAppId ?? '';
  const appSecret = config.facebookAppSecret ?? '';
  const tokenUrl = new URL(`${FACEBOOK_GRAPH}/oauth/access_token`);
  tokenUrl.searchParams.set('client_id', appId);
  tokenUrl.searchParams.set('client_secret', appSecret);
  tokenUrl.searchParams.set('redirect_uri', redirectUri('facebook'));
  tokenUrl.searchParams.set('code', input.code);
  tokenUrl.searchParams.set('code_verifier', input.verifier);

  let tokenResponse: Response;
  try {
    tokenResponse = await fetchImpl(tokenUrl);
  } catch (error) {
    console.error('[oauth] facebook token failed', error instanceof Error ? error.message : 'network');
    throw providerFailure();
  }
  const tokenBody = (await readJson(tokenResponse)) as { access_token?: unknown; id_token?: unknown } | null;
  const accessToken = tokenBody ? asString(tokenBody.access_token) : null;
  if (!tokenResponse.ok || !accessToken) {
    throw providerFailure();
  }

  const debugUrl = new URL(`${FACEBOOK_GRAPH}/debug_token`);
  debugUrl.searchParams.set('input_token', accessToken);
  debugUrl.searchParams.set('access_token', `${appId}|${appSecret}`);
  let debugResponse: Response;
  try {
    debugResponse = await fetchImpl(debugUrl);
  } catch (error) {
    console.error('[oauth] facebook debug_token failed', error instanceof Error ? error.message : 'network');
    throw providerFailure();
  }
  const debugBody = (await readJson(debugResponse)) as { data?: { app_id?: unknown; is_valid?: unknown } } | null;
  const debug = debugBody?.data;
  if (!debugResponse.ok || !debug || debug.is_valid !== true || String(debug.app_id ?? '') !== appId) {
    throw providerFailure();
  }

  const meUrl = new URL(`${FACEBOOK_GRAPH}/me`);
  meUrl.searchParams.set('fields', 'id,name,email');
  meUrl.searchParams.set('access_token', accessToken);
  let meResponse: Response;
  try {
    meResponse = await fetchImpl(meUrl);
  } catch (error) {
    console.error('[oauth] facebook profile failed', error instanceof Error ? error.message : 'network');
    throw providerFailure();
  }
  const me = (await readJson(meResponse)) as { id?: unknown; name?: unknown; email?: unknown } | null;
  const subject = me ? asString(me.id) : null;
  if (!meResponse.ok || !me || !subject) {
    throw providerFailure();
  }

  let emailVerified = false;
  let email = asString(me.email)?.toLowerCase() ?? null;
  let name = asString(me.name);
  const idToken = asString(tokenBody?.id_token);
  if (idToken) {
    const payload = await verifyIdToken(idToken, FACEBOOK_JWKS_URL, {
      issuer: 'https://www.facebook.com',
      audience: appId,
      nonce: input.nonce,
    });
    if (asString(payload.sub) !== subject) {
      throw providerFailure();
    }
    emailVerified = isVerified(payload.email_verified);
    email = asString(payload.email)?.toLowerCase() ?? email;
    name = name ?? asString(payload.name);
  }

  return {
    provider: 'facebook',
    subject,
    email,
    emailVerified,
    name,
  };
}

export async function exchangeAuthorizationCode(
  provider: OAuthProvider,
  input: { code: string; verifier: string; nonce: string; personName: string | null },
): Promise<ProviderProfile> {
  if (provider === 'google') {
    return exchangeGoogleCode(input);
  }
  if (provider === 'apple') {
    return exchangeAppleCode(input);
  }
  return exchangeFacebookCode(input);
}
