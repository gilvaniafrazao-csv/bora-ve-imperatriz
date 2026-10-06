"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export function RedefinirSenhaForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!password) {
      setError("Informe uma senha.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (!/\d/.test(password)) {
      setError("A senha deve conter pelo menos um número.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("A senha deve conter pelo menos uma letra maiúscula.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("A senha deve conter pelo menos uma letra minúscula.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  }

  return (
    <main className="min-h-screen bg-[#f8f5ed] text-[#0b3f45] flex flex-col">
      {/* HEADER */}
      <header className="h-[58px] shrink-0 bg-[#0b3f45] px-7 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Bora Vê" className="w-[120px] h-auto" />
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
                Segurança da conta
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
                Nova Senha
              </h1>

              <p className="mt-3 mx-auto max-w-[430px] text-[#788183] text-[12px] leading-[1.5]">
                Crie sua nova senha
                <br />
                Escolha uma nova senha forte para proteger seu acesso.
              </p>
            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* NOVA SENHA */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1.5 text-[#173f44] text-[14px] font-bold"
                >
                  Nova Senha
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    autoComplete="new-password"
                    className="
                      w-full
                      h-[42px]
                      rounded-full
                      border
                      border-[#dce0dc]
                      bg-[#faf9f4]
                      px-4
                      pr-11
                      text-[12px]
                      text-[#173f44]
                      outline-none
                      focus:border-[#27b9b0]
                      focus:ring-1
                      focus:ring-[#27b9b0]/20
                      transition
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[#788183]
                      hover:text-[#0b3f45]
                      transition-colors
                    "
                  >
                    {showPassword ? ( < EyeOff className="h-4 w-4"/>)
                        : (< Eye className="h-4 w-4"/>)}
                  </button>
                </div>
              </div>

              {/* REQUISITOS */}
              <div className="mt-4 rounded-lg border border-[#dce1df] bg-[#f8f9f7] px-3 py-2.5">
                <p className="text-[12px] font-bold text-[#0b3f45]">
                  Requisitos da senha:
                </p>

                <div className="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <span
                    className={`text-[10px] ${
                      password.length >= 8 ? "text-[#16845d]" : "text-[#8a9595]"
                    }`}
                  >
                    ● Pelo menos 8 caracteres
                  </span>

                  <span
                    className={`text-[10px] ${
                      /\d/.test(password) ? "text-[#16845d]" : "text-[#8a9595]"
                    }`}
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

              {/* CONFIRMAR SENHA */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-1.5 text-[#173f44] text-[14px] font-bold"
                >
                  Confirmar Nova Senha
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Digite novamente sua nova senha"
                    required
                    autoComplete="new-password"
                    className="
                      w-full
                      h-[42px]
                      rounded-full
                      border
                      border-[#dce0dc]
                      bg-[#faf9f4]
                      px-4
                      pr-11
                      text-[12px]
                      text-[#173f44]
                      outline-none
                      focus:border-[#27b9b0]
                      focus:ring-1
                      focus:ring-[#27b9b0]/20
                      transition
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[#788183]
                      hover:text-[#0b3f45]
                      transition-colors
                    "
                  >
                    {showConfirmPassword ? ( < EyeOff className="h-4 w-4"/>)
                        : (< Eye className="h-4 w-4"/>)}
                  </button>
                </div>
              </div>

              {/* ERRO */}
              {error && (
                <p className="text-center text-[#c84b4b] text-[11px] font-medium">
                  {error}
                </p>
              )}

              {/* BOTÃO */}
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
                {isLoading ? "Redefinindo..." : "Redefinir senha e entrar"}
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