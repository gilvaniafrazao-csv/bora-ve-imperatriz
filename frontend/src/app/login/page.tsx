import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-peach px-8 py-8 text-center text-teal">
      <div>
        <h1 className="mb-3 text-[1.8rem] font-extrabold">Login em breve</h1>
        <p className="mb-5">A tela de entrada (RF02) ainda não foi implementada.</p>
        <Link className="font-extrabold underline underline-offset-2" href="/cadastro">
          Voltar para o cadastro
        </Link>
      </div>
    </main>
  );
}
