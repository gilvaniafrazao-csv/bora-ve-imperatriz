import { CookieOptions, Request, Response } from 'express';
import { isOAuthProvider, OAuthFrom } from './oauth.types';
import { beginAuthorization, exchangeAuthorization, finishAuthorization, registerWithProvider } from './oauth.service';

const STATE_COOKIE = 'oauth_tx';

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/api/auth/oauth',
    secure: process.env.NODE_ENV === 'production',
  };
}

function readStateCookie(req: Request): string | null {
  const header = req.headers.cookie;
  if (!header) {
    return null;
  }

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name !== STATE_COOKIE) {
      continue;
    }
    try {
      return decodeURIComponent(rest.join('='));
    } catch {
      return null;
    }
  }

  return null;
}

function firstString(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

function bodyField(body: unknown, key: string): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  return firstString((body as Record<string, unknown>)[key]);
}

function parseFrom(value: unknown): OAuthFrom {
  return firstString(value) === 'cadastro' ? 'cadastro' : 'login';
}

function providerOf(req: Request): string {
  const value = req.params.provider;
  return Array.isArray(value) ? value[0] : value;
}

export async function oauthStart(req: Request, res: Response): Promise<void> {
  const provider = providerOf(req);
  if (!isOAuthProvider(provider)) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Provedor desconhecido.' },
    });
    return;
  }

  const result = beginAuthorization(provider, parseFrom(req.query.from));
  if (result.state) {
    res.cookie(STATE_COOKIE, result.state, { ...cookieOptions(), maxAge: 10 * 60 * 1000 });
  }
  res.redirect(302, result.redirectTo);
}

export async function oauthCallback(req: Request, res: Response): Promise<void> {
  const provider = providerOf(req);
  const cookieState = readStateCookie(req);
  res.clearCookie(STATE_COOKIE, cookieOptions());

  if (!isOAuthProvider(provider)) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Provedor desconhecido.' },
    });
    return;
  }

  const redirectTo = await finishAuthorization(provider, {
    code: firstString(req.query.code) ?? bodyField(req.body, 'code'),
    state: firstString(req.query.state) ?? bodyField(req.body, 'state'),
    cookieState,
    userField: req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>).user : undefined,
    queryError: firstString(req.query.error) ?? bodyField(req.body, 'error'),
  });
  res.redirect(302, redirectTo);
}

export async function oauthExchange(req: Request, res: Response): Promise<void> {
  res.status(200).json(exchangeAuthorization(req.body));
}

export async function oauthRegister(req: Request, res: Response): Promise<void> {
  const result = await registerWithProvider(req.body);
  res.status(201).json({
    message: 'Conta criada com sucesso.',
    user: result.user,
    token: result.token,
  });
}
