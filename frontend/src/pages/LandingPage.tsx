import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CreditCard,
  Lock,
  Scale,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const checkoutUrl = import.meta.env.VITE_BASIC_PLAN_CHECKOUT_URL as string | undefined;

const activePlanTarget = checkoutUrl?.trim() || "/calculadora";

// Resultado do motor mvp-2 com os valores que ja vem preenchidos na calculadora.
const example = {
  cltAnnual: 126101,
  pjAnnual: 152256,
  breakEven: 12681,
  recommended: 14076,
};

const BRL0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function LandingPage() {
  return (
    <div className="-mt-2">
      <Hero />
      <HowItWorks />
      <WhatCounts />
      <Plans />
      <Faq />
      <FinalCta />
    </div>
  );
}

function Hero() {
  return (
    <section className="grid items-center gap-10 pb-16 pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:pt-10">
      <div className="max-w-2xl">
        <span className="badge bg-mint-soft text-mint-dark">
          <Sparkles size={14} />
          Atualizado com a isenção de IR até R$ 5 mil
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
          Recebeu uma proposta PJ? Descubra se ela{" "}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10">vale a pena</span>
            <span className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded bg-lime/80" aria-hidden />
          </span>
          .
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink/65">
          Compare CLT e PJ pelo dinheiro que sobra no ano: impostos, 13º, férias, FGTS, Simples Nacional e o risco de
          ficar sem proteção trabalhista.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/calculadora" className="btn-primary btn-lg">
            Comparar minhas propostas
            <ArrowRight size={18} />
          </Link>
          <a href="#como-funciona" className="btn-secondary btn-lg">
            Como funciona
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/60">
          <ProofItem label="Grátis e sem cadastro" />
          <ProofItem label="Regras de 2026" />
          <ProofItem label="Conta aberta, sem caixa-preta" />
        </ul>
      </div>

      <ExampleCard />
    </section>
  );
}

function ExampleCard() {
  const max = Math.max(example.cltAnnual, example.pjAnnual);

  return (
    <div className="card relative p-6 shadow-lift">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Exemplo real do simulador</p>
          <h2 className="mt-1 text-xl font-bold">CLT R$ 10 mil x PJ R$ 15 mil</h2>
        </div>
        <span className="badge bg-pj-soft text-pj-ink">PJ compensa</span>
      </div>

      <div className="mt-6 grid gap-4">
        <Bar label="CLT" value={example.cltAnnual} max={max} bar="bg-clt" text="text-clt-ink" />
        <Bar label="PJ" value={example.pjAnnual} max={max} bar="bg-pj" text="text-pj-ink" />
      </div>
      <p className="mt-2 text-xs text-ink/45">Pacote anual disponível, depois de impostos e custos</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line p-3.5">
          <p className="text-xs font-medium text-ink/55">PJ para empatar</p>
          <p className="num mt-1 text-lg font-bold">{BRL0.format(example.breakEven)}</p>
          <p className="text-xs text-ink/45">por mês</p>
        </div>
        <div className="rounded-xl border border-mint/30 bg-mint-soft p-3.5">
          <p className="text-xs font-medium text-ink/55">PJ recomendado</p>
          <p className="num mt-1 text-lg font-bold text-mint-dark">{BRL0.format(example.recommended)}</p>
          <p className="text-xs text-ink/45">com 11% de margem de risco</p>
        </div>
      </div>

      <details className="group mt-5 border-t border-line pt-4 text-xs leading-5 text-ink/55">
        <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink/65">
          Ver premissas do exemplo
          <ChevronDown size={16} className="transition group-open:rotate-180" />
        </summary>
        <p className="mt-2">
          CLT de R$ 10.000 brutos + R$ 1.000 em benefícios, com 13º, férias + 1/3, FGTS e multa de 40%. PJ de R$ 15.000 no
          Simples Anexo III (Fator R 28%, pró-labore de R$ 4.200), contador R$ 250, plano de saúde R$ 700, 12 meses
          faturados, aviso de 30 dias, pausa remunerada e outros clientes permitidos. São os valores que já vêm na
          calculadora.
        </p>
      </details>
    </div>
  );
}

