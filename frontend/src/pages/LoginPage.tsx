import { LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await login({
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      });
      navigate("/historico");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-ink/10 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <LogIn size={20} />
        <h1 className="text-xl font-semibold">Entrar</h1>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" required />
        </div>
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-mint px-4 py-2 font-semibold text-white">
          <LogIn size={18} />
          Entrar
        </button>
      </form>
    </section>
  );
}
