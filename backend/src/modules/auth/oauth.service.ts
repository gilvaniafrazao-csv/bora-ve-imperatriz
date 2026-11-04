import { AppError } from '../../shared/errors/AppError';
import { issueAccessToken } from './auth.service';
import {
  deleteUserById,
  findAuthUserByEmail,
  findCategoryIdsBySlugs,
  findIdentity,
  findUserById,
  insertIdentity,
  insertUser,
  insertUserPreferences,
} from './auth.repository';
import { PublicUser } from './auth.types';
import { parseCategorySlugs } from './auth.validation';
import { OnboardingCategorySlug } from './onboarding-categories';
import { frontendPath, isProviderConfigured, retornoUrl } from './oauth.config';
import {
  applePersonName,
  authorizationUrl,
  createNonce,
  createPkceVerifier,
  exchangeAuthorizationCode,
} from './oauth.providers';
import {
  createTransaction,
  exchangeTicket,
  OAuthExchangeBody,
  putPendingTicket,
  putSessionTicket,
  restorePendingTicket,
  takePendingTicket,
  takeTransaction,
} from './oauth.store';
import { OAuthFrom, OAuthProvider, PendingProfile, ProviderProfile } from './oauth.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_CODES: Record<string, string> = {
  OAUTH_NOT_CONFIGURED: 'nao-configurado',
  OAUTH_STATE: 'state',
  OAUTH_EMAIL_UNVERIFIED: 'email-nao-verificado',
  OAUTH_EMAIL_MISSING: 'sem-email',
  OAUTH_PROVIDER_ERROR: 'provedor',
  OAUTH_CODE_INVALID: 'codigo',
};

function failureUrl(from: OAuthFrom, code: string, provider: OAuthProvider): string {
  return frontendPath(from, { oauth_error: code, provedor: provider });
}

function mapError(error: unknown): string {
  if (error instanceof AppError && ERROR_CODES[error.code]) {
    return ERROR_CODES[error.code];
  }
  return 'provedor';
}

function displayName(name: string | null, email: string): string {
  const withoutControls = [...(name ?? '')]
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');
  const cleaned = withoutControls.replace(/\s+/g, ' ').trim();
  const localPart = email.split('@')[0]?.trim() ?? '';
  const candidate = cleaned.length >= 2 ? cleaned : localPart;
  const safe = candidate.length >= 2 ? candidate : 'Usuário';
  return safe.slice(0, 80);
}

function usableEmail(email: string | null): string | null {
  if (!email) {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized) || normalized.length > 254) {
    return null;
  }
  return normalized;
}

async function sessionFor(user: PublicUser): Promise<{ user: PublicUser; token: string }> {
  return { user, token: issueAccessToken(user.id) };
}

async function linkIdentity(userId: string, profile: ProviderProfile, email: string): Promise<void> {
  try {
    await insertIdentity({
      user_id: userId,
      provider: profile.provider,
      provider_subject: profile.subject,
      email,
    });
  } catch (error) {
    if (error instanceof AppError && error.code === 'IDENTITY_ALREADY_LINKED') {
      return;
    }
    throw error;
  }
}

/**
 * Conta já vinculada entra na hora. E-mail verificado de uma conta existente
 * ganha o vínculo. Conta nova fica pendente até as 3 categorias.
 */
export async function settleProfile(
  profile: ProviderProfile,
): Promise<{ kind: 'session'; user: PublicUser; token: string } | { kind: 'pending'; profile: PendingProfile }> {
  const identity = await findIdentity(profile.provider, profile.subject);
  if (identity) {
    const user = await findUserById(identity.user_id);
    if (!user) {
      throw new AppError('Não foi possível entrar. Tente novamente.', 401, 'OAUTH_STATE');
    }
    return { kind: 'session', ...(await sessionFor(user)) };
  }

  const email = usableEmail(profile.email);
  if (!email) {
    throw new AppError(
      'O provedor não compartilhou um e-mail, então a conta não foi criada.',
      400,
      'OAUTH_EMAIL_MISSING',
    );
  }

  const existing = await findAuthUserByEmail(email);
  if (existing) {
    if (!profile.emailVerified) {
      throw new AppError(
        'Esse e-mail já tem conta, mas o provedor não confirmou que ele é seu. Entre com a senha.',
        409,
        'OAUTH_EMAIL_UNVERIFIED',
      );
    }
    await linkIdentity(existing.id, profile, email);
    return {
      kind: 'session',
      ...(await sessionFor({
        id: existing.id,
        name: existing.name,
        email: existing.email,
        createdAt: existing.created_at,
      })),
    };
  }

  return {
    kind: 'pending',
    profile: {
      provider: profile.provider,
      subject: profile.subject,
      email,
      name: displayName(profile.name, email),
    },
  };
}

