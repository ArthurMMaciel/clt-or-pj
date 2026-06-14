import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { confirmEmail } from "../lib/api";

export function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("Confirmando email...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("Token de confirmação ausente.");
      return;
    }

    confirmEmail(token)
      .then(() => setStatus("Email confirmado. Você já pode entrar."))
      .catch((err) => setStatus(err instanceof Error ? err.message : "Erro inesperado."));
  }, [params]);

  return (
    <section className="mx-auto max-w-md rounded-lg border border-ink/10 bg-white p-6 text-center">
      <CheckCircle2 className="mx-auto mb-4 text-mint" size={36} />
      <h1 className="text-xl font-semibold">Confirmação de email</h1>
      <p className="mt-3 text-sm text-ink/70">{status}</p>
      <Link className="mt-5 inline-flex rounded-md bg-ink px-4 py-2 font-semibold text-white" to="/login">
        Ir para login
      </Link>
    </section>
  );
}
