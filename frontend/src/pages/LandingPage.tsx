import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  FileText,
  Handshake,
  Landmark,
  Loader2,
  Lock,
  Percent,
  PiggyBank,
  Repeat,
  Scale,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { compareContracts } from "../lib/api";
import { quickCLT, quickPJ } from "../lib/defaults";
import { Reveal, useCountUp, useInView } from "../lib/motion";

// Resultado do motor mvp-2 para CLT R$ 10.000 + R$ 1.000 de beneficios x PJ R$ 15.000,
// com as premissas padrao da calculadora. Conferido em values_test.go e pela skill validar-calculadora.
const example = {
  salary: 10000,
  benefits: 1000,
  pjRate: 15000,
  cltAnnual: 126101,
  pjAnnual: 152256,
  breakEven: 12681,
  recommended: 14076,
  margin: 0.11,
  pjMonthlyNet: 12688,
  pjMonthlyReserve: 5200,
  pjMonthlyFree: 7488,
};

const BRL0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function LandingPage() {
  return (
    <div className="pb-6">
      <Hero />
      <div className="mx-auto max-w-6xl px-4">
        <Personas />
        <Showcase />
        <HowItWorks />
        <WhatCounts />
        <Methodology />
        <Pricing />
        <Faq />
      </div>
      <FinalCta />
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero() {
  return (
    <section className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="relative isolate overflow-hidden rounded-4xl bg-forest-deep text-white sm:rounded-5xl">
        <HillsArt className="absolute inset-x-0 bottom-0 -z-10 h-[62%] w-full" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-lime/20 blur-3xl"
          aria-hidden
        />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <span className="badge animate-fade-up border border-white/15 bg-white/10 text-lime backdrop-blur">
              <Sparkles size={14} />
              Regras de 2026 · isenção de IR até R$ 5 mil
            </span>
            <h1
              className="mt-6 animate-fade-up text-[2.6rem] font-bold leading-[1.02] sm:text-6xl lg:text-[4.2rem]"
              style={{ animationDelay: "80ms" }}
            >
              Não aceite a proposta PJ antes de fazer <span className="text-lime">essa conta</span>.
            </h1>
            <p
              className="mt-6 max-w-xl animate-fade-up text-lg leading-8 text-white/75"
              style={{ animationDelay: "160ms" }}
            >
              Coloque o salário CLT e o valor da nota. Em segundos você vê qual deixa mais dinheiro no ano e quanto pedir
              para a troca valer a pena.
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <Link to="/calculadora" className="btn-lime btn-lg">
                Fazer a conta completa
                <ArrowRight size={18} />
              </Link>
              <a href="#como-funciona" className="btn btn-lg border border-white/20 text-white hover:bg-white/10">
                Como funciona
              </a>
            </div>
            <ul
              className="mt-9 flex animate-fade-up flex-wrap gap-x-6 gap-y-2 text-sm text-white/70"
              style={{ animationDelay: "320ms" }}
            >
              <ProofItem label="Grátis e sem cadastro" />
              <ProofItem label="Tabelas de 2026" />
              <ProofItem label="Conta aberta, passo a passo" />
            </ul>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "200ms" }}>
            <FloatingChip
              className="-left-8 -top-11 hidden animate-float lg:flex"
              icon={Percent}
              title="Fator R 28%"
              text="Anexo III do Simples"
            />
            <MiniSimulator />
            <FloatingChip
              className="-bottom-11 -right-6 hidden animate-float-slow lg:flex"
              icon={ShieldCheck}
              title="Margem de risco"
              text="10% a 30% sobre o empate"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HillsArt({ className = "" }: { className?: string }) {
  // Paisagem desenhada em SVG (original do projeto): camadas de colinas do verde-floresta ao lima.
  // Ids unicos por instancia: a arte aparece no hero e no CTA final.
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;
  return (
    <svg className={className} viewBox="0 0 1440 560" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <radialGradient id={id("sun")} cx="78%" cy="20%" r="45%">
          <stop offset="0%" stopColor="#d4f46a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d4f46a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("back")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3f8f5f" />
          <stop offset="100%" stopColor="#1c5a3d" />
        </linearGradient>
        <linearGradient id={id("mid")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2f7a52" />
          <stop offset="100%" stopColor="#14452f" />
        </linearGradient>
        <linearGradient id={id("front")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#174d35" />
          <stop offset="100%" stopColor="#0a281d" />
        </linearGradient>
        <linearGradient id={id("fade")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0a281d" stopOpacity="1" />
          <stop offset="35%" stopColor="#0a281d" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1440" height="560" fill={`url(#${id("sun")})`} />
      <path
        d="M0 300 C 180 220 340 250 520 290 C 700 330 860 210 1060 200 C 1240 190 1340 250 1440 240 L1440 560 L0 560 Z"
        fill={`url(#${id("back")})`}
        opacity="0.75"
      />
      <path
        d="M0 380 C 220 320 380 330 600 370 C 820 410 980 300 1180 300 C 1300 300 1380 330 1440 340 L1440 560 L0 560 Z"
        fill={`url(#${id("mid")})`}
      />
      <path
        d="M0 460 C 260 400 480 420 700 450 C 920 480 1120 400 1440 420 L1440 560 L0 560 Z"
        fill={`url(#${id("front")})`}
      />
      <rect width="1440" height="560" fill={`url(#${id("fade")})`} />
    </svg>
  );
}

function FloatingChip({
  className,
  icon: Icon,
  title,
  text,
}: {
  className: string;
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div
      className={`absolute z-10 items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 text-ink shadow-float backdrop-blur ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-forest-deep">
        <Icon size={17} />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-ink/55">{text}</span>
      </span>
    </div>
  );
}

type QuickResult = {
  cltAnnual: number;
  pjAnnual: number;
  breakEven: number;
  recommended: number;
  margin: number;
  winner: "clt" | "pj" | "neutral";
};

const initialResult: QuickResult = {
  cltAnnual: example.cltAnnual,
  pjAnnual: example.pjAnnual,
  breakEven: example.breakEven,
  recommended: example.recommended,
  margin: example.margin,
  winner: "pj",
};

function MiniSimulator() {
  const [salary, setSalary] = useState(example.salary);
  const [benefits, setBenefits] = useState(example.benefits);
  const [pjRate, setPjRate] = useState(example.pjRate);
  const [result, setResult] = useState<QuickResult>(initialResult);
  const [isExample, setIsExample] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (salary <= 0 || pjRate <= 0) {
      setError("Preencha o salário CLT e o valor da nota PJ.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await compareContracts({ clt: quickCLT(salary, benefits), pj: quickPJ(pjRate) });
      setResult({
        cltAnnual: data.clt.annualNet,
        pjAnnual: data.pj.annualNet,
        breakEven: data.minimumPjToBreakEven,
        recommended: data.minimumPjRecommended,
        margin: data.pj.riskPremiumRate,
        winner: data.recommendedOption,
      });
      setIsExample(false);
    } catch {
      setError("Não conseguimos calcular agora. Tente de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }

  const params = new URLSearchParams({
    modo: "compare",
    salario: String(salary),
    beneficios: String(benefits),
    nota: String(pjRate),
  });

  return (
    <form onSubmit={handleSubmit} className="card relative p-5 text-ink shadow-lift sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Simule agora</p>
        <span className="badge bg-paper text-ink/55">{isExample ? "Exemplo" : "Seu cenário"}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <QuickMoney id="quick-salary" label="Salário CLT" value={salary} onChange={setSalary} tone="clt" />
        <QuickMoney id="quick-benefits" label="Benefícios" value={benefits} onChange={setBenefits} tone="clt" />
        <QuickMoney id="quick-pj" label="Nota PJ" value={pjRate} onChange={setPjRate} tone="pj" />
      </div>

      <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
        {loading ? <Loader2 size={17} className="animate-spin" /> : <Calculator size={17} />}
        {loading ? "Calculando..." : "Calcular"}
      </button>
      {error ? <p className="mt-2 text-sm text-clay">{error}</p> : null}

      <QuickResultView result={result} />

      <Link
        to={`/calculadora?${params.toString()}`}
        className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-mint hover:text-mint-dark"
      >
        Ver a análise completa
        <ArrowRight size={16} />
      </Link>
    </form>
  );
}

function QuickMoney({
  id,
  label,
  value,
  onChange,
  tone,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  tone: "clt" | "pj";
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs">
        <span className={`h-2 w-2 rounded-full ${tone === "clt" ? "bg-clt" : "bg-pj"}`} aria-hidden />
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        className="num font-semibold"
        value={value ? BRL0.format(value) : ""}
        placeholder="R$ 0"
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 0)}
      />
    </div>
  );
}

function QuickResultView({ result }: { result: QuickResult }) {
  const cltAnnual = useCountUp(result.cltAnnual);
  const pjAnnual = useCountUp(result.pjAnnual);
  const breakEven = useCountUp(result.breakEven);
  const recommended = useCountUp(result.recommended);
  const max = Math.max(result.cltAnnual, result.pjAnnual, 1);
  const diff = Math.abs(result.pjAnnual - result.cltAnnual);

  const verdict =
    result.winner === "pj"
      ? { text: "PJ deixa mais no ano", tone: "bg-pj-soft text-pj-ink" }
      : result.winner === "clt"
        ? { text: "CLT deixa mais no ano", tone: "bg-clt-soft text-clt-ink" }
        : { text: "Praticamente empate", tone: "bg-paper text-ink/70" };

  return (
    <div className="mt-5 border-t border-line pt-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span key={verdict.text} className={`badge animate-pop-in ${verdict.tone}`}>
          {verdict.text}
        </span>
        <span className="num text-sm text-ink/55">
          diferença de <strong className="text-ink">{BRL0.format(diff)}</strong>/ano
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <QuickBar label="CLT" value={cltAnnual} width={(result.cltAnnual / max) * 100} bar="bg-clt" text="text-clt-ink" />
        <QuickBar label="PJ" value={pjAnnual} width={(result.pjAnnual / max) * 100} bar="bg-pj" text="text-pj-ink" />
      </div>
      <p className="mt-2 text-xs text-ink/45">Dinheiro disponível no ano, depois de impostos e custos</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-paper p-3.5">
          <p className="text-xs font-medium text-ink/55">PJ para empatar</p>
          <p className="num mt-1 text-lg font-bold">{BRL0.format(breakEven)}</p>
          <p className="text-xs text-ink/45">por mês</p>
        </div>
        <div className="rounded-2xl bg-forest p-3.5 text-white">
          <p className="text-xs font-medium text-white/65">Peça pelo menos</p>
          <p className="num mt-1 text-lg font-bold text-lime">{BRL0.format(recommended)}</p>
          <p className="text-xs text-white/55">com {Math.round(result.margin * 100)}% de margem</p>
        </div>
      </div>
    </div>
  );
}

function QuickBar({
  label,
  value,
  width,
  bar,
  text,
}: {
  label: string;
  value: number;
  width: number;
  bar: string;
  text: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className={`font-semibold ${text}`}>{label}</span>
        <span className="num font-bold">{BRL0.format(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-paper">
        <div
          className={`h-full rounded-full ${bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ProofItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check size={15} className="text-lime" />
      {label}
    </li>
  );
}

/* -------------------------------------------------------------- Personas */

function Personas() {
  const items: Array<{ icon: LucideIcon; title: string; text: string; to: string; tone: string }> = [
    {
      icon: Scale,
      title: "Tenho as duas propostas",
      text: "Veja qual deixa mais dinheiro no ano e por quanto.",
      to: "/calculadora?modo=compare",
      tone: "bg-mint-soft text-mint",
    },
    {
      icon: BriefcaseBusiness,
      title: "Vou negociar como PJ",
      text: "Descubra o valor mínimo da nota e quanto pedir com margem.",
      to: "/calculadora?modo=clt_to_pj",
      tone: "bg-pj-soft text-pj",
    },
    {
      icon: Repeat,
      title: "Sou PJ e recebi uma CLT",
      text: "Saiba quanto a CLT precisa pagar para valer o seu PJ.",
      to: "/calculadora?modo=pj_to_clt",
      tone: "bg-clt-soft text-clt",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <Reveal>
        <SectionHeader eyebrow="Para cada momento" title="Qual é a sua situação?" />
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={item.title} delay={index * 90}>
            <Link
              to={item.to}
              className="card group flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${item.tone}`}>
                <item.icon size={22} />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink/60">{item.text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mint">
                Começar
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Showcase */

function Showcase() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-lime-soft via-white to-mint-soft px-5 py-14 sm:px-10 sm:py-16">
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <p className="eyebrow">O que você leva</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Números prontos para a mesa de negociação.</h2>
          <ul className="mt-7 grid gap-4">
            <ShowcasePoint icon={Scale} title="Veredito claro" text="Qual proposta deixa mais dinheiro no ano, com a diferença em reais." />
            <ShowcasePoint
              icon={Handshake}
              title="Quanto pedir"
              text="O valor da nota para empatar e o valor recomendado com margem de risco."
            />
            <ShowcasePoint
              icon={PiggyBank}
              title="Quanto separar por mês"
              text="Reserva sugerida para férias, 13º e emergência quando você for PJ."
            />
          </ul>
        </Reveal>

        <div ref={ref} className="relative pb-36">
          <BrowserMock inView={inView} />
          <PhoneMock inView={inView} />
        </div>
      </div>
    </section>
  );
}

function ShowcasePoint({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-mint shadow-card">
        <Icon size={19} />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm leading-6 text-ink/60">{text}</span>
      </span>
    </li>
  );
}

function BrowserMock({ inView }: { inView: boolean }) {
  const diff = useCountUp(example.pjAnnual - example.cltAnnual, { start: inView, duration: 1200 });
  const max = Math.max(example.cltAnnual, example.pjAnnual);

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
      <div className="flex items-center gap-1.5 border-b border-line bg-paper/70 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-clay/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-pj/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-mint/60" />
        <span className="ml-3 truncate rounded-full bg-white px-3 py-1 text-[11px] text-ink/45">cltoupj · resultado</span>
      </div>
      <div className="p-5 sm:p-7">
        <div className="rounded-2xl bg-pj-soft p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pj-ink/80">Veredito</p>
          <p className="mt-1 text-xl font-bold text-pj-ink sm:text-2xl">PJ compensa mais</p>
          <p className="num mt-1 text-sm text-pj-ink/80">
            +{BRL0.format(diff)} por ano no cenário de CLT R$ 10 mil x PJ R$ 15 mil
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          <MockBar label="CLT" value={example.cltAnnual} width={(example.cltAnnual / max) * 100} bar="bg-clt" inView={inView} />
          <MockBar label="PJ" value={example.pjAnnual} width={(example.pjAnnual / max) * 100} bar="bg-pj" inView={inView} delay={150} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <MockStat label="PJ para empatar" value={BRL0.format(example.breakEven)} />
          <MockStat label="PJ recomendado" value={BRL0.format(example.recommended)} highlight />
        </div>
      </div>
    </div>
  );
}

function MockBar({
  label,
  value,
  width,
  bar,
  inView,
  delay = 0,
}: {
  label: string;
  value: number;
  width: number;
  bar: string;
  inView: boolean;
  delay?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span className="num">{BRL0.format(value)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-paper">
        <div
          className={`h-full origin-left rounded-full ${bar} ${inView ? "animate-grow-x" : "scale-x-0"}`}
          style={{ width: `${width}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

function MockStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3.5 ${highlight ? "bg-forest text-white" : "bg-paper"}`}>
      <p className={`text-xs ${highlight ? "text-white/65" : "text-ink/55"}`}>{label}</p>
      <p className={`num mt-1 text-lg font-bold ${highlight ? "text-lime" : ""}`}>{value}</p>
    </div>
  );
}

function PhoneMock({ inView }: { inView: boolean }) {
  return (
    <div
      className={`absolute bottom-0 right-3 w-44 rounded-[2rem] border-[6px] border-ink bg-white p-3 shadow-float transition duration-700 sm:-right-4 sm:w-52 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: "250ms" }}
      aria-hidden
    >
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-ink/15" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">PJ por mês</p>
      <p className="num text-lg font-bold">{BRL0.format(example.pjMonthlyNet)}</p>
      <div className="mt-3 grid gap-2 text-[11px]">
        <div className="flex items-center justify-between rounded-xl bg-pj-soft px-2.5 py-2">
          <span className="text-pj-ink">Separar</span>
          <span className="num font-bold text-pj-ink">{BRL0.format(example.pjMonthlyReserve)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-mint-soft px-2.5 py-2">
          <span className="text-mint-dark">Livre</span>
          <span className="num font-bold text-mint-dark">{BRL0.format(example.pjMonthlyFree)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- How it works */

function HowItWorks() {
  const steps = [
    {
      title: "Informe as propostas",
      text: "Salário, benefícios e valor da nota. O resto já vem com padrões de mercado que você pode ajustar.",
    },
    {
      title: "Veja o ano inteiro",
      text: "Somamos 13º, férias, FGTS e PLR do lado CLT e descontamos impostos e custos do lado PJ.",
    },
    {
      title: "Negocie com números",
      text: "Saia com o valor PJ para empatar e o valor recomendado com margem de risco.",
    },
  ];

  return (
    <section id="como-funciona" className="scroll-mt-24 py-16 sm:py-20">
      <Reveal>
        <SectionHeader eyebrow="Como funciona" title="Três passos, menos de dois minutos" />
      </Reveal>
      <ol className="relative grid gap-4 md:grid-cols-3">
        <span
          className="absolute left-[16%] right-[16%] top-[2.65rem] hidden border-t-2 border-dashed border-mint/25 md:block"
          aria-hidden
        />
        {steps.map((step, index) => (
          <Reveal as="li" key={step.title} delay={index * 120} className="card relative p-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-forest font-display text-sm font-bold text-lime ring-8 ring-white">
              {index + 1}
            </span>
            <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ----------------------------------------------------------- What counts */

function WhatCounts() {
  return (
    <section className="py-4 sm:py-8">
      <Reveal>
        <SectionHeader
          eyebrow="O que entra na conta"
          title="Os dois lados medidos com a mesma régua"
          text="A comparação usa o dinheiro disponível no ano inteiro, com tudo o que cada contrato paga e custa."
        />
      </Reveal>
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal>
          <CountCard
            icon={Building2}
            title="CLT"
            header="bg-clt-soft"
            iconTone="bg-clt text-white"
            items={[
              "INSS e IRRF com a tabela de 2026",
              "13º salário e 1/3 de férias líquidos",
              "FGTS e multa de 40% (opcional)",
              "Benefícios, bônus e PLR",
            ]}
          />
        </Reveal>
        <Reveal delay={100}>
          <CountCard
            icon={BriefcaseBusiness}
            title="PJ"
            header="bg-pj-soft"
            iconTone="bg-pj text-white"
            items={[
              "Simples Nacional com Fator R (Anexo III ou V)",
              "INSS e IR sobre o pró-labore",
              "Contador e plano de saúde nos 12 meses",
              "Meses sem faturar e margem de risco",
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

function CountCard({
  icon: Icon,
  title,
  header,
  iconTone,
  items,
}: {
  icon: LucideIcon;
  title: string;
  header: string;
  iconTone: string;
  items: string[];
}) {
  return (
    <div className="card h-full overflow-hidden">
      <div className={`flex items-center gap-3 px-6 py-5 ${header}`}>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${iconTone}`}>
          <Icon size={20} />
        </span>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      <ul className="grid gap-3 p-6 text-sm text-ink/70">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint-soft text-mint">
              <Check size={13} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------- Methodology */

function Methodology() {
  const rules: Array<{ icon: LucideIcon; title: string; text: string }> = [
    { icon: Landmark, title: "INSS 2026", text: "Tabela progressiva do empregado e 11% sobre o pró-labore do PJ." },
    {
      icon: FileText,
      title: "IR 2026 e Lei 15.270/2025",
      text: "Isenção até R$ 5 mil, redução gradual até R$ 7.350 e desconto simplificado de R$ 607,20.",
    },
    {
      icon: PiggyBank,
      title: "FGTS, 13º e férias",
      text: "FGTS de 8%, 13º e 1/3 de férias com tributação própria. A multa de 40% você liga ou desliga.",
    },
    {
      icon: Building2,
      title: "Simples Nacional",
      text: "Anexo III ou V pelo Fator R de 28%, com alíquota efetiva pela faixa de faturamento (LC 123/2006).",
    },
    {
      icon: BookOpenCheck,
      title: "PLR",
      text: "Tabela exclusiva anual, sem INSS e sem FGTS. Os valores da tabela ainda estão em conferência.",
    },
    {
      icon: ShieldCheck,
      title: "Margem de risco",
      text: "10% a 30% sobre o valor de empate, conforme aviso prévio, pausa remunerada e exclusividade.",
    },
  ];

  return (
    <section id="como-calculamos" className="scroll-mt-24 py-16 sm:py-20">
      <div className="overflow-hidden rounded-4xl bg-forest px-5 py-12 text-white sm:px-10 sm:py-14">
        <Reveal>
          <p className="eyebrow text-lime">Como calculamos</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            Regras públicas, aplicadas do mesmo jeito para todo mundo.
          </h2>
          <p className="mt-4 max-w-2xl text-white/70">
            Cada resultado mostra as premissas usadas e o passo a passo da conta. Revisamos as tabelas todo início de ano.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule, index) => (
            <Reveal
              key={rule.title}
              delay={index * 60}
              className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:bg-white/10"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime text-forest-deep">
                <rule.icon size={18} />
              </span>
              <h3 className="mt-4 font-semibold">{rule.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-white/65">{rule.text}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-xs text-white/45">
          Simulação educativa. Antes de abrir empresa ou assinar contrato, confirme com um contador.
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Pricing */

function Pricing() {
  return (
    <section id="precos" className="scroll-mt-24 py-4 sm:py-8">
      <Reveal>
        <SectionHeader eyebrow="Quanto custa" title="Simular é grátis" text="Crie uma conta, também grátis, se quiser guardar suas simulações." />
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal>
          <PlanCard
            name="Sem cadastro"
            price="R$ 0"
            description="Para tirar a dúvida de uma proposta agora."
            features={["Comparação CLT x PJ", "Quanto pedir como PJ", "Quanto vale em CLT", "Detalhamento da conta"]}
            action={
              <Link to="/calculadora" className="btn-secondary w-full">
                Simular agora
              </Link>
            }
          />
        </Reveal>
        <Reveal delay={90}>
          <PlanCard
            name="Conta grátis"
            price="R$ 0"
            description="Para quem está negociando mais de uma proposta."
            features={["Tudo do sem cadastro", "Histórico das simulações", "Compare propostas ao longo do tempo"]}
            highlight
            action={
              <Link to="/cadastro" className="btn-primary w-full">
                Criar conta grátis
                <ArrowRight size={17} />
              </Link>
            }
          />
        </Reveal>
        <Reveal delay={180}>
          <PlanCard
            name="Análise com IA"
            description="Perguntas em chat e checklist de pontos do contrato para levar ao seu advogado."
            features={["Chat sobre CLT e PJ", "Checklist do contrato PJ", "Alertas e próximos passos"]}
            locked
            action={
              <button type="button" className="btn w-full cursor-not-allowed border border-line bg-paper text-ink/45" disabled>
                <Lock size={16} />
                Em breve
              </button>
            }
          />
        </Reveal>
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  description,
  features,
  action,
  highlight = false,
  locked = false,
}: {
  name: string;
  price?: string;
  description: string;
  features: string[];
  action: ReactNode;
  highlight?: boolean;
  locked?: boolean;
}) {
  return (
    <article
      className={`card relative flex h-full flex-col p-6 transition duration-300 ${
        highlight ? "border-2 border-mint shadow-lift lg:-translate-y-2" : "hover:-translate-y-1 hover:shadow-lift"
      } ${locked ? "bg-white/60" : ""}`}
    >
      <h3 className={`text-lg font-semibold ${locked ? "text-ink/55" : ""}`}>{name}</h3>
      {price ? (
        <p className="num mt-3 font-display text-4xl font-bold">{price}</p>
      ) : (
        <p className="mt-3 font-display text-2xl font-bold text-ink/40">Em breve</p>
      )}
      <p className="mt-3 text-sm leading-6 text-ink/60">{description}</p>
      <ul className={`mt-5 grid flex-1 content-start gap-2.5 text-sm ${locked ? "text-ink/45" : "text-ink/70"}`}>
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check size={17} className={`mt-0.5 shrink-0 ${locked ? "text-ink/30" : "text-mint"}`} />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6">{action}</div>
    </article>
  );
}

/* ------------------------------------------------------------------- FAQ */

const faqItems = [
  {
    q: "É grátis mesmo?",
    a: "Sim. A simulação não pede cadastro. A conta, também grátis, serve só para guardar o histórico das suas simulações.",
  },
  {
    q: "Os números são confiáveis?",
    a: "Usamos as tabelas de INSS e IR de 2026, incluindo a isenção até R$ 5 mil da Lei 15.270/2025, e o Simples Nacional com Fator R. É uma estimativa: antes de abrir empresa ou assinar, confirme com um contador.",
  },
  {
    q: "Por que o PJ precisa ganhar mais que o salário CLT?",
    a: "Porque o CLT recebe 13º, férias com 1/3 e FGTS, que não aparecem no salário do mês. O PJ também paga impostos da empresa, contador e plano de saúde.",
  },
  {
    q: "O que é a margem de risco?",
    a: "Um valor acima do empate para compensar o que o PJ perde: aviso prévio, seguro-desemprego e estabilidade. Ela fica entre 10% e 30%, conforme o contrato.",
  },
  {
    q: "Minhas simulações ficam salvas?",
    a: "Só quando você está logado, para montar seu histórico. Simulações sem login não são gravadas.",
  },
];

function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="py-16 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionHeader eyebrow="Perguntas frequentes" title="Antes de você perguntar" />
        </Reveal>
        <div className="grid gap-3">
          {faqItems.map((item, index) => (
            <Reveal key={item.q} delay={index * 60}>
              <details className="card group p-5 transition open:shadow-lift">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                  {item.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper transition group-open:rotate-180 group-open:bg-mint-soft group-open:text-mint">
                    <ChevronDown size={17} />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-ink/65">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Final CTA */

function FinalCta() {
  return (
    <section className="px-2 sm:px-4">
      <div className="relative isolate overflow-hidden rounded-4xl bg-forest-deep px-6 pb-36 pt-14 text-center text-white sm:rounded-5xl sm:px-12 sm:pb-40 sm:pt-16">
        <HillsArt className="absolute inset-x-0 bottom-0 -z-10 h-[55%] w-full" />
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            Leve números para a negociação.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Em menos de dois minutos você sabe quanto pedir e qual proposta rende mais no ano.
          </p>
          <Link to="/calculadora" className="btn-lime btn-lg mt-8">
            Fazer minha simulação
            <ArrowRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {text ? <p className="mt-3 text-ink/60">{text}</p> : null}
    </div>
  );
}
