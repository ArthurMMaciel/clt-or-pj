import { LogIn, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../lib/api";
import { useAuth } from "../lib/demoAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginDemo, loginReal } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
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
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
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

      <div className="my-5 flex items-center gap-3 text-xs text-ink/35">
        <span className="h-px flex-1 bg-ink/10" />
        ou, para apresentação
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-lime px-4 py-2.5 font-semibold text-ink hover:bg-lime/85"
        onClick={() => {
          loginDemo();
          navigate("/calculadora");
        }}
      >
        <Sparkles size={18} />
        Entrar como Arthur (demo)
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-ink/50">
        Ativa histórico com dados fictícios, sem depender do backend.
      </p>
    </section>
  );
}
