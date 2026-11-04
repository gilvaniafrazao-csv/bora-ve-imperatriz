import { Suspense } from "react";
import { RegisterForm } from "@/app/cadastro/register-form";

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
