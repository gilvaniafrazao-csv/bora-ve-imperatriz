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
