"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { ApiError } from "@/lib/api";
import { registerUser } from "@/lib/auth";

type FieldKey = "name" | "email" | "password";
type FieldErrors = Partial<Record<FieldKey, string>>;

const ONBOARDING_CATEGORIES = [
  { slug: "sushi", label: "Sushi", icon: "/icons/sushi.svg" },
  { slug: "pizza", label: "Pizza", icon: "/icons/pizza.svg" },
  { slug: "bar", label: "Bar", icon: "/icons/bar.svg" },
  { slug: "doces", label: "Doces", icon: "/icons/doce.svg" },
  { slug: "churrasco", label: "Churrasco", icon: "/icons/churrasco.svg" },
  { slug: "hamburguer", label: "Hambúrguer", icon: "/icons/hamburguer.svg" }
] as const;

type OnboardingSlug = (typeof ONBOARDING_CATEGORIES)[number]["slug"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_CATEGORIES = 3;

const inputClassName =
  "h-[3.15rem] w-full rounded-[0.7rem] border-[1.5px] border-teal bg-white px-4 text-base font-normal text-teal placeholder:italic placeholder:font-normal placeholder:text-placeholder focus:outline-2 focus:outline-offset-1 focus:outline-teal aria-invalid:border-danger aria-invalid:outline-danger";

function isFieldKey(value: unknown): value is FieldKey {
  return value === "name" || value === "email" || value === "password";
}

function mapApiFieldErrors(details: unknown): FieldErrors {
  if (!Array.isArray(details)) {
    return {};
  }

  const next: FieldErrors = {};
  for (const item of details) {
    if (!item || typeof item !== "object" || !("field" in item) || !("message" in item)) {
      continue;
    }

    const field: unknown = item.field;
    const message: unknown = item.message;
    if (isFieldKey(field) && typeof message === "string") {
      next[field] = message;
    }
  }
  return next;
}

function categoryErrorMessage(details: unknown): string | null {
  if (!Array.isArray(details)) {
    return null;
  }

  for (const item of details) {
    if (
      item &&
      typeof item === "object" &&
      "field" in item &&
      item.field === "categorySlugs" &&
      "message" in item &&
      typeof item.message === "string"
    ) {
      return item.message;
    }
  }

  return null;
}

function validate(name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim()) {
    errors.name = "Informe como podemos te chamar.";
  } else if (name.trim().length < 2) {
    errors.name = "O nome deve ter pelo menos 2 caracteres.";
  }

  if (!email.trim()) {
    errors.email = "Informe o e-mail.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!password) {
    errors.password = "Informe a senha.";
  } else if (password.length < 8) {
    errors.password = "A senha deve ter pelo menos 8 caracteres.";
  }

  return errors;
}

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [socialHint, setSocialHint] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSlugs, setSelectedSlugs] = useState<OnboardingSlug[]>([]);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  function onSocialPick(label: string) {
    setSocialHint(`Cadastro com ${label} em breve.`);
  }

  function toggleCategory(slug: OnboardingSlug) {
    setPreferencesError(null);
    setSelectedSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  function goToPreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSocialHint(null);

    const localErrors = validate(name, email, password);
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      return;
    }

    setStep(2);
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setPreferencesError(null);

    const localErrors = validate(name, email, password);
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setStep(1);
      return;
    }

    if (selectedSlugs.length < MIN_CATEGORIES) {
      setPreferencesError(`Escolha pelo menos ${MIN_CATEGORIES} categorias.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        categorySlugs: selectedSlugs,
      });
      setCreatedName(result.user.name);
      setPassword("");
    } catch (error) {
      if (error instanceof ApiError) {
        const apiFields = mapApiFieldErrors(error.details);
        const categoryMessage = categoryErrorMessage(error.details);

        if (error.code === "EMAIL_ALREADY_REGISTERED" || apiFields.email) {
          setFieldErrors(apiFields);
          setStep(1);
          setFormError(apiFields.email ? null : error.message);
        } else if (categoryMessage) {
          setPreferencesError(categoryMessage);
        } else {
          setFieldErrors(apiFields);
          setFormError(Object.keys(apiFields).length === 0 ? error.message : null);
        }
      } else {
        setFormError("Não foi possível criar a conta. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate grid min-h-dvh overflow-hidden bg-teal max-[900px]:grid-cols-1 min-[901px]:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-brand-radial" aria-hidden="true" />

      <section
        className="relative z-[2] flex flex-col justify-center overflow-visible px-[clamp(1.5rem,5vw,4rem)] pb-[clamp(7rem,18vh,9.5rem)] pt-[clamp(2rem,6vh,4.5rem)] text-white max-[900px]:min-h-[min(40vh,22rem)] max-[900px]:overflow-hidden max-[900px]:px-6 max-[900px]:pb-[6.5rem] max-[900px]:pt-9 max-[600px]:min-h-[13.5rem] max-[600px]:px-[1.15rem] max-[600px]:pb-[5.25rem] max-[600px]:pt-7 min-[901px]:min-h-dvh [@media(min-width:901px)_and_(max-height:720px)]:pb-[6.5rem]"
        aria-label="Bora Vê"
      >
        <div className="relative z-[1] max-w-[32rem]">
          <h1 className="flex flex-col">
            <span className="text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1.125] tracking-[-0.03em] text-lime max-[900px]:text-[clamp(2.25rem,10vw,3.25rem)] max-[600px]:text-[2.15rem] max-[600px]:leading-[1.12]">
              Bora Vê
            </span>
            <span className="text-[clamp(2rem,2vw,2.5rem)] font-extrabold italic leading-[1.24] tracking-[-0.02em] text-lime max-[900px]:text-[clamp(1.6rem,7vw,2.25rem)] max-[600px]:text-[1.55rem]">
              o que tá rolando?
            </span>
          </h1>
          <p className="mt-[1.15rem] max-w-[22rem] text-[clamp(1.25rem,1vw,1.25rem)] font-normal leading-[1.167] text-[#f3f6f5] max-[900px]:text-lg max-[600px]:max-w-[17rem] max-[600px]:text-base">
            Crie sua conta e descubra lugares, eventos e experiências perto de você.
          </p>
        </div>
        <img
          className="pointer-events-none absolute bottom-[-8%] left-[-2%] z-10 w-[116%] max-w-none select-none max-[900px]:bottom-[-18%] max-[900px]:left-[-6%] max-[900px]:w-[min(94%,28rem)] max-[600px]:bottom-[-1.6rem] max-[600px]:left-[-1.2rem] max-[600px]:w-[18rem] [@media(min-width:901px)_and_(max-height:720px)]:bottom-[-10%] [@media(min-width:901px)_and_(max-height:720px)]:w-[110%]"
          src="/logo.svg"
          alt="Boravê!"
        />
      </section>

      <section className="relative z-[1] flex items-center justify-center bg-peach px-[clamp(1.25rem,4vw,3rem)] py-[clamp(1.5rem,4vh,2.5rem)] max-[900px]:items-start max-[900px]:px-5 max-[900px]:pb-10 max-[900px]:pt-7 min-[901px]:min-h-dvh">
        <div className="w-full max-w-[22.75rem] max-[900px]:mx-auto max-[900px]:max-w-96">
          {createdName ? (
            <div className="flex flex-col gap-[1.15rem] [@media(min-width:901px)_and_(max-height:720px)]:gap-[0.85rem]" role="status">
              <StepBar step={2} />
              <h2 className="text-2xl font-extrabold text-ink">Conta criada com sucesso</h2>
              <p className="leading-[1.45] text-teal-50">
                Olá, <strong>{createdName}</strong>. Você já pode explorar o Bora Vê.
              </p>
              <Link
                className="mt-[0.35rem] inline-flex h-[3.1rem] items-center justify-center rounded-xl bg-teal text-base font-bold text-white no-underline hover:bg-teal-70"
                href="/login"
              >
                Bora entrar
              </Link>
            </div>
          ) : step === 2 ? (
            <form className="flex flex-col" onSubmit={createAccount} noValidate>
              <StepBar step={2} />
              <h2 className="text-[1.85rem] font-extrabold leading-[1.15] text-ink">
                Quais os seus interesses?
              </h2>
              <p className="mt-2 max-w-[20rem] text-[0.95rem] leading-snug text-muted">
                Escolha pelo menos 3 categorias para sabermos o que você quer ver.
              </p>

              <div className="mt-5 flex flex-wrap justify-items-start gap-x-3 gap-y-3">
                {ONBOARDING_CATEGORIES.map((category) => {
                  const selected = selectedSlugs.includes(category.slug);
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCategory(category.slug)}
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-[0.95rem] font-medium whitespace-nowrap transition ${
                        selected
                          ? "bg-teal text-white"
                          : "bg-chip text-ink hover:bg-teal-10"
                      }`}
                    >
                      <img
                        src={category.icon}
                        alt=""
                        className={`size-5 shrink-0 ${selected ? "brightness-0 invert" : ""}`}
                      />
                      {category.label}
                    </button>
                  );
                })}
              </div>

              {preferencesError ? (
                <p className="mt-4 text-[0.8rem] font-semibold text-danger" role="alert">
                  {preferencesError}
                </p>
              ) : null}

              {formError ? (
                <p className="mt-4 text-[0.8rem] font-semibold text-danger" role="alert">
                  {formError}
                </p>
              ) : null}

              <button
                className="mt-6 inline-flex h-[3.1rem] cursor-pointer items-center justify-center rounded-full border-0 bg-teal text-base font-bold text-white hover:bg-teal-70 disabled:cursor-wait disabled:opacity-70"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Criando conta..." : "Bora lá!"}
              </button>
            </form>
          ) : (
            <form
              className="flex flex-col gap-[1.15rem] [@media(min-width:901px)_and_(max-height:720px)]:gap-[0.85rem]"
              onSubmit={goToPreferences}
              noValidate
            >
              <StepBar step={1} />

              <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
                <span>Como podemos te chamar?</span>
                <input
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.name)}
                  className={inputClassName}
                />
                {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
              </label>

              <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
                <span>Qual o seu email?</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nome@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={inputClassName}
                />
                {fieldErrors.email ? <FieldError>{fieldErrors.email}</FieldError> : null}
              </label>

              <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
                <span>Cria uma senha</span>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="********"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`${inputClassName} pr-[2.8rem]`}
                  />
                  <button
                    className="absolute top-1/2 right-[0.7rem] grid size-[1.8rem] -translate-y-1/2 place-items-center border-0 bg-transparent text-teal"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.password ? <FieldError>{fieldErrors.password}</FieldError> : null}
              </label>

              {formError ? (
                <p className="text-[0.8rem] font-semibold text-danger" role="alert">
                  {formError}
                </p>
              ) : null}

              <button
                className="mt-[0.35rem] inline-flex h-[3.1rem] cursor-pointer items-center justify-center rounded-full border-0 bg-teal text-base font-bold text-white hover:bg-teal-70"
                type="submit"
              >
                Bora lá!
              </button>

              <div className="mt-[0.2rem] grid grid-cols-[1fr_auto_1fr] items-center gap-3.5 text-[0.92rem] text-teal before:h-[1.5px] before:bg-teal before:content-[''] after:h-[1.5px] after:bg-teal after:content-['']">
                <span>ou caso você prefira</span>
              </div>

              <div className="flex justify-center gap-5" aria-label="Entrar com rede social">
                <SocialButton label="Apple" onPick={onSocialPick}>
                  <AppleIcon />
                </SocialButton>
                <SocialButton label="Google" onPick={onSocialPick}>
                  <GoogleIcon />
                </SocialButton>
                <SocialButton label="Facebook" onPick={onSocialPick}>
                  <FacebookIcon />
                </SocialButton>
              </div>

              {socialHint ? (
                <p className="text-center text-[0.8rem] font-semibold text-teal" role="status">
                  {socialHint}
                </p>
              ) : null}

              <p className="mt-[0.15rem] text-center text-[0.95rem] text-muted">
                Já tem conta?{" "}
                <Link className="font-bold text-teal underline underline-offset-2" href="/login">
                  Clique aqui para entrar
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-[0.45rem]" aria-label={`Etapa ${step} de 2`}>
      <span className="h-[0.38rem] rounded-full bg-teal" />
      <span className={`h-[0.38rem] rounded-full ${step === 2 ? "bg-teal" : "bg-step"}`} />
    </div>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <small className="text-[0.8rem] font-semibold text-danger">{children}</small>;
}

