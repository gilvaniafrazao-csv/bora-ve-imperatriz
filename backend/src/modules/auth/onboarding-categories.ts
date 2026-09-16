export const ONBOARDING_CATEGORY_SLUGS = [
  'sushi',
  'pizza',
  'hamburguer',
  'bar',
  'churrasco',
  'doces',
] as const;

export type OnboardingCategorySlug = (typeof ONBOARDING_CATEGORY_SLUGS)[number];

export const MIN_ONBOARDING_CATEGORIES = 3;

const ONBOARDING_SLUG_SET = new Set<string>(ONBOARDING_CATEGORY_SLUGS);

export function isOnboardingCategorySlug(value: string): value is OnboardingCategorySlug {
  return ONBOARDING_SLUG_SET.has(value);
}
