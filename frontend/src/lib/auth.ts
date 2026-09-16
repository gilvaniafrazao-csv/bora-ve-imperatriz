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
