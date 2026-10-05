"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { ApiError } from "@/lib/api";
import { registerUser } from "@/lib/auth";

const ONBOARDING_CATEGORIES = [
  { slug: "restaurantes", label: "Restaurantes", icon: "restaurantes" },
  { slug: "bares", label: "Bares", icon: "bares" },
  { slug: "cafeterias", label: "Cafeterias", icon: "cafeterias" },
  { slug: "cultura", label: "Cultura", icon: "cultura" },
  { slug: "compras", label: "Compras", icon: "compras" },
  { slug: "vida-noturna", label: "Vida Noturna", icon: "vida-noturna" },
  { slug: "ao-ar-livre", label: "Ao ar livre", icon: "ao-ar-livre" },
  { slug: "esportes", label: "Esportes", icon: "esportes" },
] as const;

type OnboardingSlug = (typeof ONBOARDING_CATEGORIES)[number]["slug"];
type FieldKey = "name" | "email" | "password";
type FieldErrors = Partial<Record<FieldKey, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_CATEGORIES = 3;

function validate(name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = "Informe seu nome.";
  } else if (name.trim().length < 2) {
    errors.name = "O nome deve ter pelo menos 2 caracteres.";
  }

  if (!email.trim()) {
    errors.email = "Informe seu e-mail.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!password) {
    errors.password = "Informe uma senha.";
  } else if (password.length < 8) {
    errors.password = "A senha deve ter pelo menos 8 caracteres.";
  } else if (!/\d/.test(password)) {
    errors.password = "A senha deve conter pelo menos um número.";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "A senha deve conter pelo menos uma letra maiúscula.";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "A senha deve conter pelo menos uma letra minúscula.";
  }

  return errors;
}

function mapApiFieldErrors(details: unknown): FieldErrors {
  if (!Array.isArray(details)) return {};

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

    const field = item.field;
    const message = item.message;

    if (
      (field === "name" || field === "email" || field === "password") &&
      typeof message === "string"
    ) {
  
    }
  }

  return errors;
}

