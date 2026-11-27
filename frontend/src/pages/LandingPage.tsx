import { ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { compareContracts } from "../lib/api";
import { quickCLT, quickPJ } from "../lib/defaults";
import { EXAMPLE as example } from "../lib/example";
import { useCountUp } from "../lib/motion";

const BRL0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function LandingPage() {
  return (
    <div>
      <Hero />
      <div className="mx-auto max-w-6xl px-4">
        <Situations />
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
    <section className="ruled-dark text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20 lg:pt-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-lime">Regras de 2026 · isenção de IR até R$ 5 mil</p>
          <h1 className="mt-4 text-[2.5rem] leading-[1.05] sm:text-[3.4rem] lg:text-[3.9rem]">
            Não aceite a proposta PJ antes de fazer <em className="font-normal text-lime">essa conta</em>.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
            Coloque o salário CLT e o valor da nota. Em segundos você vê qual deixa mais dinheiro no ano e quanto pedir
            para a troca valer a pena.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/calculadora" className="btn-lime btn-lg">
              Fazer a conta completa
              <ArrowRight size={18} aria-hidden />
            </Link>
            <a href="#como-funciona" className="btn btn-lg text-white/85 underline-offset-4 hover:text-white hover:underline">
              Como funciona
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
            <ProofItem label="Grátis e sem cadastro" />
            <ProofItem label="Tabelas de 2026" />
            <ProofItem label="Conta aberta, linha a linha" />
          </ul>
        </div>

        <MiniSimulator />
      </div>
    </section>
  );
}

function ProofItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check size={15} className="text-lime" aria-hidden />
      {label}
    </li>
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
    <form onSubmit={handleSubmit} className="rounded-xl bg-white p-5 text-ink shadow-overlay sm:p-6" aria-label="Simulação rápida">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-base font-semibold tracking-normal">Simule agora</h2>
        <span className="badge bg-paper text-muted">{isExample ? "Exemplo" : "Seu cenário"}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <QuickMoney id="quick-salary" label="Salário CLT" value={salary} onChange={setSalary} tone="clt" />
        <QuickMoney id="quick-benefits" label="Benefícios" value={benefits} onChange={setBenefits} tone="clt" />
        <QuickMoney id="quick-pj" label="Nota PJ" value={pjRate} onChange={setPjRate} tone="pj" />
      </div>

      <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
        {loading ? <Loader2 size={17} className="animate-spin" aria-hidden /> : null}
        {loading ? "Calculando..." : "Calcular"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-clay" role="alert">
          {error}
        </p>
      ) : null}

      <QuickResultView result={result} />

      <Link
        to={`/calculadora?${params.toString()}`}
        className="mt-4 flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-md text-sm font-semibold text-mint hover:text-mint-dark"
      >
        Ver a conta completa
        <ArrowRight size={16} aria-hidden />
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
        autoComplete="off"
        className="num font-semibold"
        value={value ? BRL0.format(value) : ""}
        placeholder="R$ 0"
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 0)}
      />
    </div>
  );
}

function QuickResultView({ result }: { result: QuickResult }) {
  const cltAnnual = useCountUp(result.cltAnnual, { duration: 450 });
  const pjAnnual = useCountUp(result.pjAnnual, { duration: 450 });
  const breakEven = useCountUp(result.breakEven, { duration: 450 });
  const recommended = useCountUp(result.recommended, { duration: 450 });
  const max = Math.max(result.cltAnnual, result.pjAnnual, 1);
  const diff = Math.abs(result.pjAnnual - result.cltAnnual);

  const verdict =
    result.winner === "pj"
      ? { text: "PJ deixa mais no ano", tone: "text-pj-ink" }
      : result.winner === "clt"
        ? { text: "CLT deixa mais no ano", tone: "text-clt-ink" }
        : { text: "Praticamente empate", tone: "text-ink" };

  return (
    <div className="mt-5 border-t border-line pt-4" aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className={`font-display text-lg font-semibold ${verdict.tone}`}>{verdict.text}</p>
        <p className="num text-sm text-muted">
          diferença de <strong className="text-ink">{BRL0.format(diff)}</strong> no ano
        </p>
      </div>

      <div className="mt-3 grid gap-2.5">
        <QuickBar label="CLT" value={cltAnnual} width={(result.cltAnnual / max) * 100} bar="bg-clt" text="text-clt-ink" />
        <QuickBar label="PJ" value={pjAnnual} width={(result.pjAnnual / max) * 100} bar="bg-pj" text="text-pj-ink" />
      </div>
      <p className="mt-2 text-xs text-subtle">Dinheiro disponível no ano, depois de impostos e custos</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-line bg-paper/60 p-3">
          <p className="text-xs font-medium text-muted">PJ para empatar</p>
          <p className="num mt-0.5 font-display text-xl font-semibold">{BRL0.format(breakEven)}</p>
          <p className="text-xs text-subtle">por mês</p>
        </div>
        <div className="rounded-lg bg-forest p-3 text-white">
          <p className="text-xs font-medium text-white/75">Peça pelo menos</p>
          <p className="num mt-0.5 font-display text-xl font-semibold text-lime">{BRL0.format(recommended)}</p>
          <p className="text-xs text-white/70">com {Math.round(result.margin * 100)}% de margem</p>
        </div>
      </div>
    </div>
  );
}

