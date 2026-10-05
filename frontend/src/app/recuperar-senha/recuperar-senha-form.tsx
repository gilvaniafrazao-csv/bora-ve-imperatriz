"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RecuperarSenhaForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    setTimeout(() => {
      router.push(
        `/email-enviado?email=${encodeURIComponent(email.trim())}`,
      );
    }, 700);
  }

  return (
    <main className="min-h-screen bg-[#f8f5ed] text-[#0b3f45] flex flex-col">
      {/* HEADER */}
      <header className="h-[58px] shrink-0 bg-[#0b3f45] px-7 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src="/logo.svg"
            alt="Bora Vê"
            className="w-[120px] h-auto"
          />
        </Link>

        <Link
          href="/login"
          className="text-white text-[11px] md:text-[12px] font-medium hover:text-[#dfff00] transition-colors"
        >
          ← Voltar ao login
        </Link>
      </header>

      {/* CONTEÚDO */}
      <section className="flex-1 flex items-center justify-center px-4 py-10 md:py-12">
        <div
          className="
            w-full
            max-w-[560px]
            bg-white
            rounded-[15px]
            shadow-[0_18px_45px_rgba(20,50,55,0.12)]
            px-7
            py-8
            md:px-10
            md:py-10
          "
        >
          <div className="flex flex-col">
            {/* TÍTULO */}
            <div className="text-center">
              <span className="text-[#27b9b0] text-[12px] font-extrabold uppercase tracking-[1px]">
                Esqueceu a senha?
              </span>

              <h1
                className="
                  mt-2
                  text-[#0b3f45]
                  text-[30px]
                  md:text-[32px]
                  leading-[1.05]
                  font-black
                  tracking-[-0.7px]
                "
              >
                Recuperação de Acesso
              </h1>

              <p className="mt-3 mx-auto max-w-[420px] text-[#788183] text-[12px] leading-[1.5]">
                Informe seu e-mail cadastrado. Enviaremos um link de
                instrução para redefinição.
              </p>
            </div>

            {/* FORMULÁRIO */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1.5 text-[#173f44] text-[14px] font-bold"
                >
                  E-mail cadastrado
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                  autoComplete="email"
                  className="
                    w-full
                    h-[42px]
                    rounded-full
                    border
                    border-[#dce0dc]
                    bg-[#faf9f4]
                    px-4
                    text-[12px]
                    text-[#173f44]
                    outline-none
                    focus:border-[#27b9b0]
                    focus:ring-1
                    focus:ring-[#27b9b0]/20
                    transition
                  "
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full
                  h-[42px]
                  rounded-full
                  bg-[#dfff00]
                  text-[#0b3f45]
                  text-[14px]
                  font-black
                  shadow-[0_5px_12px_rgba(190,220,0,0.25)]
                  hover:brightness-95
                  active:scale-[0.99]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  transition
                "
              >
                {isLoading
                  ? "Enviando..."
                  : "Enviar link de recuperação"}
              </button>
            </form>

            {/* VOLTAR */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="
                  text-[#173f44]
                  text-[12px]
                  font-bold
                  underline
                  hover:text-[#27b9b0]
                  transition-colors
                "
              >
                ← Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="
          h-[32px]
          shrink-0
          bg-[#0b3f45]
          px-7
          md:px-8
          flex
          items-center
          justify-between
          text-[10px]
          text-white/70
        "
      >
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