function categoryErrorMessage(details: unknown): string | null {
  if (!Array.isArray(details)) return null;

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

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [createdName, setCreatedName] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSlugs, setSelectedSlugs] = useState<OnboardingSlug[]>([]);

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

    const errors = validate(name, email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    if (!acceptedTerms) {
      setFormError("Você precisa aceitar os termos para continuar.");
      return;
    }

    setStep(2);
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);
    setPreferencesError(null);

    const errors = validate(name, email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStep(1);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
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
      setConfirmPassword("");
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
          setFormError(
            Object.keys(apiFields).length === 0 ? error.message : null,
          );
        }
      } else {
        setFormError("Não foi possível criar a conta. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f5ed] text-[#0b3f45]">
      {/* HEADER */}
      <header className="flex h-[58px] shrink-0 items-center justify-between bg-[#0b3f45] px-7 md:px-8">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Bora Vê" className="h-auto w-[120px]" />
        </Link>

        <Link
          href="./home"
          className="text-[11px] font-medium text-white transition-colors hover:text-[#dfff00] md:text-xs"
        >
          ← Voltar para a Home
        </Link>
      </header>

      {/* CONTEÚDO */}
      <section className="flex flex-1 items-center justify-center px-4 py-8 md:py-10">
        <div className="flex min-h-[500px] w-full max-w-[1000px] flex-col overflow-hidden rounded-[15px] bg-white shadow-[0_18px_45px_rgba(20,50,55,0.12)] md:flex-row">
          {/* PAINEL ESQUERDO — MESMA IDENTIDADE DO LOGIN */}
          <div className="relative flex w-full flex-col overflow-hidden bg-[#0b3f45] px-7 py-7 md:w-[43%] md:px-7">
            <div className="absolute -right-12 -top-12 h-42 w-42 rounded-full border-[24px] border-[#245e49] opacity-70" />

            <div className="mt-2 z-10 mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfff00]/40 bg-[#285c46] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#dfff00] md:text-[12px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#dfff00]" />
                Sua cidade, seu ritmo
              </span>
            </div>

            <h1 className="mt-5 z-10 max-w-[260px] text-[34px] font-black leading-[0.98] tracking-[-1.2px] text-white md:text-[42px]">
              Sua conta
              <br />
              personalizada
              <br />
              para curtir o
              <br />
              <span className="text-[#dfff00]">melhor.</span>
            </h1>

            <p className="relative z-10 mt-5 max-w-[320px] text-[12px] leading-[1.45] text-white/75">
              Salve seus restaurantes prediletos, não perca nenhum evento e
              receba sugestões sob medida para o seu fim de semana.
            </p>

            <div className="relative z-10 mt-7 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dfff00] text-[12px] font-black text-[#0b3f45]">
                  ♥
                </span>
                <span className="text-[10px] text-white/80">
                  Guarde e organize seus lugares favoritos
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#245e49] text-[12px] font-black text-[#5fd4c9]">
                  ≡
                </span>
                <span className="text-[10px] text-white/80">
                  Ajuste suas preferências a qualquer momento
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-6">
              <span className="text-[12px] font-extrabold text-[#dfff00]">
                100% Gratuito
              </span>
            </div>
          </div>

          {/* PAINEL DIREITO */}
          <div className="flex w-full flex-col bg-[#fffefa] px-7 py-7 md:w-[57%] md:px-8">
            {/* CADASTRO CONCLUÍDO */}
            {createdName ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#dfff00] text-xl font-black text-[#0b3f45]">
                  ✓
                </div>

                <h2 className="text-[25px] font-black text-[#0b3f45]">
                  Conta criada!
                </h2>

                <p className="mt-2 text-[11px] text-[#788183]">
                  Olá, <strong>{createdName}</strong>. Agora você já pode
                  explorar o Bora Vê.
                </p>

                <Link
                  href="/login"
                  className="mt-6 flex h-10 w-full items-center justify-center rounded-full bg-[#dfff00] text-[11px] font-black text-[#0b3f45] transition hover:brightness-95"
                >
                  Fazer login →
                </Link>
              </div>
            ) : step === 1 ? (
              /* ETAPA 1 — DADOS PESSOAIS */
              <form
                onSubmit={goToPreferences}
                noValidate
                className="flex flex-col"
              >
                <div className="mb-5">
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#27b9b0]">
                    Criar nova conta
                  </span>

                  <h2 className="mt-1 text-[32px] font-black leading-none tracking-[-0.8px] text-[#0b3f45]">
                    Bora começar?
                  </h2>

                  <p className="mt-2 text-[12px] leading-[1.4] text-[#788183]">
                    Preencha seus dados para personalizar seus passeios e
                    favoritos.
                  </p>
                </div>

                {/* NOME */}
                <label className="flex flex-col gap-1.5 text-[14px] font-bold text-[#0b3f45]">
                  <span>Nome completo</span>

                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Como podemos te chamar?"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={inputClass}
                  />

                  {fieldErrors.name && (
                    <FieldError>{fieldErrors.name}</FieldError>
                  )}
                </label>

                {/* EMAIL */}
                <label className="mt-3 flex flex-col gap-1.5 text-[14px] font-bold text-[#0b3f45]">
                  <span>E-mail</span>

                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={inputClass}
                  />

                  {fieldErrors.email && (
                    <FieldError>{fieldErrors.email}</FieldError>
                  )}
                </label>

                {/* SENHAS */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="flex min-w-0 flex-col gap-1.5 text-[14px] font-bold text-[#0b3f45]">
                    <span>Senha</span>

                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={Boolean(fieldErrors.password)}
                        className={`${inputClass} pr-9`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#839091] hover:text-[#0b3f45]"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>

                    {fieldErrors.password && (
                      <FieldError>{fieldErrors.password}</FieldError>
                    )}
                  </label>

                  <label className="flex min-w-0 flex-col gap-1.5 text-[14px] font-bold text-[#0b3f45]">
                    <span>Confirmar senha</span>

                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        className={`${inputClass} pr-9`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar confirmação da senha"
                            : "Mostrar confirmação da senha"
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#839091] hover:text-[#0b3f45]"
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </label>
                </div>

                {/* REQUISITOS */}
                <div className="mt-4 rounded-lg border border-[#dce1df] bg-[#f8f9f7] px-3 py-2.5">
                  <p className="text-[12px] font-bold text-[#0b3f45]">
                    Requisitos da senha:
                  </p>

                  <div className="mt-1.5 grid grid-cols-2 gap-1">
                    <span
                      className={`text-[10px] ${password.length >= 8 ? "text-[#16845d]" : "text-[#8a9595]"}`}
                    >
                      ● Pelo menos 8 caracteres
                    </span>

                    <span
                      className={`text-[10px] ${/\d/.test(password) ? "text-[#16845d]" : "text-[#8a9595]"}`}
                    >
                      ● Ao menos 1 número
                    </span>
                    <span
                      className={`text-[10px] ${
                        /[A-Z]/.test(password)
                          ? "text-[#16845d]"
                          : "text-[#8a9595]"
                      }`}
                    >
                      ● 1 letra maiúscula
                    </span>

                    <span
                      className={`text-[10px] ${
                        /[a-z]/.test(password)
                          ? "text-[#16845d]"
                          : "text-[#8a9595]"
                      }`}
                    >
                      ● 1 letra minúscula
                    </span>
                  </div>
                </div>

                {/* ERRO */}
                {formError && (
                  <p
                    className="mt-2 text-[10px] font-semibold text-[#871b1b]"
                    role="alert"
                  >
                    {formError}
                  </p>
                )}

                {/* TERMOS */}
                <label className="mt-5 flex items-start gap-2 text-[10px] leading-[1.4] text-[#788183]">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-[1px] h-3 w-3 accent-[#0b3f45]"
                  />

                  <span>
                    Li e aceito os{" "}
                    <Link
                      href="#"
                      className="font-bold text-[#0b3f45] underline"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link
                      href="#"
                      className="font-bold text-[#0b3f45] underline"
                    >
                      Política de Privacidade
                    </Link>{" "}
                    do Bora Vê.
                  </span>
                </label>

                {/* BOTÃO */}
                <button
                  type="submit"
                  className="mt-6 flex h-[38px] w-full items-center justify-center rounded-full bg-[#dfff00] text-[14px] font-black text-[#0b3f45] shadow-[0_4px_10px_rgba(190,220,0,0.22)] transition hover:brightness-95"
                >
                  Criar conta →
                </button>

                <div className="my-3 h-px w-full bg-[#e5e7e3]" />

                <p className="text-center text-[12px] text-[#788183]">
                  Já tem uma conta?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#0b3f45] underline"
                  >
                    Fazer login
                  </Link>
                </p>
              </form>
            ) : (
              /* ETAPA 2 — PREFERÊNCIAS */
              <form
                onSubmit={createAccount}
                className="flex h-full flex-col items-center"
              >
                <div className="w-full max-w-[500px] text-center">
                  <h2 className="mt-3 text-[32px] font-black leading-[1.05] tracking-[-1px] text-[#0b3f45]">
                    Quais os seus interesses?
                  </h2>

                  <p className="mx-auto mt-4 max-w-[400px] text-[12px] leading-[1.45] text-[#697477]">
                    Escolha pelo menos 3 categorias para ajudarmos a encontrar o
                    que combina com você.
                  </p>

                  {/* CATEGORIAS */}
                  <div className="mx-auto mt-6 flex max-w-[460px] flex-wrap justify-center gap-x-3 gap-y-4">
                    {ONBOARDING_CATEGORIES.map((category) => {
                      const selected = selectedSlugs.includes(category.slug);

                      return (
                        <button
                          key={category.slug}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleCategory(category.slug)}
                          className={`
              flex
              h-[43px]
              min-w-[135px]
              items-center
              justify-center
              gap-2
              rounded-full
              border
              px-4
              text-[13px]
              font-semibold
              transition-all
              ${
                selected
                  ? "border-[#0b3f45] bg-[#0b3f45] text-white shadow-sm"
                  : "border-[#e0e3e5] bg-white text-[#465257] shadow-[0_2px_5px_rgba(20,50,55,0.05)] hover:border-[#27b9b0]"
              }
            `}
                        >
                          <CategoryIcon
                            type={category.icon}
                            selected={selected}
                          />

                          <span>{category.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* CONTADOR */}
                  <p className="mt-8 text-[14px] font-semibold text-[#9ba5b2]">
                    {selectedSlugs.length} de 3 selecionados
                  </p>

                  {/* ERRO */}
                  {preferencesError && (
                    <p
                      className="mt-3 text-[11px] font-semibold text-[#871b1b]"
                      role="alert"
                    >
                      {preferencesError}
                    </p>
                  )}

                  {formError && (
                    <p
                      className="mt-3 text-[11px] font-semibold text-[#871b1b]"
                      role="alert"
                    >
                      {formError}
                    </p>
                  )}

                  {/* BOTÃO */}
                  <button
                    type="submit"
                    disabled={
                      submitting || selectedSlugs.length < MIN_CATEGORIES
                    }
                    className={`
        mt-5
        flex
        h-[38px]
        w-full
        items-center
        justify-center
        gap-2
        rounded-[24px]
        text-[14px]
        font-bold
        transition-all
        ${
          selectedSlugs.length >= MIN_CATEGORIES
            ? "bg-[#dfff00] text-[#0b3f45] shadow-[0_5px_12px_rgba(190,220,0,0.2)] hover:brightness-95"
            : "bg-[#e3e5e9] text-[#9ca5b2]"
        }
      `}
                  >
                    {submitting
                      ? "Criando conta..."
                      : selectedSlugs.length >= MIN_CATEGORIES
                        ? "Continuar"
                        : "Escolha pelo menos 3"}

                    <span className="text-[20px]">→</span>
                  </button>

                  {/* VOLTAR */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setPreferencesError(null);
                      setStep(1);
                    }}
                    className="mt-4 text-[12px] font-semibold text-[#0b3f45] underline"
                  >
                    Voltar aos dados
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex h-[32px] shrink-0 items-center justify-between bg-[#0b3f45] px-7 text-[10px] text-white/70 md:px-8">
        <span>© 2026 Bora Vê</span>

        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-white">
            Privacidade
          </Link>
          <Link href="#" className="hover:text-white">
            Termos de Uso
          </Link>
          <Link href="#" className="hover:text-white">
            Ajuda &amp; Suporte
          </Link>
        </div>
      </footer>
    </main>
  );
}

const inputClass =
  "h-[38px] w-full rounded-full border border-[#cbd2d0] bg-[#faf9f4] px-4 text-[12px] font-normal text-[#0b3f45] placeholder:text-[#a0a8a7] focus:border-[#27b9b0] focus:outline-none focus:ring-1 focus:ring-[#27b9b0]/20";

function FieldError({ children }: { children: ReactNode }) {
  return (
    <small className="text-[10px] font-semibold text-[#871b1b]">
      {children}
    </small>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.1 3.9" />
      <path d="M6.2 6.2C3.6 8.1 2 12 2 12s3.5 7 10 7c1 0 1.9-.1 2.7-.4" />
    </svg>
  );
}
function CategoryIcon({ type, selected }: { type: string; selected: boolean }) {
  const color = selected ? "currentColor" : "#788183";

  const commonProps = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (type) {
    case "gastronomia":
      return (
        <svg {...commonProps}>
          <path d="M7 3v7" />
          <path d="M4 3v4a3 3 0 0 0 6 0V3" />
          <path d="M7 10v11" />
          <path d="M16 3v18" />
          <path d="M16 3c3 2 4 5 4 8h-4" />
        </svg>
      );

    case "bares":
      return (
        <svg {...commonProps}>
          <path d="M5 4h14l-6 7v6" />
          <path d="M10 21h8" />
          <path d="M13 17h2" />
          <path d="M8 4l2 3" />
        </svg>
      );

    case "natureza":
      return (
        <svg {...commonProps}>
          <path d="M12 21V9" />
          <path d="M12 14c-4 0-7-2-7-7 4 0 7 2 7 7Z" />
          <path d="M12 11c0-4 3-7 7-7 0 5-3 7-7 7Z" />
        </svg>
      );

    case "cultura":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="9" cy="9" r="1" />
          <circle cx="15" cy="8" r="1" />
          <circle cx="8" cy="14" r="1" />
          <path d="M14 16c1.5-1 3-.5 3 1.5" />
        </svg>
      );

    case "vida-noturna":
      return (
        <svg {...commonProps}>
          <path d="M20 15.5A8 8 0 1 1 8.5 4 6.5 6.5 0 0 0 20 15.5Z" />
          <path d="M17 4v4" />
          <path d="M15 6h4" />
        </svg>
      );

    case "esportes":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="m8 5 4 4 4-4" />
          <path d="m5 16 5-1 2 6" />
          <path d="m19 16-5-1-2 6" />
        </svg>
      );

    case "compras":
      return (
        <svg {...commonProps}>
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );

    case "eventos":
      return (
        <svg {...commonProps}>
          <path d="M7 3v4" />
          <path d="M17 3v4" />
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M4 10h16" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      );

    default:
      return null;
  }
}
function StatusOverlay({
  type,
  title,
  message,
  children,
}: {
  type: "loading" | "error" | "success";
  title: string;
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b3f45]/45 px-4 backdrop-blur-md">
      <div className="w-full max-w-[390px] rounded-[24px] bg-white px-8 py-8 text-center shadow-[0_25px_70px_rgba(11,63,69,0.25)]">

        {/* ÍCONE */}
        <div
          className={`
            mx-auto flex h-14 w-14 items-center justify-center rounded-full
            ${
              type === "loading"
                ? "bg-[#eef2f0]"
                : type === "error"
                  ? "bg-[#fff0ef]"
                  : "bg-[#f0ffc4]"
            }
          `}
        >
          {type === "loading" && (
            <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#cbd4d2] border-t-[#0b3f45]" />
          )}

          {type === "error" && (
            <span className="text-[24px] font-black text-[#871b1b]">
              !
            </span>
          )}

          {type === "success" && (
            <span className="text-[25px] font-black text-[#0b3f45]">
              ✓
            </span>
          )}
        </div>

        {/* TÍTULO */}
        <h2 className="mt-5 text-[21px] font-black tracking-[-0.4px] text-[#0b3f45]">
          {title}
        </h2>

        {/* MENSAGEM */}
        {message && (
          <p className="mx-auto mt-2 max-w-[300px] text-[11px] leading-[1.5] text-[#788183]">
            {message}
          </p>
        )}

        {/* BOTÕES / CONTEÚDO */}
        {children && (
          <div className="mt-6 flex flex-col gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}