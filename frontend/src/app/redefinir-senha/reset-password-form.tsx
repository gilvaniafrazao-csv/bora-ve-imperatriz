"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { ApiError } from "@/lib/api";
import { resetPassword } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const inputClassName =
  "h-12 w-full rounded-xl border border-teal/20 bg-white px-4 text-sm font-medium text-teal shadow-sm transition placeholder:font-normal placeholder:text-placeholder focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/10 aria-invalid:border-danger aria-invalid:ring-danger/10";

type FieldErrors = {
  password?: string;
  confirm?: string;
};

function validate(password: string, confirm: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!password) {
    errors.password = "Informe a nova senha.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `A senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`;
  }

  if (!confirm) {
    errors.confirm = "Confirme a nova senha.";
  } else if (password !== confirm) {
    errors.confirm = "As senhas não são iguais.";
  }

  return errors;
}

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!token) {
      return;
    }

    const errors = validate(password, confirm);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword({ token, newPassword: password });
      setSuccess(true);
      setPassword("");
      setConfirm("");
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Não foi possível redefinir a senha. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate grid min-h-dvh overflow-hidden bg-teal min-[901px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      {/* FORMULÁRIO */}
      <section className="relative z-10 flex min-h-dvh justify-center bg-[#f7faf9] px-5 pb-10 pt-24 min-[901px]:items-center min-[901px]:px-[clamp(2rem,5vw,4rem)] min-[901px]:py-10">
        <Link
          href="/login"
          className="absolute left-5 top-16 inline-flex items-center gap-2 text-sm font-semibold text-teal-50 transition hover:text-teal min-[901px]:left-[clamp(2rem,5vw,4rem)] min-[901px]:top-8"
        >
          <span aria-hidden="true">←</span>
          Voltar para o login
        </Link>

        <div className="w-full max-w-[25rem]">
          {!token ? (
            <div className="flex flex-col gap-4" role="alert">
              <h1 className="text-3xl font-extrabold tracking-tight text-teal">
                Link inválido
              </h1>

              <p className="leading-relaxed text-teal-50">
                Esse link de recuperação está incompleto. Peça um novo para
                continuar.
              </p>

              <Link
                href="/esqueci-senha"
                className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20"
              >
                Pedir novo link
              </Link>
            </div>
          ) : success ? (
            <div className="flex flex-col gap-4" role="status">
              <span className="text-sm font-bold text-teal-50">Tudo certo!</span>

              <h1 className="text-3xl font-extrabold tracking-tight text-teal">
                Senha redefinida
              </h1>

              <p className="leading-relaxed text-teal-50">
                Sua nova senha já está valendo. Entre na sua conta para
                continuar.
              </p>

              <Link
                href="/login"
                className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20"
              >
                Ir para o login
              </Link>
            </div>
          ) : (
            <form className="flex flex-col gap-[1.15rem]" onSubmit={onSubmit} noValidate>
              <div className="mb-5">
                <h1 className="text-[1.75rem] font-extrabold tracking-tight text-teal">
                  Crie uma nova senha
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-teal-50">
                  Escolha uma senha com pelo menos {MIN_PASSWORD_LENGTH} caracteres.
                </p>
              </div>

              {/* Nova senha */}
              <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
                <span>Nova senha</span>

                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((current) => ({ ...current, password: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`${inputClassName} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
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
                  <small className="text-[0.8rem] font-semibold text-danger">
                    {fieldErrors.password}
                  </small>
                ) : null}
              </label>

              {/* Confirmar senha */}
              <label className="flex flex-col gap-[0.45rem] text-base font-semibold text-teal">
                <span>Confirmar nova senha</span>

                <input
                  name="confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(event) => {
                    setConfirm(event.target.value);
                    if (fieldErrors.confirm) {
                      setFieldErrors((current) => ({ ...current, confirm: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.confirm)}
                  className={inputClassName}
                />

                {fieldErrors.confirm ? (
                  <small className="text-[0.8rem] font-semibold text-danger">
                    {fieldErrors.confirm}
                  </small>
                ) : null}
              </label>

              {formError ? (
                <div className="-mt-2 flex flex-col gap-1" role="alert">
                  <p className="text-sm font-semibold text-danger">{formError}</p>
                  <Link
                    href="/esqueci-senha"
                    className="text-sm font-bold text-teal underline underline-offset-2 transition hover:text-teal-70"
                  >
                    Pedir um novo link
                  </Link>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* PAINEL DA MARCA (DESKTOP) */}
      <section
        className="relative z-10 hidden min-h-dvh overflow-hidden bg-teal px-[clamp(2rem,5vw,4rem)] py-[clamp(3rem,8vh,6rem)] text-white min-[901px]:flex min-[901px]:flex-col min-[901px]:justify-center"
        aria-label="Sobre o Bora Vê"
      >
        <div className="pointer-events-none absolute inset-0 bg-brand-radial" aria-hidden="true" />

        <div className="relative z-10 max-w-[32rem]">
          <h2 className="text-[clamp(2.25rem,3.5vw,3.35rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-lime">
            Quase lá.
          </h2>

          <p className="mt-5 max-w-[25rem] text-base leading-relaxed text-white/80">
            Defina a nova senha e volte a explorar o Bora Vê.
          </p>
        </div>

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