export function beginAuthorization(
  provider: OAuthProvider,
  from: OAuthFrom,
): { redirectTo: string; state?: string } {
  if (!isProviderConfigured(provider)) {
    return { redirectTo: failureUrl(from, 'nao-configurado', provider) };
  }

  const { verifier, challenge } = createPkceVerifier();
  const nonce = createNonce();
  const state = createTransaction({ provider, codeVerifier: verifier, nonce, from });
  return {
    state,
    redirectTo: authorizationUrl(provider, { state, nonce, challenge }),
  };
}

export async function finishAuthorization(
  provider: OAuthProvider,
  input: { code: string | null; state: string | null; cookieState: string | null; userField: unknown; queryError: string | null },
): Promise<string> {
  const transaction =
    input.cookieState && input.state && input.cookieState === input.state
      ? takeTransaction(input.cookieState)
      : null;

  const from = transaction?.from ?? 'login';

  if (input.queryError === 'access_denied' || input.queryError === 'user_cancelled') {
    return failureUrl(from, 'cancelado', provider);
  }

  if (!isProviderConfigured(provider)) {
    return failureUrl(from, 'nao-configurado', provider);
  }

  if (!transaction || transaction.provider !== provider || !input.code) {
    return failureUrl(from, 'state', provider);
  }

  try {
    const profile = await exchangeAuthorizationCode(provider, {
      code: input.code,
      verifier: transaction.codeVerifier,
      nonce: transaction.nonce,
      personName: provider === 'apple' ? applePersonName(input.userField) : null,
    });
    const settled = await settleProfile(profile);
    const handoff =
      settled.kind === 'session'
        ? putSessionTicket(settled.user, settled.token)
        : putPendingTicket(settled.profile);
    return retornoUrl(handoff);
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('[oauth] callback failed', error instanceof Error ? error.message : 'unknown');
    }
    return failureUrl(from, mapError(error), provider);
  }
}

export function exchangeAuthorization(body: unknown): OAuthExchangeBody {
  const code = readCode(body);
  const exchanged = exchangeTicket(code);
  if (!exchanged) {
    throw new AppError('Esse retorno expirou. Comece de novo.', 400, 'OAUTH_CODE_INVALID');
  }
  return exchanged;
}

export async function registerWithProvider(body: unknown): Promise<{ user: PublicUser; token: string }> {
  const { code, categorySlugs } = parseOAuthRegister(body);
  const pending = takePendingTicket(code);
  if (!pending) {
    throw new AppError('Esse cadastro expirou. Comece de novo pelo provedor.', 400, 'OAUTH_CODE_INVALID');
  }

  try {
    return await createSocialUser(pending, categorySlugs);
  } catch (error) {
    restorePendingTicket(code, pending);
    throw error;
  }
}

async function createSocialUser(
  pending: PendingProfile,
  categorySlugs: OnboardingCategorySlug[],
): Promise<{ user: PublicUser; token: string }> {
  const existing = await findIdentity(pending.provider, pending.subject);
  if (existing) {
    const user = await findUserById(existing.user_id);
    if (!user) {
      throw new AppError('Não foi possível criar a conta. Tente novamente.', 503, 'DATABASE_UNAVAILABLE');
    }
    return { user, token: issueAccessToken(user.id) };
  }

  const categoryIds = await findCategoryIdsBySlugs(categorySlugs);
  const user = await insertUser({ name: pending.name, email: pending.email }, null);

  try {
    await insertIdentity({
      user_id: user.id,
      provider: pending.provider,
      provider_subject: pending.subject,
      email: pending.email,
    });
    await insertUserPreferences(user.id, categoryIds);
  } catch (error) {
    await deleteUserById(user.id);
    throw error;
  }

  return { user, token: issueAccessToken(user.id) };
}

function readCode(body: unknown): string {
  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const code = typeof payload.code === 'string' ? payload.code.trim() : '';
  if (code.length < 20 || code.length > 256) {
    throw new AppError('Esse retorno expirou. Comece de novo.', 400, 'OAUTH_CODE_INVALID');
  }
  return code;
}

function parseOAuthRegister(body: unknown): { code: string; categorySlugs: OnboardingCategorySlug[] } {
  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const errors: { field: string; message: string }[] = [];
  const code = typeof payload.code === 'string' ? payload.code.trim() : '';
  if (code.length < 20 || code.length > 256) {
    errors.push({ field: 'code', message: 'Esse cadastro expirou. Comece de novo pelo provedor.' });
  }
  const categorySlugs = parseCategorySlugs(payload.categorySlugs, errors);
  if (errors.length > 0) {
    throw new AppError('Dados inválidos para cadastro.', 400, 'VALIDATION_ERROR', errors);
  }
  return { code, categorySlugs };
}
