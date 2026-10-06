"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

export function EmailEnviadoForm() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "seuemail@exemplo.com";

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
      <section className="flex-1 flex items-center justify-center px-4 py-10 lg:py-12">
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
            {/* ÍCONE */}
            <div className="flex justify-center mb-5">
              <div
                className="
                  w-[58px]
                  h-[58px]
                  rounded-full
                  bg-[#e9f8f5]
                  flex
                  items-center
                  justify-center
                  text-[#27b9b0]
                "
              >
                < Mail size={28}/>
              </div>
            </div>

            {/* TÍTULO */}
            <div className="text-center">
              <span className="text-[#27b9b0] text-[12px] font-extrabold uppercase tracking-[1px]">
                E-mail enviado
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
                Verifique seu e-mail
              </h1>

              <p className="mt-3 mx-auto max-w-[430px] text-[#788183] text-[12px] leading-[1.5]">
                Enviamos as instruções de redefinição para{" "}
                <strong className="text-[#173f44] font-bold">{email}</strong>.
              </p>
            </div>

            {/* INFORMAÇÕES */}
            <div className="mt-7">
              <p className="text-[#173f44] text-[13px] font-bold">
                Não recebeu o e-mail?
              </p>

              <ul className="mt-3 space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <span
                    className="
                      mt-[4px]
                      w-[6px]
                      h-[6px]
                      shrink-0
                      rounded-full
                      bg-[#27b9b0]
                    "
                  />

                  <span className="text-[#788183] text-[12px] leading-[1.4]">
                    Verifique sua caixa de spam ou lixo eletrônico.
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span
                    className="
                      mt-[4px]
                      w-[6px]
                      h-[6px]
                      shrink-0
                      rounded-full
                      bg-[#27b9b0]
                    "
                  />

                  <span className="text-[#788183] text-[12px] leading-[1.4]">
                    Aguarde até 2 minutos para a entrega da mensagem.
                  </span>
                </li>
              </ul>
            </div>

            {/* AÇÕES */}
            <div className="mt-7 space-y-3">
              <Link
                href="/redefinir-senha"
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
                  transition
                  flex
                  items-center
                  justify-center
                "
              >
                Redefinir senha
              </Link>

              <Link
                href="/recuperar-senha"
                className="
                  w-full
                  h-[42px]
                  rounded-full
                  border
                  border-[#dce0dc]
                  bg-[#faf9f4]
                  text-[#173f44]
                  text-[13px]
                  font-bold
                  hover:border-[#27b9b0]
                  hover:text-[#27b9b0]
                  transition
                  flex
                  items-center
                  justify-center
                "
              >
                Tentar outro e-mail
              </Link>
            </div>

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
