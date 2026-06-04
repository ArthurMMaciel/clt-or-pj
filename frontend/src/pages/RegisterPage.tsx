import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { register } from "../lib/api";

export function RegisterPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    const form = new FormData(event.currentTarget);

    try {
      await register({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      });
      setStatus("Cadastro criado. Confira seu email para confirmar a conta.");
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-ink/10 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <UserPlus size={20} />
        <h1 className="text-xl font-semibold">Criar conta</h1>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="name">Nome</label>
          <input id="name" name="name" required />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" minLength={8} required />
        </div>
        {status ? <p className="text-sm text-mint">{status}</p> : null}
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-mint px-4 py-2 font-semibold text-white">
          <UserPlus size={18} />
          Cadastrar
        </button>
        <Link to="/login" className="text-center text-sm text-ink/70 hover:text-ink">
          Ja tenho conta
        </Link>
      </form>
    </section>
  );
}
