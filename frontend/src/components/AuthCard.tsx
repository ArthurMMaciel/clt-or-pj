import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, History, Scale, ShieldCheck } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";

import { EXAMPLE } from "../lib/example";
import { HillsArt } from "./HillsArt";

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

// Tela de autenticacao: formulario a esquerda e painel visual verde-floresta a direita (no celular vira um cabecalho).
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
    <section className="card mx-auto grid w-full max-w-5xl overflow-hidden p-0 lg:min-h-[640px] lg:grid-cols-[1fr_1.05fr]">
      <div className="relative isolate overflow-hidden bg-forest-deep px-6 py-7 text-white lg:hidden">
        <HillsArt className="absolute inset-x-0 bottom-0 -z-10 h-full w-full opacity-80" />
        <p className="text-sm font-semibold text-lime">{eyebrow}</p>
        <p className="mt-1 max-w-xs font-display text-xl font-bold leading-tight">{copy.title}</p>
      </div>

      <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto w-full max-w-sm animate-fade-up">
          <p className="eyebrow hidden lg:inline-flex">{eyebrow}</p>
          <h1 className="text-3xl font-bold lg:mt-3 lg:text-4xl">{title}</h1>
          <p className="mt-2 text-ink/60">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <AuthPanel copy={copy} />
    </section>
  );
}

function AuthPanel({ copy }: { copy: PanelCopy }) {
  const max = Math.max(EXAMPLE.cltAnnual, EXAMPLE.pjAnnual);

  return (
    <aside className="relative isolate hidden overflow-hidden bg-forest-deep p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <HillsArt className="absolute inset-x-0 bottom-0 -z-10 h-[60%] w-full" />
      <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-lime/20 blur-3xl" aria-hidden />

      <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        <h2 className="max-w-sm text-3xl font-bold leading-tight">{copy.title}</h2>
        <ul className="mt-6 grid gap-3 text-sm text-white/75">
          {copy.points.map((point) => (
            <li key={point} className="flex items-center gap-2.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-lime text-forest-deep">
                <Check size={13} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-10 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <div className="absolute -top-5 right-4 z-10 flex animate-float items-center gap-2 rounded-2xl bg-white px-3 py-2 text-ink shadow-float">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-lime text-forest-deep">
            <History size={15} />
          </span>
          <span className="text-xs font-semibold">Salvo no histórico</span>
        </div>
        <div className="rounded-3xl bg-white p-5 text-ink shadow-float" aria-hidden>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Scale size={16} className="text-mint" />
              CLT R$ 10 mil x PJ R$ 15 mil
            </span>
            <span className="badge bg-pj-soft text-pj-ink">PJ compensa</span>
          </div>
          <div className="mt-4 grid gap-2.5">
            <PanelBar label="CLT" value={EXAMPLE.cltAnnual} width={(EXAMPLE.cltAnnual / max) * 100} bar="bg-clt" />
            <PanelBar label="PJ" value={EXAMPLE.pjAnnual} width={(EXAMPLE.pjAnnual / max) * 100} bar="bg-pj" delay={150} />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-forest px-4 py-3 text-white">
            <span className="text-xs text-white/70">Peça pelo menos</span>
            <span className="num font-bold text-lime">{BRL0.format(EXAMPLE.recommended)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PanelBar({ label, value, width, bar, delay = 0 }: { label: string; value: number; width: number; bar: string; delay?: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span className="num">{BRL0.format(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-paper">
        <div
          className={`h-full origin-left animate-grow-x rounded-full ${bar}`}
          style={{ width: `${width}%`, animationDelay: `${400 + delay}ms` }}
        />
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
          <AlertCircle size={14} />
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
          className="grid h-9 w-9 place-items-center rounded-full text-ink/45 transition hover:bg-paper hover:text-ink"
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
    tone === "error" ? "animate-shake border-clay/25 bg-clay/5 text-clay" : "animate-pop-in border-mint/25 bg-mint-soft text-mint-dark";
  const Icon = tone === "error" ? AlertCircle : ShieldCheck;

  return (
    <p key={attempt} role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-2xl border px-3.5 py-3 text-sm ${style}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      {children}
    </p>
  );
}

export function SuccessState({ title, children, action }: { title: string; children: ReactNode; action: ReactNode }) {
  return (
    <div className="animate-pop-in text-center" role="status">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint-soft text-mint ring-8 ring-mint-soft/50">
        <CheckCircle2 size={32} />
      </span>
      <h2 className="mt-5 text-2xl font-bold">{title}</h2>
      <div className="mt-2 text-ink/65">{children}</div>
      <div className="mt-7">{action}</div>
    </div>
  );
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
