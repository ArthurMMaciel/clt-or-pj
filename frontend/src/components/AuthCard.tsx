import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";

import { EXAMPLE } from "../lib/example";

const BRL0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

type PanelCopy = { title: string; points: string[] };

const panels: Record<"login" | "register" | "confirm", PanelCopy> = {
  login: {
    title: "Suas propostas, guardadas em um lugar só.",
    points: ["Histórico de todas as simulações", "Volte a uma proposta quando a negociação andar", "Mesmas regras de 2026 da calculadora"],
  },
  register: {
    title: "Compare cada proposta da sua negociação.",
    points: ["Grátis, sem cartão", "Histórico salvo na sua conta", "Simular continua liberado sem login"],
  },
  confirm: {
    title: "Falta pouco para guardar suas simulações.",
    points: ["Confirme o email uma vez", "Entre e simule normalmente", "Seu histórico começa na próxima simulação"],
  },
};

// Tela de autenticacao: formulario a esquerda e painel forest pautado a direita (no celular vira um cabecalho curto).
export function AuthLayout({
  eyebrow,
  title,
  description,
  panel,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  panel: keyof typeof panels;
  children: ReactNode;
}) {
  const copy = panels[panel];

  return (
    <section className="card mx-auto grid w-full max-w-5xl overflow-hidden lg:min-h-[600px] lg:grid-cols-[1fr_1fr]">
      <div className="ruled-dark px-6 py-6 text-white lg:hidden">
        <p className="text-sm font-semibold text-lime">{eyebrow}</p>
        <p className="mt-1 max-w-xs font-display text-xl font-semibold leading-tight">{copy.title}</p>
      </div>

      <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto w-full max-w-sm">
          <p className="eyebrow hidden lg:block">{eyebrow}</p>
          <h1 className="text-[1.9rem] leading-tight lg:mt-2 lg:text-[2.3rem]">{title}</h1>
          <p className="mt-2 text-muted">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>

      <AuthPanel copy={copy} />
    </section>
  );
}

function AuthPanel({ copy }: { copy: PanelCopy }) {
  const max = Math.max(EXAMPLE.cltAnnual, EXAMPLE.pjAnnual);

  return (
    <aside className="ruled-dark hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div>
        <h2 className="max-w-sm text-[1.9rem] leading-tight">{copy.title}</h2>
        <ul className="mt-6 grid gap-3 text-sm text-white/80">
          {copy.points.map((point) => (
            <li key={point} className="flex items-center gap-2.5">
              <Check size={15} className="shrink-0 text-lime" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Exemplo com numeros reais do motor (EXAMPLE), so ilustrativo. */}
      <div className="mt-10 rounded-xl bg-white p-5 text-ink" aria-hidden>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">CLT R$ 10 mil x PJ R$ 15 mil</span>
          <span className="badge bg-pj-soft text-pj-ink">PJ compensa</span>
        </div>
        <div className="mt-4 grid gap-2.5">
          <PanelBar label="CLT" value={EXAMPLE.cltAnnual} width={(EXAMPLE.cltAnnual / max) * 100} bar="bg-clt" />
          <PanelBar label="PJ" value={EXAMPLE.pjAnnual} width={(EXAMPLE.pjAnnual / max) * 100} bar="bg-pj" />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-forest px-4 py-3 text-white">
          <span className="text-xs text-white/75">Peça pelo menos</span>
          <span className="num font-display text-lg font-semibold text-lime">{BRL0.format(EXAMPLE.recommended)}</span>
        </div>
      </div>
    </aside>
  );
}

function PanelBar({ label, value, width, bar }: { label: string; value: number; width: number; bar: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span className="num">{BRL0.format(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-paper">
        <div className={`h-full rounded-sm ${bar}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
};

// Campo com erro inline: borda vermelha, mensagem abaixo e aria-invalid/aria-describedby para leitor de tela.
export function Field({ name, label, hint, error, trailing, className = "", ...input }: FieldProps) {
  const id = input.id ?? name;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          {...input}
          id={id}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${error ? "border-clay/60 focus:border-clay focus:ring-clay/15" : ""} ${trailing ? "pr-12" : ""} ${className}`}
        />
        {trailing ? <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div> : null}
      </div>
      {error ? (
        <span id={`${id}-error`} className="flex animate-fade-in items-center gap-1.5 text-xs font-medium text-clay">
          <AlertCircle size={14} aria-hidden />
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-md text-subtle transition-colors hover:bg-paper hover:text-ink"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}

// `attempt` muda a cada envio com erro, para a mensagem tremer de novo mesmo com o mesmo texto.
export function FormMessage({ tone, attempt = 0, children }: { tone: "error" | "success"; attempt?: number; children: ReactNode }) {
  const style =
    tone === "error" ? "animate-shake border-clay/30 bg-clay/5 text-clay" : "animate-fade-up border-mint/30 bg-mint-soft text-mint-dark";
  const Icon = tone === "error" ? AlertCircle : ShieldCheck;

  return (
    <p key={attempt} role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm ${style}`}>
      <Icon size={17} className="mt-0.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

export function SuccessState({ title, children, action }: { title: string; children: ReactNode; action: ReactNode }) {
  return (
    <div className="animate-fade-up text-center" role="status">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint-soft text-mint">
        <CheckCircle2 size={26} aria-hidden />
      </span>
      <h2 className="mt-4 text-2xl">{title}</h2>
      <div className="mt-2 text-muted">{children}</div>
      <div className="mt-7">{action}</div>
    </div>
  );
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
