"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  exchangeOAuthCode,
  OAUTH_PENDING_KEY,
  saveAuthToken,
} from "@/lib/auth";

export function RetornoCliente() {
  const params = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Conectando sua conta…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setFailed(true);
      setMessage("Não encontramos o retorno do login.");
      return;
    }

    let cancelled = false;

    exchangeOAuthCode(code)
      .then((result) => {
        if (cancelled) {
          return;
        }
        if (result.status === "session") {
          saveAuthToken(result.token);
          router.replace("/home");
          return;
        }
        sessionStorage.setItem(
          OAUTH_PENDING_KEY,
          JSON.stringify({
            code: result.code,
            name: result.name,
            email: result.email,
          }),
        );
        router.replace("/cadastro");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setFailed(true);
        setMessage("Esse retorno expirou. Comece o login de novo.");
      });

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7faf9] px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-teal" role="status">
          {message}
        </p>
        {failed ? (
          <Link
            href="/login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-teal px-5 text-sm font-bold text-white"
          >
            Voltar ao login
          </Link>
        ) : null}
      </div>
    </main>
  );
}
