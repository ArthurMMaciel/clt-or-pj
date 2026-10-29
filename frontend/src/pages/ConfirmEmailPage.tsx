import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { confirmEmail } from "../lib/api";

type Status = { state: "loading" | "success" | "error"; message: string };

export function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>({ state: "loading", message: "Confirmando seu email..." });

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus({ state: "error", message: "O link de confirmação está incompleto." });
      return;
    }

    confirmEmail(token)
      .then(() => setStatus({ state: "success", message: "Email confirmado. Você já pode entrar." }))
      .catch((err) => setStatus({ state: "error", message: err instanceof Error ? err.message : "Erro inesperado." }));
  }, [params]);

  const Icon = status.state === "loading" ? Loader2 : status.state === "success" ? CheckCircle2 : XCircle;
  const tone = status.state === "error" ? "bg-clay/10 text-clay" : "bg-mint-soft text-mint";

  return (
    <section className="card mx-auto max-w-md p-8 text-center">
      <span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${tone}`}>
        <Icon size={28} className={status.state === "loading" ? "animate-spin" : ""} />
      </span>
      <h1 className="mt-5 text-2xl font-bold">Confirmação de email</h1>
      <p className="mt-2 text-ink/65">{status.message}</p>
      <Link className="btn-primary mt-6" to="/login">
        Ir para o login
      </Link>
    </section>
  );
}
