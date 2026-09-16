import { OnboardingCategorySlug } from './onboarding-categories';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  categorySlugs: OnboardingCategorySlug[];
};

export type LoginInput = {
  email: string;
  password: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type FieldError = {
  field: string;
  message: string;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type AuthUserRow = UserRow & {
  password_hash: string;
};
