"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { ApiError } from "@/lib/api";
import { requestPasswordReset } from "@/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClassName =
  "h-12 w-full rounded-xl border border-teal/20 bg-white px-4 text-sm font-medium text-teal shadow-sm transition placeholder:font-normal placeholder:text-placeholder focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/10 aria-invalid:border-danger aria-invalid:ring-danger/10";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setEmailError("Informe o e-mail.");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setEmailError("Informe um e-mail válido.");
      return;
    }

    setEmailError(null);
    setSubmitting(true);

    try {
      const result = await requestPasswordReset(normalizedEmail);
      setSuccessMessage(result.message);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Não foi possível enviar. Tente novamente.");
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
          {successMessage ? (
            <div className="flex flex-col gap-4" role="status">
              <span className="text-sm font-bold text-teal-50">Pedido enviado!</span>

              <h1 className="text-3xl font-extrabold tracking-tight text-teal">
                Confira seu e-mail
              </h1>

              <p className="leading-relaxed text-teal-50">{successMessage}</p>

              <Link
                href="/login"
                className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20"
              >
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form className="flex flex-col gap-[1.15rem]" onSubmit={onSubmit} noValidate>
              <div className="mb-5">
                <h1 className="text-[1.75rem] font-extrabold tracking-tight text-teal">
                  Esqueceu a senha?
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-teal-50">
                  Informe o e-mail da sua conta e enviaremos as instruções para
                  você criar uma nova senha.
                </p>
              </div>

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
                    if (emailError) setEmailError(null);
                  }}
                  aria-invalid={Boolean(emailError)}
                  className={inputClassName}
                />

                {emailError ? (
                  <small className="text-[0.8rem] font-semibold text-danger">
                    {emailError}
                  </small>
                ) : null}
              </label>

              {formError ? (
                <p className="-mt-2 text-sm font-semibold text-danger" role="alert">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white transition hover:bg-teal-70 focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Enviando..." : "Enviar instruções"}
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
            Acontece com
            <br />
            todo mundo.
          </h2>

          <p className="mt-5 max-w-[25rem] text-base leading-relaxed text-white/80">
            Em poucos passos você volta a explorar o Bora Vê.
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