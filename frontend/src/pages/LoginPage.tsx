import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthLayout, Field, FormMessage, PasswordField, isEmail } from "../components/AuthCard";
import { login } from "../lib/api";
import { useAuth } from "../lib/demoAuth";

type Errors = { email?: string; password?: string };

export function LoginPage() {
  const navigate = useNavigate();
  const { loginDemo, loginReal } = useAuth();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  function validate(email: string, password: string): Errors {
    const next: Errors = {};
    if (!email) next.email = "Informe seu email.";
    else if (!isEmail(email)) next.email = "Confira o formato do email.";
    if (!password) next.password = "Informe sua senha.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const fieldErrors = validate(email, password);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      loginReal(email);
      navigate("/historico");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro inesperado.");
      setAttempt((value) => value + 1);
    } finally {
      setIsLoading(false);
    }
  }

  function clearError(field: keyof Errors) {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <AuthLayout eyebrow="Bem-vindo de volta" title="Entrar" description="Acesse o histórico das suas simulações." panel="login">
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          error={errors.email}
          onChange={() => clearError("email")}
        />
        <PasswordField
          name="password"
          label="Senha"
          autoComplete="current-password"
          error={errors.password}
          onChange={() => clearError("password")}
        />
        {formError ? (
          <FormMessage tone="error" attempt={attempt}>
            {formError}
          </FormMessage>
        ) : null}
        <button className="btn-primary btn-lg mt-1 w-full" disabled={isLoading}>
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          {isLoading ? "Entrando..." : "Entrar"}
          {isLoading ? null : <ArrowRight size={18} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-semibold text-mint hover:text-mint-dark">
          Criar conta grátis
        </Link>
      </p>

      <div className="my-6 flex items-center gap-3 text-xs text-ink/40">
        <span className="h-px flex-1 bg-line" />
        ou, para apresentação
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        className="btn-lime w-full"
        onClick={() => {
          loginDemo();
          navigate("/calculadora");
        }}
      >
        <Sparkles size={18} />
        Entrar como Arthur (demo)
      </button>
      <p className="hint mt-3 text-center">Ativa o histórico com dados fictícios, sem depender do backend.</p>
    </AuthLayout>
  );
}