function SocialButton({
  children,
  label,
  onPick,
}: {
  children: ReactNode;
  label: string;
  onPick: (label: string) => void;
}) {
  return (
    <button
      className="grid size-10 place-items-center rounded-full border-0 bg-white text-teal shadow-[0_1px_3px_rgba(12,70,81,0.16)] transition hover:bg-[#f7f7f7]"
      type="button"
      title={`${label} — em breve`}
      aria-label={`Cadastrar com ${label} (em breve)`}
      onClick={() => onPick(label)}
    >
      {children}
    </button>
  );
}

function EyeIcon() {
  return (
    <svg className="size-[1.2rem]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6.2 5.5 12 5.5 21.5 12 21.5 12 17.8 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="size-[1.2rem]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M9.9 9.9A3.1 3.1 0 0 0 12 15.1m0 0a3.1 3.1 0 0 0 2.9-4.1M6.1 6.4C4.1 7.8 2.5 12 2.5 12S6.2 18.5 12 18.5c2 0 3.7-.7 5.1-1.7M10.2 5.7C10.8 5.6 11.4 5.5 12 5.5 17.8 5.5 21.5 12 21.5 12s-.6 1.1-1.7 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#111111"
        d="M16.4 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.1-1.7-1.3-.1-2.6.8-3.2.8s-1.7-.8-2.8-.7c-1.4.1-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7 1.9-1.1 2.6-2.1c.8-1.2 1.1-2.3 1.1-2.4-.1 0-2.1-.8-2.1-3.3zM14.7 6.3c.6-.7 1-1.7.9-2.7-.9.1-1.9.6-2.5 1.3-.6.6-1.1 1.6-1 2.6 1 .1 1.9-.5 2.6-1.2z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M14.5 22v-7.1h2.4l.4-2.9h-2.8V9.8c0-.8.4-1.6 1.7-1.6h1.3V5.8s-1.2-.2-2.3-.2c-2.4 0-3.9 1.4-3.9 4v2.4H9.1V14.9h2.2V22A10 10 0 1 0 14.5 22z"
      />
    </svg>
  );
}
