"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { ApiError } from "@/lib/api";
import { loginUser, saveAuthToken } from "@/lib/auth";

type FieldKey = "email" | "password";
type FieldErrors = Partial<Record<FieldKey, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClassName =
  "h-12 w-full rounded-xl border border-teal/20 bg-white px-4 text-sm font-medium text-teal shadow-sm transition placeholder:font-normal placeholder:text-placeholder focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/10 aria-invalid:border-danger aria-invalid:ring-danger/10";

function isFieldKey(value: unknown): value is FieldKey {
  return value === "email" || value === "password";
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

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = "Informe o e-mail.";
  } else if (!EMAIL_REGEX.test(normalizedEmail)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!password) {
    errors.password = "Informe a senha.";
  }

  return errors;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [signedInName, setSignedInName] = useState<string | null>(null);

  function clearMessages() {
    setFormError(null);
    setHint(null);
  }

  function onSocialPick(label: string) {
    setFormError(null);
    setHint(`Login com ${label} em breve.`);
  }

  function onForgotPassword() {
    setFormError(null);
    setHint(
      "A recuperação de senha estará disponível em breve. Por enquanto, tente entrar novamente.",
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearMessages();

    const localErrors = validate(email, password);
    setFieldErrors(localErrors);

    if (Object.keys(localErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      saveAuthToken(result.token);

      setSignedInName(result.user.name);
      setPassword("");
      setFieldErrors({});
    } catch (error) {
      if (error instanceof ApiError) {
        const apiErrors = mapApiFieldErrors(error.details);

        setFieldErrors(apiErrors);

        if (Object.keys(apiErrors).length === 0) {
          setFormError(error.message);
        }
      } else {
        setFormError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate grid min-h-dvh overflow-hidden bg-teal min-[901px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      {/* FORMULÁRIO */}
      <section className="relative z-10 flex min-h-dvh justify-center bg-[#f7faf9] px-5 pb-10 pt-24 min-[901px]:items-center min-[901px]:px-[clamp(2rem,5vw,4rem)] min-[901px]:py-10">
        {/* Logo mobile */}
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

        {/* Voltar */}
        <Link
          href="/home"
          className="absolute left-5 top-16 inline-flex items-center gap-2 text-sm font-semibold text-teal-50 transition hover:text-teal min-[901px]:left-[clamp(2rem,5vw,4rem)] min-[901px]:top-8"
        >
          <span aria-hidden="true">←</span>
          Voltar para a Home
        </Link>

        <div className="w-full max-w-[25rem]">
          {signedInName ? (
            <LoginSuccess name={signedInName} />
          ) : (
            <form
              className="flex flex-col gap-[1.15rem] [@media(min-width:901px)_and_(max-height:720px)]:gap-[0.85rem]"
              onSubmit={onSubmit}
              noValidate
            >
              {/* Cabeçalho */}
              <div className="mb-5">
                <h1 className="text-[1.75rem] font-extrabold tracking-tight text-teal">
                  Que bom ter você de volta
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-teal-50">
                  Entre na sua conta para continuar explorando o Bora Vê.
                </p>
              </div>

              {/* E-mail */}
              <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
                <span>E-mail</span>

                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="nome@email.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (fieldErrors.email) {
                      setFieldErrors((current) => ({
                        ...current,
                        email: undefined,
                      }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "login-email-error" : undefined
                  }
                  className={inputClassName}
                />

                {fieldErrors.email ? (
                  <FieldError id="login-email-error">
                    {fieldErrors.email}
                  </FieldError>
                ) : null}
              </label>

              {/* Senha */}
              <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
                <span>Senha</span>

                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (fieldErrors.password) {
                        setFieldErrors((current) => ({
                          ...current,
                          password: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? "login-password-error" : undefined
                    }
                    className={`${inputClassName} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-teal transition hover:bg-teal-10 focus:outline-none focus:ring-2 focus:ring-teal/20"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
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
                  <FieldError id="login-password-error">
                    {fieldErrors.password}
                  </FieldError>
                ) : null}
              </label>

              {/* Recuperação */}
              <button
                type="button"
                onClick={onForgotPassword}
                className="-mt-1 self-end rounded-md text-[0.82rem] font-semibold text-teal-50 transition hover:text-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
              >
                Esqueci minha senha
              </button>

              {/* Erro geral */}
              {formError ? (
                <p
                  className="-mt-2 text-sm font-semibold text-danger"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}

              {/* Entrar */}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Entrando..." : "Entrar"}
              </button>

              {/* Divisor */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5 text-[0.82rem] text-teal-50 before:h-px before:bg-teal/30 before:content-[''] after:h-px after:bg-teal/30 after:content-['']">
                <span>ou continue com</span>
              </div>

              {/* Redes sociais */}
              <div
                className="flex justify-center gap-5"
                aria-label="Opções de login com rede social"
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

              {/* Mensagens informativas */}
              {hint ? (
                <p
                  className="text-center text-[0.8rem] font-semibold text-teal"
                  role="status"
                >
                  {hint}
                </p>
              ) : null}

              {/* Cadastro */}
              <p className="text-center text-[0.95rem] text-muted">
                Ainda não tem uma conta?{" "}
                <Link
                  href="/cadastro"
                  className="font-bold text-teal underline underline-offset-2 transition hover:text-teal-70"
                >
                  Criar conta
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>

      {/* PAINEL DA MARCA — DESKTOP */}
      <section
        className="relative z-10 hidden min-h-dvh overflow-hidden bg-teal px-[clamp(2rem,5vw,4rem)] py-[clamp(3rem,8vh,6rem)] text-white min-[901px]:flex min-[901px]:flex-col min-[901px]:justify-center"
        aria-label="Sobre o Bora Vê"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-brand-radial"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[32rem]">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-white/70">
            Descubra a cidade
          </p>

          <h2 className="text-[clamp(2.25rem,3.5vw,3.35rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-lime">
            Sempre tem algo
            <br />
            novo para ver.
          </h2>

          <p className="mt-5 max-w-[25rem] text-base leading-relaxed text-white/80">
            Lugares, sabores, encontros e experiências que fazem parte da
            cidade.
          </p>
        </div>

        {/* Logo no rodapé */}
        <img
          src="/logo-redondo.svg"
          alt=""
          aria-hidden="true"
          className="absolute bottom-8 right-8 z-10 w-16 select-none object-contain"
        />
      </section>
    </main>
  );
}

function LoginSuccess({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-4" role="status">
      <span className="text-sm font-bold text-teal-50">Tudo certo!</span>

      <h1 className="text-3xl font-extrabold tracking-tight text-teal">
        Bem-vindo, {name}.
      </h1>

      <p className="leading-relaxed text-teal-50">
        Sua conta está conectada. Continue explorando o Bora Vê.
      </p>

      <Link
        href="/home"
        className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20"
      >
        Ir para a Home
      </Link>
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
      aria-label={`Entrar com ${label} (em breve)`}
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
