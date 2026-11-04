import { apiRequest } from "@/lib/api";
import type { PublicUser } from "@/types/user";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  categorySlugs: string[];
};

export type RegisterResponse = {
  message: string;
  user: PublicUser;
};

export function registerUser(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user: PublicUser;
  token: string;
};

export type OAuthProviderName = "google" | "apple" | "facebook";

export const OAUTH_PENDING_KEY = "bora-ve-oauth-pending";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
};

export function oauthStartUrl(
  provider: OAuthProviderName,
  from: "login" | "cadastro",
): string {
  const url = new URL(
    `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333").replace(/\/+$/, "")}/api/auth/oauth/${provider}/start`,
  );
  url.searchParams.set("from", from);
  return url.toString();
}

export function describeOAuthError(
  code: string | null,
  provider: string | null,
): string | null {
  if (!code) {
    return null;
  }

  const label = (provider && PROVIDER_LABELS[provider]) || "o provedor";

  switch (code) {
    case "nao-configurado":
      return `Entrar com ${label} ainda não está configurado. O login com e-mail e senha continua disponível.`;
    case "state":
      return "Não foi possível confirmar o login. Tente de novo.";
    case "email-nao-verificado":
      return "Esse e-mail já tem conta, mas o provedor não confirmou que ele é seu. Entre com a senha.";
    case "sem-email":
      return "O provedor não compartilhou um e-mail, então a conta não foi criada.";
    case "cancelado":
      return "O login foi cancelado.";
    case "codigo":
      return "Esse retorno expirou. Comece o login de novo.";
    default:
      return "O provedor não concluiu o login. Tente novamente.";
  }
}

export type OAuthExchangeResponse =
  | { status: "session"; message: string; user: PublicUser; token: string }
  | { status: "pending"; code: string; name: string; email: string };

export function exchangeOAuthCode(code: string) {
  return apiRequest<OAuthExchangeResponse>("/api/auth/oauth/exchange", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function registerWithOAuth(payload: {
  code: string;
  categorySlugs: string[];
}) {
  return apiRequest<LoginResponse>("/api/auth/oauth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

const AUTH_TOKEN_KEY = "bora-ve-token";

export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}
