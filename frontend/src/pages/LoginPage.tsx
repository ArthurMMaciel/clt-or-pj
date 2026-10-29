import { Loader2, LogIn, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard, FormMessage } from "../components/AuthCard";
import { login } from "../lib/api";
import { useAuth } from "../lib/demoAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginDemo, loginReal } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");

    try {
      await login({
        email,
        password: String(form.get("password") || ""),
      });
      loginReal(email);
      navigate("/historico");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard eyebrow="Bem-vindo de volta" title="Entrar" description="Acesse seu histórico de simulações.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        <button className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          Entrar
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/60">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-semibold text-mint hover:text-mint-dark">
          Criar conta
        </Link>
      </p>

      <div className="my-5 flex items-center gap-3 text-xs text-ink/35">
        <span className="h-px flex-1 bg-line" />
        ou, para apresentação
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        className="btn w-full bg-lime text-ink hover:bg-lime/85"
        onClick={() => {
          loginDemo();
          navigate("/calculadora");
        }}
      >
        <Sparkles size={18} />
        Entrar como Arthur (demo)
      </button>
      <p className="hint mt-3 text-center">Ativa o histórico com dados fictícios, sem depender do backend.</p>
    </AuthCard>
  );
}