function Bar({ label, value, max, bar, text }: { label: string; value: number; max: number; bar: string; text: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className={`font-semibold ${text}`}>{label}</span>
        <span className="num text-base font-bold">{BRL0.format(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-paper">
        <div className={`h-3 rounded-full ${bar}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Informe as propostas",
      text: "Salário, benefícios e valor da nota. O resto já vem com padrões de mercado que você pode ajustar.",
    },
    {
      title: "Veja o pacote anual",
      text: "Somamos 13º, férias, FGTS e PLR do lado CLT e descontamos impostos e custos do lado PJ.",
    },
    {
      title: "Negocie com números",
      text: "Saia com o valor PJ para empatar e o valor recomendado com margem de risco.",
    },
  ];

  return (
    <section id="como-funciona" className="scroll-mt-24 border-t border-line py-16">
      <SectionHeader eyebrow="Como funciona" title="Três passos até uma resposta clara" />
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="card p-6">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-sm font-bold text-lime">
              {index + 1}
            </span>
            <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WhatCounts() {
  return (
    <section className="border-t border-line py-16">
      <SectionHeader
        eyebrow="O que entra na conta"
        title="Os dois lados medidos com a mesma régua"
        text="A comparação usa o dinheiro disponível no ano, não só o líquido de um mês."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <CountCard
          icon={Building2}
          title="CLT"
          tone="bg-clt-soft text-clt"
          items={[
            "INSS e IRRF com a tabela de 2026",
            "13º salário e 1/3 de férias líquidos",
            "FGTS e multa de 40% (opcional)",
            "Benefícios, bônus e PLR",
          ]}
        />
        <CountCard
          icon={BriefcaseBusiness}
          title="PJ"
          tone="bg-pj-soft text-pj"
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

function CountCard({ icon: Icon, title, tone, items }: { icon: LucideIcon; title: string; tone: string; items: string[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
          <Icon size={20} />
        </span>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <ul className="mt-5 grid gap-3 text-sm text-ink/70">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check size={17} className="mt-0.5 shrink-0 text-mint" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Plans() {
  return (
    <section id="planos" className="scroll-mt-24 border-t border-line py-16">
      <SectionHeader eyebrow="Planos" title="Comece grátis, assine quando precisar de mais" />
      <div className="grid gap-4 lg:grid-cols-3">
        <PlanCard
          name="Grátis"
          price="R$ 0"
          description="Para tirar a dúvida de uma proposta agora."
          features={["Comparação CLT x PJ", "Quanto pedir como PJ", "Quanto vale em CLT", "Sem cadastro"]}
          action={
            <Link to="/calculadora" className="btn-secondary w-full">
              Usar agora
            </Link>
          }
        />
        <PlanCard
          name="Essencial"
          price="R$ 19"
          period="/mês"
          description="Para quem está negociando e quer comparar várias propostas."
          features={["Cálculos e comparações extras", "Detalhamento anual da decisão", "Histórico das simulações"]}
          highlight
          action={
            checkoutUrl ? (
              <a href={activePlanTarget} className="btn-primary w-full">
                Assinar Essencial
                <CreditCard size={17} />
              </a>
            ) : (
              <Link to={activePlanTarget} className="btn-primary w-full">
                Começar pelo Essencial
                <ArrowRight size={17} />
              </Link>
            )
          }
        />
        <PlanCard
          name="IA"
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
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  features,
  action,
  highlight = false,
  locked = false,
}: {
  name: string;
  price?: string;
  period?: string;
  description: string;
  features: string[];
  action: ReactNode;
  highlight?: boolean;
  locked?: boolean;
}) {
  return (
    <article
      className={`card relative flex flex-col p-6 ${highlight ? "border-2 border-mint shadow-lift" : ""} ${
        locked ? "bg-white/60" : ""
      }`}
    >
      {highlight ? <span className="badge absolute -top-3 left-6 bg-mint text-white">Recomendado</span> : null}
      <h3 className={`text-lg font-bold ${locked ? "text-ink/55" : ""}`}>{name}</h3>
      {price ? (
        <p className="mt-3 flex items-end gap-1">
          <span className="num font-display text-4xl font-extrabold">{price}</span>
          {period ? <span className="pb-1 text-sm text-ink/45">{period}</span> : null}
        </p>
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

function Faq() {
  const items = [
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

  return (
    <section className="border-t border-line py-16">
      <SectionHeader eyebrow="Perguntas frequentes" title="Antes de você perguntar" />
      <div className="mx-auto grid max-w-3xl gap-3">
        {items.map((item) => (
          <details key={item.q} className="card group p-5">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
              {item.q}
              <ChevronDown size={18} className="shrink-0 text-ink/45 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-6 text-ink/65">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mb-4 overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center text-white sm:px-12">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-lime text-ink">
        <Calculator size={22} />
      </span>
      <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold sm:text-4xl">Leve números para a negociação</h2>
      <p className="mx-auto mt-3 max-w-xl text-white/65">
        Em menos de dois minutos você sabe quanto pedir e qual proposta rende mais no ano.
      </p>
      <Link to="/calculadora" className="btn btn-lg mt-8 bg-lime text-ink hover:bg-lime/85">
        Fazer minha simulação
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold">{title}</h2>
      {text ? <p className="mt-3 text-ink/60">{text}</p> : null}
    </div>
  );
}

function ProofItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2">
      <Scale size={15} className="text-mint" />
      {label}
    </li>
  );
}
