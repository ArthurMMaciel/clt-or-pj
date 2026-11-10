import { ArrowRight, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { AuthLayout, Field, FormMessage, PasswordField, SuccessState, isEmail } from "../components/AuthCard";
import { register } from "../lib/api";

type Errors = { name?: string; email?: string; password?: string };

const MIN_PASSWORD = 8;

export function RegisterPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [passwordLength, setPasswordLength] = useState(0);

  function validate(name: string, email: string, password: string): Errors {
    const next: Errors = {};
    if (!name) next.name = "Informe seu nome.";
    if (!email) next.email = "Informe seu email.";
    else if (!isEmail(email)) next.email = "Confira o formato do email.";
    if (password.length < MIN_PASSWORD) next.password = `A senha precisa de pelo menos ${MIN_PASSWORD} caracteres.`;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const fieldErrors = validate(name, email, password);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    try {
      await register({ name, email, password });
      setRegisteredEmail(email);
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

  if (registeredEmail) {
    return (
      <AuthLayout eyebrow="Conta criada" title="Confira seu email" description="Mandamos um link de confirmação." panel="confirm">
        <SuccessState
          title="Quase lá"
          action={
            <Link to="/login" className="btn-primary btn-lg w-full">
              Ir para o login
              <ArrowRight size={18} />
            </Link>
          }
        >
          <p>
            Abra o email enviado para <strong className="text-ink">{registeredEmail}</strong> e clique no link para ativar a
            conta.
          </p>
          <p className="hint mt-3">Não chegou? Olhe a caixa de spam.</p>
        </SuccessState>
      </AuthLayout>
    );
  }

  const strength = Math.min(passwordLength / 12, 1);

  return (
    <AuthLayout
      eyebrow="Grátis"
      title="Criar conta"
      description="Salve suas simulações e acompanhe a negociação."
      panel="register"
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <Field name="name" label="Nome" autoComplete="name" error={errors.name} onChange={() => clearError("name")} />
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          error={errors.email}
          onChange={() => clearError("email")}
        />
        <div className="grid gap-2">
          <PasswordField
            name="password"
            label="Senha"
            autoComplete="new-password"
            hint={`Mínimo de ${MIN_PASSWORD} caracteres.`}
            error={errors.password}
            onChange={(event) => {
              setPasswordLength(event.currentTarget.value.length);
              clearError("password");
            }}
          />
          <div className="h-1.5 overflow-hidden rounded-full bg-paper" aria-hidden>
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                passwordLength >= MIN_PASSWORD ? "bg-mint" : "bg-pj"
              }`}
              style={{ width: `${strength * 100}%` }}
            />
          </div>
        </div>
        {formError ? (
          <FormMessage tone="error" attempt={attempt}>
            {formError}
          </FormMessage>
        ) : null}
        <button className="btn-primary btn-lg mt-1 w-full" disabled={isLoading}>
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          {isLoading ? "Criando conta..." : "Criar conta grátis"}
          {isLoading ? null : <ArrowRight size={18} />}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        Já tem conta?{" "}
        <Link to="/login" className="font-semibold text-mint hover:text-mint-dark">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