function QuickBar({ label, value, width, bar, text }: { label: string; value: number; width: number; bar: string; text: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className={`font-semibold ${text}`}>{label}</span>
        <span className="num font-semibold">{BRL0.format(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-paper">
        <div className={`h-full rounded-sm ${bar} transition-[width] duration-500 ease-out`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Situations */

function Situations() {
  const items: Array<{ title: string; text: string; to: string; rule: string }> = [
    {
      title: "Tenho as duas propostas",
      text: "Veja qual deixa mais dinheiro no ano e por quanto.",
      to: "/calculadora?modo=compare",
      rule: "before:bg-mint",
    },
    {
      title: "Vou negociar como PJ",
      text: "Descubra o valor mínimo da nota e quanto pedir com margem.",
      to: "/calculadora?modo=clt_to_pj",
      rule: "before:bg-pj",
    },
    {
      title: "Sou PJ e recebi uma CLT",
      text: "Saiba quanto a CLT precisa pagar para valer o seu PJ.",
      to: "/calculadora?modo=pj_to_clt",
      rule: "before:bg-clt",
    },
  ];

  return (
    <section className="py-14 sm:py-20" aria-labelledby="situacao">
      <SectionHeader id="situacao" eyebrow="Por onde começar" title="Qual é a sua situação?" />
      <ul className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.title}>
            <Link
              to={item.to}
              className={`card group relative flex h-full flex-col p-5 transition-colors duration-fast before:absolute before:inset-x-5 before:top-0 before:h-[3px] before:rounded-b before:content-[''] hover:border-ink/25 ${item.rule}`}
            >
              <h3 className="text-lg">{item.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-6 text-muted">{item.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint">
                Começar
                <ArrowRight size={16} className="transition-transform duration-fast group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
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
      text: "Saia com o valor para empatar, o valor recomendado com margem de risco e quanto separar por mês.",
    },
  ];

  return (
    <section id="como-funciona" className="scroll-mt-20 border-t border-line py-14 sm:py-20" aria-labelledby="como-funciona-titulo">
      <SectionHeader id="como-funciona-titulo" eyebrow="Como funciona" title="Três passos, menos de dois minutos" />
      <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
        {steps.map((step, index) => (
          <li key={step.title} className="border-t border-ink/80 pt-4">
            <span className="num font-display text-3xl font-semibold text-mint">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-2 text-lg">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ----------------------------------------------------------- What counts */

function WhatCounts() {
  return (
    <section className="border-t border-line py-14 sm:py-20" aria-labelledby="o-que-entra">
      <SectionHeader
        id="o-que-entra"
        eyebrow="O que entra na conta"
        title="Os dois lados medidos com a mesma régua"
        text="A comparação usa o dinheiro disponível no ano inteiro, com tudo o que cada contrato paga e custa."
      />
      <div className="grid gap-3 md:grid-cols-2">
        <CountColumn
          side="clt"
          title="CLT"
          items={[
            "INSS e IRRF com a tabela de 2026",
            "13º salário e 1/3 de férias líquidos",
            "FGTS e multa de 40% (opcional)",
            "Benefícios, bônus e PLR",
          ]}
        />
        <CountColumn
          side="pj"
          title="PJ"
          items={[
            "Simples Nacional com Fator R (Anexo III ou V)",
            "INSS e IR sobre o pró-labore",
            "Contador e plano de saúde nos 12 meses",
            "Meses sem faturar e margem de risco",
          ]}
        />
      </div>
    </section>
  );
}

function CountColumn({ side, title, items }: { side: "clt" | "pj"; title: string; items: string[] }) {
  const tone = side === "clt" ? { rule: "border-t-clt", text: "text-clt-ink", icon: "text-clt" } : { rule: "border-t-pj", text: "text-pj-ink", icon: "text-pj" };
  return (
    <div className={`card border-t-[3px] p-5 sm:p-6 ${tone.rule}`}>
      <h3 className={`font-display text-2xl ${tone.text}`}>{title}</h3>
      <ul className="mt-3 divide-y divide-line text-[0.9375rem] text-ink">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 py-2.5">
            <Check size={16} className={`mt-1 shrink-0 ${tone.icon}`} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------- Methodology */

function Methodology() {
  const rules: Array<{ title: string; text: string }> = [
    { title: "INSS 2026", text: "Tabela progressiva do empregado e 11% sobre o pró-labore do PJ." },
    {
      title: "IR 2026 e Lei 15.270/2025",
      text: "Isenção até R$ 5 mil, redução gradual até R$ 7.350 e desconto simplificado de R$ 607,20.",
    },
    {
      title: "FGTS, 13º e férias",
      text: "FGTS de 8%, 13º e 1/3 de férias com tributação própria. A multa de 40% você liga ou desliga.",
    },
    {
      title: "Simples Nacional",
      text: "Anexo III ou V pelo Fator R de 28%, com alíquota efetiva pela faixa de faturamento (LC 123/2006).",
    },
    { title: "PLR", text: "Tabela exclusiva anual, sem INSS e sem FGTS. Os valores da tabela ainda estão em conferência." },
    {
      title: "Margem de risco",
      text: "10% a 30% sobre o valor de empate, conforme aviso prévio, pausa remunerada e exclusividade.",
    },
  ];

  return (
    <section id="como-calculamos" className="scroll-mt-20 border-t border-line py-14 sm:py-20" aria-labelledby="como-calculamos-titulo">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionHeader
            id="como-calculamos-titulo"
            eyebrow="Como calculamos"
            title="Regras públicas, aplicadas do mesmo jeito para todo mundo"
            text="Cada resultado mostra as premissas usadas e a conta linha a linha."
          />
          <p className="-mt-4 text-sm text-subtle">
            Simulação educativa. Antes de abrir empresa ou assinar contrato, confirme com um contador.
          </p>
        </div>
        <dl className="grid gap-x-10 sm:grid-cols-2">
          {rules.map((rule) => (
            <div key={rule.title} className="border-t border-line py-4">
              <dt className="font-semibold">{rule.title}</dt>
              <dd className="mt-1 text-sm leading-6 text-muted">{rule.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Pricing */

function Pricing() {
  return (
    <section id="precos" className="scroll-mt-20 border-t border-line py-14 sm:py-20" aria-labelledby="precos-titulo">
      <SectionHeader
        id="precos-titulo"
        eyebrow="Quanto custa"
        title="Simular é grátis"
        text="Crie uma conta, também grátis, se quiser guardar suas simulações."
      />
      <div className="grid max-w-4xl gap-3 md:grid-cols-2">
        <PlanCard
          name="Sem cadastro"
          price="R$ 0"
          description="Para tirar a dúvida de uma proposta agora."
          features={["Comparação CLT x PJ", "Quanto pedir como PJ", "Quanto vale em CLT", "Conta completa, linha a linha"]}
          action={
            <Link to="/calculadora" className="btn-secondary w-full">
              Simular agora
            </Link>
          }
        />
        <PlanCard
          name="Conta grátis"
          price="R$ 0"
          description="Para quem está negociando mais de uma proposta."
          features={["Tudo do sem cadastro", "Histórico das simulações", "Reabrir uma simulação na calculadora"]}
          highlight
          action={
            <Link to="/cadastro" className="btn-primary w-full">
              Criar conta grátis
              <ArrowRight size={17} aria-hidden />
            </Link>
          }
        />
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
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  action: ReactNode;
  highlight?: boolean;
}) {
  return (
    <article className={`card flex h-full flex-col p-5 sm:p-6 ${highlight ? "border-mint ring-1 ring-mint" : ""}`}>
      <h3 className="text-base">{name}</h3>
      <p className="num mt-2 font-display text-4xl font-semibold">{price}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <ul className="mt-4 grid flex-1 content-start gap-2 text-sm text-ink">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-mint" aria-hidden />
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
    <section className="border-t border-line py-14 sm:py-20" aria-labelledby="faq-titulo">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <SectionHeader id="faq-titulo" eyebrow="Perguntas frequentes" title="Antes de você perguntar" />
        <div className="border-t border-line">
          {faqItems.map((item) => (
            <details key={item.q} className="group border-b border-line">
              <summary className="flex min-h-[3.25rem] cursor-pointer items-center justify-between gap-4 py-3 font-semibold hover:text-mint-dark">
                {item.q}
                <ChevronDown size={18} className="shrink-0 text-subtle transition-transform duration-base group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-4 pr-8 text-[0.9375rem] leading-7 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Final CTA */

function FinalCta() {
  return (
    <section className="ruled-dark text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:py-14 md:flex-row md:items-center">
        <div>
          <h2 className="text-[1.9rem] leading-tight sm:text-[2.3rem]">Leve números para a negociação.</h2>
          <p className="mt-2 max-w-xl text-white/80">
            Em menos de dois minutos você sabe quanto pedir e qual proposta rende mais no ano.
          </p>
        </div>
        <Link to="/calculadora" className="btn-lime btn-lg shrink-0">
          Fazer minha simulação
          <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function SectionHeader({ id, eyebrow, title, text }: { id?: string; eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-[1.9rem] leading-tight sm:text-[2.4rem]">
        {title}
      </h2>
      {text ? <p className="mt-3 text-muted">{text}</p> : null}
    </div>
  );
}
