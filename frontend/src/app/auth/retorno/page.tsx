import { Suspense } from "react";
import { RetornoCliente } from "@/app/auth/retorno/retorno-cliente";

export default function RetornoPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center bg-[#f7faf9] px-6">
          <p className="text-sm font-semibold text-teal">Conectando sua conta…</p>
        </main>
      }
    >
      <RetornoCliente />
    </Suspense>
  );
}
