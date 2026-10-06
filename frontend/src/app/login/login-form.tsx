"use client";

import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { loginUser, saveAuthToken } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser({
        email,
        password,
      });

      saveAuthToken(result.token);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Não foi possível entrar. Verifique seus dados.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5ed] text-[#0b3f45] flex flex-col">
      {/* OVERLAY DE CARREGAMENTO */}
      {isLoading && (
        <StatusOverlay
          type="loading"
          title="Entrando..."
          message="Estamos validando seus dados. Só um instante."
        />
      )}

      {/* OVERLAY DE ERRO */}
      {error && !isLoading && (
        <StatusOverlay
          type="error"
          title="Não foi possível entrar"
          message={error}
        >
          <button
            type="button"
            onClick={() => setError("")}
            className="
        flex
        h-11
        w-full
        items-center
        justify-center
        rounded-full
        bg-[#dfff00]
        text-[11px]
        font-black
        text-[#0b3f45]
        transition
        hover:brightness-95
      "
          >
            Tentar novamente
          </button>

          <button
            type="button"
            onClick={() => setError("")}
            className="
        h-10
        w-full
        text-[10px]
        font-semibold
        text-[#0b3f45]
        underline
        hover:text-[#27b9b0]
      "
          >
            Esqueci minha senha
          </button>
        </StatusOverlay>
      )}

      {/* OVERLAY DE SUCESSO */}
      {success && (
        <StatusOverlay
          type="success"
          title="Login realizado!"
          message="Você entrou na sua conta com sucesso."
        >
          <Link
            href="/"
            className="
        flex
        h-11
        w-full
        items-center
        justify-center
        rounded-full
        bg-[#dfff00]
        text-[11px]
        font-black
        text-[#0b3f45]
        transition
        hover:brightness-95
      "
          >
            Ir para a Home →
          </Link>
        </StatusOverlay>
      )}
      {/* HEADER */}
      <header className="h-[58px] shrink-0 bg-[#0b3f45] px-7 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Bora Vê" className="w-[120px] h-auto" />
        </Link>

        <Link
          href="./home"
          className="text-white text-[11px] md:text-[12px] font-medium hover:text-[#dfff00] transition-colors"
        >
          ← Voltar para a Home
        </Link>
      </header>

      {/* CONTEÚDO */}
      <section className="flex-1 flex items-center justify-center px-4 py-6 lg:py-12">
        <div
          className="
            w-full
            max-w-[1000px]
            lg:min-h-[500px]
            bg-white
            rounded-[15px]
            shadow-[0_18px_45px_rgba(20,50,55,0.12)]
            overflow-hidden
            flex
            flex-col
            lg:flex-row
          "
        >
          {/* PAINEL ESQUERDO */}
          <div
            className="
              relative
              hidden
              lg:flex
              lg:w-[43%]
              bg-[#0b3f45]
              px-7
              py-7
              flex-col
              overflow-hidden
            "
          >
            {/* detalhe decorativo */}
            <div
              className="
                absolute
                -right-12
                -top-12
                w-42
                h-42
                rounded-full
                border-[24px]
                border-[#245e49]
                opacity-70
              "
            />

            {/* badge */}
            <div className="relative z-10 mb-5">
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-1
                  rounded-full
                  border
                  border-[#dfff00]/40
                  bg-[#285c46]
                  text-[#dfff00]
                  text-[11px]
                  md:text-[12px]
                  font-extrabold
                  uppercase
                  tracking-wide
                "
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfff00]" />
                Sua cidade, seu ritmo
              </span>
            </div>

            {/* título */}
            <h1
              className="
                relative
                z-10
                text-white
                text-[34px]
                leading-[0.98]
                md:text-[42px]
                md:leading-[0.98]
                font-black
                tracking-[-1.2px]
                max-w-[260px]
              "
            >
              Sua conta
              <br />
              personalizada
              <br />
              para curtir o
              <br />
              <span className="text-[#dfff00]">melhor.</span>
            </h1>

            {/* descrição */}
            <p
              className="
                relative
                z-10
                mt-5
                text-white/75
                text-[11px]
                md:text-[12px]
                leading-[1.45]
                max-w-[320px]
              "
            >
              Salve seus restaurantes prediletos, não perca nenhum evento e
              receba sugestões sob medida para o seu fim de semana.
            </p>

            {/* benefícios */}
            <div className="relative z-10 mt-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="
                    w-5
                    h-5
                    shrink-0
                    rounded-full
                    bg-[#dfff00]
                    text-[#0b3f45]
                    flex
                    items-center
                    justify-center
                    text-[12px]
                    font-black
                  "
                >
                  ♥
                </span>

                <span className="text-white/80 text-[9px] md:text-[10px]">
                  Guarde e organize seus lugares favoritos
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="
                    w-5
                    h-5
                    shrink-0
                    rounded-full
                    bg-[#245e49]
                    text-[#5fd4c9]
                    flex
                    items-center
                    justify-center
                    text-[12px]
                    font-black
                  "
                >
                  ≡
                </span>

                <span className="text-white/80 text-[9px] md:text-[10px]">
                  Ajuste suas preferências a qualquer momento
                </span>
              </div>
            </div>

            {/* rodapé do painel */}
            <div className="relative z-10 mt-auto pt-6">
              <span className="text-[#dfff00] text-[12px] font-extrabold">
                100% Gratuito
              </span>
            </div>
          </div>

          {/* PAINEL DIREITO */}
          <div
            className="
              w-full
              lg:w-[57%]
              bg-[#fffefa]
              px-5
              py-7
              sm:px-7
              lg:px-8
              lg:py-7
              flex
              flex-col
            "
          >
            <>
              {/* título */}
              <div>
                <span className="text-[#27b9b0] text-[12px] font-extrabold uppercase tracking-[1px]">
                  Acesse sua conta
                </span>

                <h2
                  className="
                      mt-1.5
                      text-[#0b3f45]
                      text-[31px]
                      md:text-[32px]
                      leading-[1.05]
                      font-black
                      tracking-[-0.7px]
                    "
                >
                  Que bom ter você por aqui!
                </h2>

                <p className="mt-2 text-[#788183] text-[12px] leading-[1.4]">
                  Entre com seu e-mail e senha para continuar descobrindo a
                  cidade.
                </p>
              </div>

              {/* SOCIAL */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="
                      h-[38px]
                      rounded-full
                      border
                      border-[#e1e3df]
                      bg-white
                      flex
                      items-center
                      justify-center
                      gap-2
                      text-[#4f5b5d]
                      text-[14px]
                      font-semibold
                      hover:bg-[#f8f7f2]
                      transition-colors
                    "
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.95h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.23Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21.67c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.67Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.54 13.77a5.86 5.86 0 0 1 0-3.54V7.71H3.3a9.75 9.75 0 0 0 0 8.58l3.24-2.52Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 6.2c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.32 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.38l3.24 2.52C7.31 7.92 9.46 6.2 12 6.2Z"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  className="
                      h-[38px]
                      rounded-full
                      border
                      border-[#e1e3df]
                      bg-white
                      flex
                      items-center
                      justify-center
                      gap-2
                      text-[#4f5b5d]
                      text-[14px]
                      font-semibold
                      hover:bg-[#f8f7f2]
                      transition-colors
                    "
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.09.8 1.19-.24 2.33-.93 3.6-.84 1.53.12 2.68.73 3.4 1.83-3.16 1.89-2.41 6.05.49 7.21-.58 1.52-1.29 3.03-2.58 3.97ZM12.03 7.25C11.88 5 13.7 3.14 15.78 3c.29 2.6-2.36 4.54-3.75 4.25Z" />
                  </svg>
                  Apple
                </button>
              </div>

              {/* divisor */}
              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-[#e5e7e3]" />

                <span className="text-[#9aa1a1] text-[10px] font-bold uppercase">
                  ou com e-mail
                </span>

                <div className="h-px flex-1 bg-[#e5e7e3]" />
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* E-MAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-1.5 text-[#173f44] text-[14px] font-bold"
                  >
                    E-mail
                  </label>

                  <div className="relative">
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
                          h-[38px]
                          rounded-full
                          border
                          border-[#dce0dc]
                          bg-[#faf9f4]
                          px-3
                          pr-3
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
                </div>

                {/* SENHA */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="text-[#173f44] text-[14px] font-bold"
                    >
                      Senha
                    </label>

                    <Link
                      href="./recuperar-senha"
                      className="
                        text-[#0b3f45]
                        text-[11px]
                        font-bold
                        underline
                        hover:text-[#27b9b0]
                        transition-colors
                      "
                    >
                      Esqueci minha senha
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="
                          w-full
                          h-[38px]
                          rounded-full
                          border
                          border-[#dce0dc]
                          bg-[#faf9f4]
                          pl-3
                          pr-9
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
                          text-[#839091]
                          hover:text-[#0b3f45]
                          transition-colors
                        "
                    >
                      {showPassword ? (
                        <Eye size={16} strokeWidth={1.8} />
                      ) : (
                        <EyeOff size={16} strokeWidth={1.8} />
                      )}
                    </button>
                  </div>
                </div>

                {/* BOTÃO */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                      w-full
                      h-[38px]
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
                  {isLoading ? "Entrando..." : "Entrar  →"}
                </button>
              </form>

              {/* CADASTRO */}
              <div className="mt-auto pt-5 text-center">
                <p className="text-[#8a9394] text-[12px]">
                  Ainda não possui uma conta?{" "}
                  <Link
                    href="/cadastro"
                    className="text-[#173f44] font-bold underline hover:text-[#27b9b0]"
                  >
                    Criar conta grátis
                  </Link>
                </p>
              </div>
            </>
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

function StatusOverlay({
  type,
  title,
  message,
  children,
}: {
  type: "loading" | "error" | "success";
  title: string;
  message?: string;
  children?: ReactNode;
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
            <span
              className="
                h-7
                w-7
                animate-spin
                rounded-full
                border-[3px]
                border-[#cbd4d2]
                border-t-[#0b3f45]
              "
            />
          )}

          {type === "error" && (
            <span className="text-[24px] font-black text-[#871b1b]">!</span>
          )}

          {type === "success" && (
            <span className="text-[25px] font-black text-[#0b3f45]">✓</span>
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

        {/* BOTÕES */}
        {children && <div className="mt-6 flex flex-col gap-2">{children}</div>}
      </div>
    </div>
  );
}
