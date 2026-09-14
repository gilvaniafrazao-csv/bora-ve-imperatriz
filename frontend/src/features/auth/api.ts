import { apiRequest } from '@/lib/api/client';
import type { PublicUser } from '@/types/user';

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
  user: PublicUser;
};

export function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
