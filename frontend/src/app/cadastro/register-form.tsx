"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import {
  Beef,
  CakeSlice,
  Eye,
  EyeOff,
  Martini,
  Pizza,
  Sandwich,
  Shell,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { registerUser } from "@/lib/auth";

type FieldKey = "name" | "email" | "password";
type FieldErrors = Partial<Record<FieldKey, string>>;

const ONBOARDING_CATEGORIES = [
  { slug: "sushi", label: "Sushi", icon: Shell },
  { slug: "pizza", label: "Pizza", icon: Pizza },
  { slug: "bar", label: "Bar", icon: Martini },
  { slug: "doces", label: "Doces", icon: CakeSlice },
  { slug: "churrasco", label: "Churrasco", icon: Beef },
  { slug: "hamburguer", label: "Hambúrguer", icon: Sandwich },
] as const;

type OnboardingSlug = (typeof ONBOARDING_CATEGORIES)[number]["slug"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_CATEGORIES = 3;

const inputClassName =
  "h-12 w-full rounded-xl border border-teal/20 bg-white px-4 text-sm font-medium text-teal shadow-sm transition placeholder:font-normal placeholder:text-placeholder focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/10 aria-invalid:border-danger aria-invalid:ring-danger/10";

function isFieldKey(value: unknown): value is FieldKey {
  return value === "name" || value === "email" || value === "password";
}

function mapApiFieldErrors(details: unknown): FieldErrors {
  if (!Array.isArray(details)) {
    return {};
  }

  const errors: FieldErrors = {};

  for (const item of details) {
    if (
      !item ||
      typeof item !== "object" ||
      !("field" in item) ||
      !("message" in item)
    ) {
      continue;
    }

    const field: unknown = item.field;
    const message: unknown = item.message;

    if (isFieldKey(field) && typeof message === "string") {
      errors[field] = message;
    }
  }

  return errors;
}

function getCategoryError(details: unknown): string | null {
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

  const normalizedName = name.trim();
  const normalizedEmail = email.trim();

  if (!normalizedName) {
    errors.name = "Informe como podemos te chamar.";
  } else if (normalizedName.length < 2) {
    errors.name = "O nome deve ter pelo menos 2 caracteres.";
  }

  if (!normalizedEmail) {
    errors.email = "Informe o e-mail.";
  } else if (!EMAIL_REGEX.test(normalizedEmail)) {
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
  const [socialHint, setSocialHint] = useState<string | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSlugs, setSelectedSlugs] = useState<OnboardingSlug[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdName, setCreatedName] = useState<string | null>(null);

  function onSocialPick(label: string) {
    setFormError(null);
    setSocialHint(`Cadastro com ${label} em breve.`);
  }

  function clearFieldError(field: FieldKey) {
    if (!fieldErrors[field]) {
      return;
    }

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function toggleCategory(slug: OnboardingSlug) {
    setPreferencesError(null);

    setSelectedSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
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

  function goBackToAccount() {
    setPreferencesError(null);
    setFormError(null);
    setStep(1);
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
      setFieldErrors({});
    } catch (error) {
      if (error instanceof ApiError) {
        const apiErrors = mapApiFieldErrors(error.details);
        const categoryError = getCategoryError(error.details);

        if (error.code === "EMAIL_ALREADY_REGISTERED" || apiErrors.email) {
          setFieldErrors(apiErrors);
          setFormError(apiErrors.email ? null : error.message);
          setStep(1);
          return;
        }

        if (categoryError) {
          setPreferencesError(categoryError);
          return;
        }

        setFieldErrors(apiErrors);

        if (Object.keys(apiErrors).length === 0) {
          setFormError(error.message);
        }
      } else {
        setFormError("Não foi possível criar a conta. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate grid min-h-dvh overflow-hidden bg-teal min-[901px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {/* PAINEL DA MARCA — DESKTOP */}
      <section
        className="relative z-10 hidden min-h-dvh overflow-hidden bg-teal px-[clamp(2rem,5vw,4rem)] py-[clamp(3rem,8vh,6rem)] text-white min-[901px]:flex min-[901px]:flex-col min-[901px]:justify-center"
        aria-label="Sobre o Bora Vê"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-brand-radial"
          aria-hidden="true"
        />

        {/* Voltar — desktop */}
        {step === 1 && !createdName ? (
          <Link
            href="/home"
            className="absolute left-[clamp(2rem,5vw,4rem)] top-8 z-20 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Voltar para a Home
          </Link>
        ) : null}

        <div className="relative z-10 max-w-[32rem]">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-white/70">
            Do seu jeito
          </p>

          <h2 className="text-[clamp(2.25rem,3.5vw,3.35rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-lime">
            Sua cidade tem
            <br />
            muito a descobrir.
          </h2>

          <p className="mt-5 max-w-[25rem] text-base leading-relaxed text-white/80">
            Conte um pouco do que você gosta e encontre experiências que
            combinam com você.
          </p>
        </div>

        <img
          src="/logo-redondo.svg"
          alt=""
          aria-hidden="true"
          className="absolute bottom-8 left-8 z-10 w-16 select-none object-contain"
        />
      </section>

      {/* CADASTRO */}
      <section className="relative z-10 flex min-h-dvh justify-center bg-[#f7faf9] px-5 pb-10 pt-30 min-[901px]:items-center min-[901px]:px-[clamp(2rem,5vw,4rem)] min-[901px]:py-10">
        {/* Navegação mobile */}
        {step === 1 && !createdName ? (
          <>
            <Link
              href="/home"
              className="absolute left-5 top-18 inline-flex items-center gap-2 text-sm font-semibold text-teal-50 transition hover:text-teal min-[901px]:hidden"
            >
              <span aria-hidden="true">←</span>
              Voltar para a Home
            </Link>

            <Link
              href="/home"
              aria-label="Ir para a Home"
              className="absolute right-5 top-3 min-[901px]:hidden"
            >
              <img
                src="/logo-teal.svg"
                alt="Bora Vê"
                className="h-auto w-24 select-none object-contain"
              />
            </Link>
          </>
        ) : null}

        {/* Logo mobile nas demais etapas */}
        {step === 2 || createdName ? (
          <Link
            href="/home"
            aria-label="Ir para a Home"
            className="absolute right-5 top-3 min-[901px]:hidden"
          >
            <img
              src="/logo-teal.svg"
              alt="Bora Vê"
              className="h-auto w-24 select-none object-contain"
            />
          </Link>
        ) : null}

        <div className="w-full max-w-[25rem]">
          {createdName ? (
            <RegistrationSuccess name={createdName} />
          ) : step === 2 ? (
            <PreferencesStep
              selectedSlugs={selectedSlugs}
              preferencesError={preferencesError}
              formError={formError}
              submitting={submitting}
              onToggle={toggleCategory}
              onBack={goBackToAccount}
              onSubmit={createAccount}
            />
          ) : (
            <AccountStep
              name={name}
              email={email}
              password={password}
              showPassword={showPassword}
              fieldErrors={fieldErrors}
              formError={formError}
              socialHint={socialHint}
              onNameChange={(value) => {
                setName(value);
                clearFieldError("name");
              }}
              onEmailChange={(value) => {
                setEmail(value);
                clearFieldError("email");
              }}
              onPasswordChange={(value) => {
                setPassword(value);
                clearFieldError("password");
              }}
              onTogglePassword={() => setShowPassword((current) => !current)}
              onSocialPick={onSocialPick}
              onSubmit={goToPreferences}
            />
          )}
        </div>
      </section>
    </main>
  );
}

type AccountStepProps = {
  name: string;
  email: string;
  password: string;
  showPassword: boolean;
  fieldErrors: FieldErrors;
  formError: string | null;
  socialHint: string | null;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSocialPick: (label: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function AccountStep({
  name,
  email,
  password,
  showPassword,
  fieldErrors,
  formError,
  socialHint,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSocialPick,
  onSubmit,
}: AccountStepProps) {
  return (
    <form
      className="flex flex-col gap-[1.15rem] [@media(min-width:901px)_and_(max-height:720px)]:gap-[0.85rem]"
      onSubmit={onSubmit}
      noValidate
    >
      <StepBar step={1} />

      <div>
        <h1 className="text-[1.75rem] font-extrabold tracking-tight text-teal">
          Crie sua conta
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-teal-50">
          Comece com algumas informações básicas.
        </p>
      </div>

      <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
        <span>Nome</span>

        <input
          name="name"
          autoComplete="name"
          placeholder="Como podemos chamar você?"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={
            fieldErrors.name ? "register-name-error" : undefined
          }
          className={inputClassName}
        />

        {fieldErrors.name ? (
          <FieldError id="register-name-error">{fieldErrors.name}</FieldError>
        ) : null}
      </label>

      <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
        <span>E-mail</span>

        <input
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nome@email.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "register-email-error" : undefined
          }
          className={inputClassName}
        />

        {fieldErrors.email ? (
          <FieldError id="register-email-error">{fieldErrors.email}</FieldError>
        ) : null}
      </label>

      <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
        <span>Senha</span>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password
                ? "register-password-error"
                : "register-password-hint"
            }
            className={`${inputClassName} pr-12`}
          />

          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-teal transition hover:bg-teal-10 focus:outline-none focus:ring-2 focus:ring-teal/20"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>

        {fieldErrors.password ? (
          <FieldError id="register-password-error">
            {fieldErrors.password}
          </FieldError>
        ) : (
          <span
            id="register-password-hint"
            className="text-xs font-normal text-teal-50"
          >
            Use pelo menos 8 caracteres.
          </span>
        )}
      </label>

      {formError ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20"
      >
        Continuar
      </button>

      <SocialDivider />

      <div
        className="flex justify-center gap-5"
        aria-label="Opções de cadastro com rede social"
      >
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
        <p
          className="text-center text-[0.8rem] font-semibold text-teal"
          role="status"
        >
          {socialHint}
        </p>
      ) : null}

      <p className="text-center text-[0.95rem] text-muted">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-bold text-teal underline underline-offset-2 transition hover:text-teal-70"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}

type PreferencesStepProps = {
  selectedSlugs: OnboardingSlug[];
  preferencesError: string | null;
  formError: string | null;
  submitting: boolean;
  onToggle: (slug: OnboardingSlug) => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function PreferencesStep({
  selectedSlugs,
  preferencesError,
  formError,
  submitting,
  onToggle,
  onBack,
  onSubmit,
}: PreferencesStepProps) {
  const minimumReached = selectedSlugs.length >= MIN_CATEGORIES;

  return (
    <form className="flex flex-col" onSubmit={onSubmit} noValidate>
      <StepBar step={2} />

      <div className="mb-6">
        <span className="text-sm font-bold text-teal-50">Só mais um passo</span>

        <h1 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight text-teal min-[600px]:text-[1.9rem]">
          O que combina com você?
        </h1>

        <p className="mt-2 max-w-[23rem] text-sm leading-relaxed text-muted">
          Escolha pelo menos {MIN_CATEGORIES} opções. Vamos usar seus interesses
          para personalizar suas descobertas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 min-[600px]:gap-4 max-[359px]:grid-cols-1">
        {ONBOARDING_CATEGORIES.map((category) => {
          const selected = selectedSlugs.includes(category.slug);
          const Icon = category.icon;

          return (
            <button
              key={category.slug}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(category.slug)}
              className={`flex min-h-16 min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left font-semibold transition min-[600px]:min-h-[4.75rem] min-[600px]:gap-4 min-[600px]:rounded-2xl min-[600px]:px-5 min-[600px]:py-4 ${
                selected
                  ? "border-teal bg-teal text-white shadow-sm"
                  : "border-teal/10 bg-white text-ink shadow-sm hover:border-teal/30 hover:shadow-md"
              }`}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg transition min-[600px]:size-11 min-[600px]:rounded-xl ${
                  selected ? "bg-white/15 text-white" : "bg-teal-10 text-teal"
                }`}
              >
                <Icon
                  className="size-5 min-[600px]:size-6"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>

              <span className="min-w-0 whitespace-nowrap text-[0.76rem] min-[400px]:text-[0.82rem] min-[600px]:text-[0.95rem]">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-teal-50">
          {selectedSlugs.length} de {MIN_CATEGORIES} selecionadas
        </span>

        {minimumReached ? (
          <span className="shrink-0 text-xs font-bold text-teal">
            Tudo certo ✓
          </span>
        ) : null}
      </div>

      {preferencesError ? (
        <p className="mt-3 text-sm font-semibold text-danger" role="alert">
          {preferencesError}
        </p>
      ) : null}

      {formError ? (
        <p className="mt-3 text-sm font-semibold text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="mt-7 flex gap-3 max-[359px]:flex-col-reverse">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-teal/20 bg-white px-4 text-sm font-bold text-teal transition hover:bg-teal-10 focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Voltar
        </button>

        <button
          type="submit"
          disabled={submitting || !minimumReached}
          className="inline-flex h-12 flex-[1.6] cursor-pointer items-center justify-center whitespace-nowrap rounded-xl bg-teal px-4 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Criando conta..." : "Criar minha conta"}
        </button>
      </div>
    </form>
  );
}

function RegistrationSuccess({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-4" role="status">
      <StepBar step={2} />

      <span className="text-sm font-bold text-teal-50">Tudo certo!</span>

      <h1 className="text-2xl font-extrabold tracking-tight text-teal">
        Conta criada com sucesso
      </h1>

      <p className="leading-relaxed text-teal-50">
        Olá, <strong>{name}</strong>. Sua conta está pronta para explorar o Bora
        Vê.
      </p>

      <Link
        href="/login"
        className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20"
      >
        Entrar na minha conta
      </Link>
    </div>
  );
}

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div
      className="mb-5 grid grid-cols-2 gap-2"
      aria-label={`Etapa ${step} de 2`}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={2}
      aria-valuenow={step}
    >
      <span className="h-1.5 rounded-full bg-teal" />

      <span
        className={`h-1.5 rounded-full ${step === 2 ? "bg-teal" : "bg-step"}`}
      />
    </div>
  );
}

function SocialDivider() {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5 text-[0.82rem] text-teal-50 before:h-px before:bg-teal/30 before:content-[''] after:h-px after:bg-teal/30 after:content-['']">
      <span>ou continue com</span>
    </div>
  );
}

function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <small id={id} className="text-[0.8rem] font-semibold text-danger">
      {children}
    </small>
  );
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
      type="button"
      title={`${label} — em breve`}
      aria-label={`Cadastrar com ${label} (em breve)`}
      onClick={() => onPick(label)}
      className="grid size-10 place-items-center rounded-full bg-white text-teal shadow-[0_1px_3px_rgba(12,70,81,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7f7f7] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal/20"
    >
      {children}
    </button>
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
