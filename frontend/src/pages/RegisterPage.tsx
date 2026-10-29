import { Loader2, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { AuthCard, FormMessage } from "../components/AuthCard";
import { register } from "../lib/api";

export function RegisterPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setIsLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      await register({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      });
      setStatus("Conta criada. Confira seu email para confirmar o cadastro.");
      formElement.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Grátis"
      title="Criar conta"
      description="Salve suas simulações e compare propostas ao longo da negociação."
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="name">Nome</label>
          <input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <span className="hint">Mínimo de 8 caracteres.</span>
        </div>
        {status ? <FormMessage tone="success">{status}</FormMessage> : null}
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        <button className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          Criar conta
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-ink/60">
        Já tem conta?{" "}
        <Link to="/login" className="font-semibold text-mint hover:text-mint-dark">
          Entrar
        </Link>
      </p>
    </AuthCard>
  );
}
