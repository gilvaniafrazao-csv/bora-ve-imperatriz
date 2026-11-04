import { randomBytes } from 'node:crypto';
import { PublicUser } from './auth.types';
import { OAuthFrom, OAuthProvider, PendingProfile } from './oauth.types';

const TTL_MS = 10 * 60 * 1000;

type OAuthTransaction = {
  provider: OAuthProvider;
  codeVerifier: string;
  nonce: string;
  from: OAuthFrom;
  expiresAt: number;
};

type SessionTicket = {
  kind: 'session';
  user: PublicUser;
  token: string;
  expiresAt: number;
};

type PendingTicket = {
  kind: 'pending';
  profile: PendingProfile;
  expiresAt: number;
};

type Ticket = SessionTicket | PendingTicket;

export type OAuthExchangeBody =
  | { status: 'session'; message: string; user: PublicUser; token: string }
  | { status: 'pending'; code: string; name: string; email: string };

const transactions = new Map<string, OAuthTransaction>();
const tickets = new Map<string, Ticket>();
const exchangeReplays = new Map<string, { body: OAuthExchangeBody; expiresAt: number }>();

function sweep(): void {
  const now = Date.now();
  for (const [key, value] of transactions) {
    if (value.expiresAt <= now) {
      transactions.delete(key);
    }
  }
  for (const [key, value] of tickets) {
    if (value.expiresAt <= now) {
      tickets.delete(key);
    }
  }
  for (const [key, value] of exchangeReplays) {
    if (value.expiresAt <= now) {
      exchangeReplays.delete(key);
    }
  }
}

export function createTransaction(input: Omit<OAuthTransaction, 'expiresAt'>): string {
  sweep();
  const id = randomBytes(32).toString('base64url');
  transactions.set(id, { ...input, expiresAt: Date.now() + TTL_MS });
  return id;
}

export function takeTransaction(id: string): OAuthTransaction | null {
  sweep();
  const found = transactions.get(id);
  if (!found) {
    return null;
  }
  transactions.delete(id);
  if (found.expiresAt <= Date.now()) {
    return null;
  }
  return found;
}

function putTicket(ticket: Ticket): string {
  sweep();
  const code = randomBytes(32).toString('base64url');
  tickets.set(code, ticket);
  return code;
}

export function putSessionTicket(user: PublicUser, token: string): string {
  return putTicket({ kind: 'session', user, token, expiresAt: Date.now() + TTL_MS });
}

export function putPendingTicket(profile: PendingProfile): string {
  return putTicket({ kind: 'pending', profile, expiresAt: Date.now() + TTL_MS });
}

/**
 * A troca do código é idempotente até expirar. O efeito do React em
 * desenvolvimento chama a rota duas vezes; a segunda recebe a mesma resposta.
 */
export function exchangeTicket(code: string): OAuthExchangeBody | null {
  sweep();
  const replay = exchangeReplays.get(code);
  if (replay && replay.expiresAt > Date.now()) {
    return replay.body;
  }

  const ticket = tickets.get(code);
  if (!ticket || ticket.expiresAt <= Date.now()) {
    tickets.delete(code);
    return null;
  }
  tickets.delete(code);

  let body: OAuthExchangeBody;
  if (ticket.kind === 'session') {
    body = {
      status: 'session',
      message: 'Login realizado com sucesso.',
      user: ticket.user,
      token: ticket.token,
    };
  } else {
    const registrationCode = putTicket(ticket);
    body = {
      status: 'pending',
      code: registrationCode,
      name: ticket.profile.name,
      email: ticket.profile.email,
    };
  }

  exchangeReplays.set(code, { body, expiresAt: ticket.expiresAt });
  return body;
}

export function takePendingTicket(code: string): PendingProfile | null {
  sweep();
  const ticket = tickets.get(code);
  if (!ticket || ticket.kind !== 'pending' || ticket.expiresAt <= Date.now()) {
    return null;
  }
  tickets.delete(code);
  return ticket.profile;
}

export function restorePendingTicket(code: string, profile: PendingProfile): void {
  tickets.set(code, { kind: 'pending', profile, expiresAt: Date.now() + TTL_MS });
}

export function resetOAuthStore(): void {
  transactions.clear();
  tickets.clear();
  exchangeReplays.clear();
}
