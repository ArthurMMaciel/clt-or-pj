import { ArrowRight, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthLayout, SuccessState } from "../components/AuthCard";
import { confirmEmail } from "../lib/api";

type Status = { state: "loading" | "success" | "error"; message: string };

export function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>({ state: "loading", message: "Confirmando seu email..." });
  // StrictMode roda o efeito duas vezes; o token so pode ser usado uma vez.
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const token = params.get("token");
    if (!token) {
      setStatus({ state: "error", message: "O link de confirmação está incompleto." });
      return;
    }

    confirmEmail(token)
      .then(() => setStatus({ state: "success", message: "Email confirmado. Você já pode entrar." }))
      .catch((err) => setStatus({ state: "error", message: err instanceof Error ? err.message : "Erro inesperado." }));
  }, [params]);

  const loginButton = (
    <Link to="/login" className="btn-primary btn-lg w-full">
      Ir para o login
      <ArrowRight size={18} />
    </Link>
  );

  return (
    <AuthLayout eyebrow="Confirmação" title="Confirmação de email" description="Ativando a sua conta." panel="confirm">
      {status.state === "loading" ? (
        <div className="grid place-items-center gap-4 py-6 text-center" role="status">
          <Loader2 size={36} className="animate-spin text-mint" />
          <p className="text-ink/65">{status.message}</p>
        </div>
      ) : null}

      {status.state === "success" ? (
        <SuccessState title="Conta ativada" action={loginButton}>
          <p>{status.message}</p>
        </SuccessState>
      ) : null}

      {status.state === "error" ? (
        <div className="animate-pop-in text-center" role="alert">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-clay/10 text-clay">
            <XCircle size={32} />
          </span>
          <h2 className="mt-5 text-2xl font-bold">Não deu certo</h2>
          <p className="mt-2 text-ink/65">{status.message}</p>
          {params.get("token") ? (
            <p className="hint mt-2">O link vale 24 horas e só pode ser usado uma vez. Tente entrar ou crie a conta de novo.</p>
          ) : null}
          <div className="mt-7 grid gap-3">
            {loginButton}
            <Link to="/cadastro" className="btn-secondary w-full">
              Criar conta
            </Link>
          </div>
        </div>
      ) : null}
    </AuthLayout>
  );
}
