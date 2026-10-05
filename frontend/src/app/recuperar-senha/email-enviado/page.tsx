import { Suspense } from "react";

import { EmailEnviadoForm } from "@/app/recuperar-senha/email-enviado/email-enviado-form";

export default function EmailEnviadoPage() {
  return (
    <Suspense fallback={null}>
      <EmailEnviadoForm />
    </Suspense>
  );
}
