import { OnboardingCategorySlug } from '../auth/onboarding-categories';

export const PRICE_RANGES = ['economico', 'moderado', 'premium'] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

/** `undefined` = não alterar; `null` = limpar a faixa de preço. */
export type UpdatePreferencesInput = {
  categorySlugs: OnboardingCategorySlug[];
  priceRange: PriceRange | null | undefined;
};

export type UserPreferences = {
  categorySlugs: string[];
  priceRange: PriceRange | null;
  onboardingCompleted: boolean;
  updatedAt: string | null;
};

export type PreferencesRow = {
  price_range: PriceRange | null;
  updated_at: string;
};
