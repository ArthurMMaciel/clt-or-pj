import {
  ArrowLeftRight,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Info,
  Loader2,
  Scale,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

import {
  cltToPj,
  compareContracts,
  pjToClt,
  type CLTPayload,
  type CompareResult,
  type EquivalentResult,
  type PJPayload,
} from "../lib/api";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const BRL0 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const PERCENT = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

type CalculatorMode = "compare" | "clt_to_pj" | "pj_to_clt";

type ResultState =
  | { mode: "compare"; data: CompareResult }
  | { mode: "clt_to_pj"; data: EquivalentResult }
  | { mode: "pj_to_clt"; data: EquivalentResult };

const modes: Array<{
  mode: CalculatorMode;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  { mode: "compare", label: "Comparar propostas", description: "Tenho uma CLT e uma PJ", icon: Scale },
  { mode: "clt_to_pj", label: "Quanto pedir como PJ", description: "Tenho só a proposta CLT", icon: ArrowLeftRight },
  { mode: "pj_to_clt", label: "Quanto vale em CLT", description: "Tenho só a proposta PJ", icon: ArrowLeftRight },
];

export function CalculatorPage() {
  const [mode, setMode] = useState<CalculatorMode>("compare");
  const [result, setResult] = useState<ResultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  function selectMode(nextMode: CalculatorMode) {
    setMode(nextMode);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      if (mode === "compare") {
        const data = await compareContracts({
          clt: readCLT(form),
          pj: readPJ(form),
        });
        setResult({ mode, data });
      }

      if (mode === "clt_to_pj") {
        const data = await cltToPj({
          clt: readCLT(form),
          pj: defaultPJAssumptions(),
        });
        setResult({ mode, data });
      }

      if (mode === "pj_to_clt") {
        const data = await pjToClt({
          pj: readPJ(form),
        });
        setResult({ mode, data });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
      // No celular o resultado fica abaixo do formulario.
      if (window.innerWidth < 1024) {
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    }
  }

  const showCLT = mode === "compare" || mode === "clt_to_pj";
  const showPJ = mode === "compare" || mode === "pj_to_clt";

  return (
    <div>
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow">Simulador CLT x PJ · regras 2026</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
          Compare pelo pacote anual, não só pelo líquido do mês
        </h1>
        <p className="mt-3 text-ink/65">
          Impostos, 13º, férias, FGTS, PLR, Simples Nacional e margem de risco entram na conta. Os campos já vêm com um
          exemplo preenchido: troque pelos números da sua proposta.
        </p>
      </div>

      <div role="tablist" aria-label="Tipo de simulação" className="mb-6 grid gap-2 sm:grid-cols-3">
        {modes.map((item) => {
          const active = mode === item.mode;
          const Icon = item.icon;
          return (
            <button
              key={item.mode}
              type="button"
              role="tab"
              aria-selected={active}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                active
                  ? "border-mint bg-white shadow-card ring-4 ring-mint/10"
                  : "border-line bg-white/60 hover:border-ink/20 hover:bg-white"
              }`}
              onClick={() => selectMode(item.mode)}
            >
              <span
                className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                  active ? "bg-mint text-white" : "bg-paper text-ink/55"
                }`}
              >
                <Icon size={17} />
              </span>
              <span>
                <span className={`block text-sm font-semibold ${active ? "text-ink" : "text-ink/75"}`}>{item.label}</span>
                <span className="block text-xs text-ink/50">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="grid content-start gap-5">
          {showCLT && <CLTFields />}
          {showPJ && <PJFields />}
          {mode === "clt_to_pj" ? (
            <p className="flex gap-2 rounded-xl border border-line bg-white p-4 text-sm text-ink/65">
              <Info size={18} className="mt-0.5 shrink-0 text-ink/40" />
              Para o lado PJ usamos premissas padrão: Simples Nacional com Fator R, contador de R$ 250, plano de saúde de
              R$ 700, 12 meses faturados e margem de risco média.
            </p>
          ) : null}

          <button type="submit" className="btn-primary btn-lg w-full sm:w-fit" disabled={isLoading}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <TrendingUp size={18} />}
            {isLoading ? "Calculando..." : submitLabel(mode)}
          </button>
        </form>

        <aside ref={resultRef} className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <ResultPanel mode={mode} result={result} error={error} />
        </aside>
      </div>
    </div>
  );
}

function readCLT(form: FormData): CLTPayload {
  return {
    grossSalary: number(form, "cltGrossSalary"),
    monthlyBenefits: number(form, "cltMonthlyBenefits"),
    monthlyTaxableBenefits: number(form, "cltMonthlyTaxableBenefits"),
    monthlyDiscounts: number(form, "cltMonthlyDiscounts"),
    annualBonus: number(form, "cltAnnualBonus"),
    annualPlr: number(form, "cltAnnualPlr"),
    dependents: number(form, "cltDependents"),
    includeFgts: form.has("includeFgts"),
    includeThirteenth: form.has("includeThirteenth"),
    includeVacation: form.has("includeVacation"),
    includeTerminationProtection: form.has("includeTerminationProtection"),
  };
}

function readPJ(form: FormData): PJPayload {
  return {
    monthlyRate: number(form, "pjMonthlyRate"),
    taxRegime: text(form, "pjTaxRegime"),
    effectiveTaxRate: number(form, "pjEffectiveTaxRate") / 100,
    grossRevenueLast12Months: number(form, "pjGrossRevenueLast12Months"),
    payrollLast12Months: number(form, "pjPayrollLast12Months"),
    proLabore: number(form, "pjProLabore"),
    proLaboreRate: number(form, "pjProLaboreRate") / 100,
    paidMonthsPerYear: number(form, "pjPaidMonthsPerYear"),
    monthlyAccountingCost: number(form, "pjMonthlyAccountingCost"),
    monthlyHealthPlanCost: number(form, "pjMonthlyHealthPlanCost"),
    otherMonthlyCosts: number(form, "pjOtherMonthlyCosts"),
    vacationReserveRate: number(form, "pjVacationReserveRate") / 100,
    thirteenthReserveRate: number(form, "pjThirteenthReserveRate") / 100,
    fgtsReserveRate: number(form, "pjFgtsReserveRate") / 100,
    emergencyReserveRate: number(form, "pjEmergencyReserveRate") / 100,
    contractRisk: text(form, "pjContractRisk"),
    noticeDays: number(form, "pjNoticeDays"),
    hasPaidVacation: form.has("pjHasPaidVacation"),
    allowsOtherClients: form.has("pjAllowsOtherClients"),
    requiresExclusivity: form.has("pjRequiresExclusivity"),
  };
}

function defaultPJAssumptions(): PJPayload {
  return {
    monthlyRate: 1,
    taxRegime: "auto",
    effectiveTaxRate: 0.06,
    grossRevenueLast12Months: 0,
    payrollLast12Months: 0,
    proLabore: 0,
    proLaboreRate: 0.28,
    paidMonthsPerYear: 12,
    monthlyAccountingCost: 250,
    monthlyHealthPlanCost: 700,
    otherMonthlyCosts: 0,
    vacationReserveRate: 0.0833,
    thirteenthReserveRate: 0.0833,
    fgtsReserveRate: 0.08,
    emergencyReserveRate: 0.1,
    contractRisk: "medium",
    noticeDays: 30,
    hasPaidVacation: false,
    allowsOtherClients: true,
    requiresExclusivity: false,
  };
}

function CLTFields() {
  return (
    <FormSection side="clt" title="Proposta CLT" icon={Building2}>
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="cltGrossSalary" label="Salário bruto mensal" defaultValue="10000" />
        <MoneyField
          name="cltMonthlyBenefits"
          label="Benefícios por mês"
          hint="VR, VA, auxílio home office e similares."
          defaultValue="1000"
        />
        <MoneyField name="cltAnnualBonus" label="Bônus anual" hint="Tributado como salário." defaultValue="0" />
        <MoneyField name="cltAnnualPlr" label="PLR anual" hint="Tem tabela de IR própria." defaultValue="0" />
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium text-ink/80">Direitos considerados</legend>
        <div className="flex flex-wrap gap-2">
          <Toggle name="includeThirteenth" label="13º salário" />
          <Toggle name="includeVacation" label="Férias + 1/3" />
          <Toggle name="includeFgts" label="FGTS 8%" />
          <Toggle name="includeTerminationProtection" label="Multa de 40% do FGTS" />
        </div>
      </fieldset>

      <Advanced title="Mais detalhes da CLT">
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField
            name="cltMonthlyTaxableBenefits"
            label="Benefícios tributáveis"
            hint="Entram na base de INSS e IR."
            defaultValue="0"
          />
          <MoneyField
            name="cltMonthlyDiscounts"
            label="Outros descontos mensais"
            hint="Vale-transporte, coparticipação etc."
            defaultValue="0"
          />
          <NumberField name="cltDependents" label="Dependentes no IR" defaultValue="0" step="1" />
        </div>
      </Advanced>
    </FormSection>
  );
}

function PJFields() {
  const [regime, setRegime] = useState("auto");

  return (
    <FormSection side="pj" title="Proposta PJ" icon={BriefcaseBusiness}>
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="pjMonthlyRate" label="Valor mensal da nota" defaultValue="15000" />
        <NumberField
          name="pjPaidMonthsPerYear"
          label="Meses faturados no ano"
          hint="Use 11 se as férias não forem pagas."
          defaultValue="12"
          step="1"
          suffix="meses"
        />
        <MoneyField name="pjMonthlyAccountingCost" label="Contador por mês" defaultValue="250" />
        <MoneyField name="pjMonthlyHealthPlanCost" label="Plano de saúde por mês" defaultValue="700" />
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium text-ink/80">Como é o contrato</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="pjContractRisk"
            label="Estabilidade da relação"
            hint="Alta: contrato longo e cliente sólido. Baixa: projeto curto."
            defaultValue="medium"
            options={[
              ["low", "Alta"],
              ["medium", "Média"],
              ["high", "Baixa"],
            ]}
          />
          <NumberField name="pjNoticeDays" label="Aviso prévio para encerrar" defaultValue="30" step="1" suffix="dias" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Toggle name="pjHasPaidVacation" label="Tem pausa remunerada" />
          <Toggle name="pjAllowsOtherClients" label="Posso ter outros clientes" />
          <Toggle name="pjRequiresExclusivity" label="Exige exclusividade" defaultChecked={false} />
        </div>
      </fieldset>

      <Advanced title="Impostos, pró-labore e reservas">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor="pjTaxRegime">Regime tributário</label>
            <select id="pjTaxRegime" name="pjTaxRegime" value={regime} onChange={(event) => setRegime(event.target.value)}>
              <option value="auto">Simples Nacional (automático pelo Fator R)</option>
              <option value="simples_anexo_iii">Simples Nacional · Anexo III</option>
              <option value="simples_anexo_v">Simples Nacional · Anexo V</option>
              <option value="manual">Informar alíquota manualmente</option>
            </select>
          </div>
          {regime === "manual" ? (
            <NumberField name="pjEffectiveTaxRate" label="Alíquota efetiva" defaultValue="6" suffix="%" />
          ) : (
            <input type="hidden" name="pjEffectiveTaxRate" value="6" />
          )}
          <MoneyField name="pjProLabore" label="Pró-labore mensal" hint="Deixe 28% do faturamento para o Fator R." defaultValue="4200" />
          <NumberField name="pjProLaboreRate" label="Pró-labore automático" defaultValue="28" suffix="%" />
          <MoneyField
            name="pjGrossRevenueLast12Months"
            label="Faturamento dos últimos 12 meses"
            hint="Empresa nova: valor mensal x 12."
            defaultValue="180000"
          />
          <MoneyField name="pjPayrollLast12Months" label="Pró-labore dos últimos 12 meses" defaultValue="50400" />
          <MoneyField name="pjOtherMonthlyCosts" label="Outros custos mensais" defaultValue="0" />
        </div>

        <p className="mb-2 mt-5 text-sm font-medium text-ink/80">Quanto separar por mês</p>
        <p className="hint mb-3">Sugestão de poupança. Não reduz o pacote anual, porque o dinheiro continua seu.</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <NumberField name="pjVacationReserveRate" label="Férias" defaultValue="8.33" suffix="%" />
          <NumberField name="pjThirteenthReserveRate" label="13º" defaultValue="8.33" suffix="%" />
          <NumberField name="pjFgtsReserveRate" label="Tipo FGTS" defaultValue="8" suffix="%" />
          <NumberField name="pjEmergencyReserveRate" label="Emergência" defaultValue="10" suffix="%" />
        </div>
      </Advanced>
    </FormSection>
  );
}

function FormSection({
  side,
  title,
  icon: Icon,
  children,
}: {
  side: "clt" | "pj";
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const accent = side === "clt" ? "bg-clt-soft text-clt" : "bg-pj-soft text-pj";
  const bar = side === "clt" ? "bg-clt" : "bg-pj";

  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} aria-hidden />
      <div className="mb-5 flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${accent}`}>
          <Icon size={18} />
        </span>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Advanced({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group mt-5 rounded-xl border border-line bg-paper/60">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink/75 hover:text-ink">
        {title}
        <ChevronDown size={18} className="transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-line px-4 pb-4 pt-4">{children}</div>
    </details>
  );
}

function NumberField({
  name,
  label,
  defaultValue,
  hint,
  suffix,
  step = "0.01",
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
  suffix?: string;
  step?: string;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={name}>{label}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="number"
          min="0"
          step={step}
          defaultValue={defaultValue}
          className={`num ${suffix ? "pr-16" : ""}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink/40">{suffix}</span>
        ) : null}
      </div>
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

function MoneyField({
  name,
  label,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
}) {
  const [value, setValue] = useState(formatCurrencyInput(Number(defaultValue)));

  function handleChange(nextValue: string) {
    const digits = nextValue.replace(/\D/g, "");
    const amount = nextValue.includes("R$") || nextValue.includes(",") ? Number(digits) / 100 : Number(digits || 0);
    setValue(formatCurrencyInput(amount));
  }

  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="text"
        inputMode="numeric"
        className="num"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
      />
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

function Select({
  name,
  label,
  hint,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: string;
  options: Array<[string, string]>;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue}>
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

function Toggle({ name, label, defaultChecked = true }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="relative cursor-pointer">
      <input className="peer sr-only" name={name} type="checkbox" defaultChecked={defaultChecked} />
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink/60 transition peer-checked:border-mint peer-checked:bg-mint-soft peer-checked:text-mint-dark peer-focus-visible:ring-4 peer-focus-visible:ring-mint/25">
        <span className="h-2 w-2 rounded-full bg-current opacity-70" aria-hidden />
        {label}
      </span>
    </label>
  );
}

function ResultPanel({
  mode,
  result,
  error,
}: {
  mode: CalculatorMode;
  result: ResultState | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="card border-clay/30 p-6">
        <h2 className="text-lg font-bold text-clay">Não foi possível calcular</h2>
        <p className="mt-2 text-sm text-ink/70">{error} Confira se a API está no ar e tente de novo.</p>
      </div>
    );
  }

  if (!result) {
    return <EmptyResult mode={mode} />;
  }

  if (result.mode === "compare") {
    return <CompareResultPanel result={result.data} />;
  }

  return <EquivalentResultPanel mode={result.mode} result={result.data} />;
}

function EmptyResult({ mode }: { mode: CalculatorMode }) {
  return (
    <div className="card p-6">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint-soft text-mint">
        <Scale size={22} />
      </span>
      <h2 className="mt-4 text-lg font-bold">Seu resultado aparece aqui</h2>
      <p className="mt-2 text-sm leading-6 text-ink/60">{emptyResultText(mode)}</p>
      <ul className="mt-5 grid gap-2.5 text-sm text-ink/65">
        <li className="flex gap-2">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-mint" />
          Tabelas de INSS e IR 2026, com a isenção até R$ 5 mil
        </li>
        <li className="flex gap-2">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-mint" />
          Simples Nacional com Fator R e pró-labore
        </li>
        <li className="flex gap-2">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-mint" />
          Sem cadastro para simular
        </li>
      </ul>
    </div>
  );
}

const verdicts = {
  pj: {
    label: "PJ compensa mais",
    tone: "border-pj/30 bg-pj-soft",
    title: "text-pj-ink",
  },
  clt: {
    label: "CLT compensa mais",
    tone: "border-clt/30 bg-clt-soft",
    title: "text-clt-ink",
  },
  neutral: {
    label: "PJ empata, mas sem folga para o risco",
    tone: "border-line bg-paper",
    title: "text-ink",
  },
} as const;

function CompareResultPanel({ result }: { result: CompareResult }) {
  const verdict = verdicts[result.recommendedOption];
  const gain = result.annualDifference;

  return (
    <div className="card overflow-hidden">
      <div className={`border-b p-6 ${verdict.tone}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">Veredito</p>
        <h2 className={`mt-1 text-2xl font-bold ${verdict.title}`}>{verdict.label}</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">{result.summary}</p>
      </div>

      <div className="p-6">
        <AnnualBars clt={result.clt.annualNet} pj={result.pj.annualNet} />

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat
            label="Diferença no ano"
            value={`${gain >= 0 ? "+" : "−"}${BRL0.format(Math.abs(gain))}`}
            detail={gain >= 0 ? "a favor do PJ" : "a favor da CLT"}
          />
          <Stat label="Líquido no mês" value={BRL0.format(result.pj.monthlyNet)} detail={`PJ · CLT ${BRL0.format(result.clt.monthlyNet)}`} />
          <Stat label="PJ para empatar" value={BRL0.format(result.minimumPjToBreakEven)} detail="por mês" />
          <Stat
            label="PJ recomendado"
            value={BRL0.format(result.minimumPjRecommended)}
            detail={`com ${PERCENT.format(result.pj.riskPremiumRate)} de margem`}
            highlight
          />
        </div>

        <SetAside value={result.pj.monthlyReserve} />

        <Breakdown>
          <MetricGroup title="CLT">
            <Metric label="INSS mensal" value={BRL.format(result.clt.monthlyInss)} />
            <Metric label="IRRF mensal" value={BRL.format(result.clt.monthlyIrrf)} />
            <Metric label="13º líquido" value={BRL.format(result.clt.annualThirteenthNet)} />
            <Metric label="1/3 de férias líquido" value={BRL.format(result.clt.annualVacationNet)} />
            <Metric label="FGTS no ano" value={BRL.format(result.clt.annualFgts)} />
            {result.clt.annualTerminationValue ? (
              <Metric label="Multa de 40% (proporcional)" value={BRL.format(result.clt.annualTerminationValue)} />
            ) : null}
            {result.clt.annualBonusNet ? <Metric label="Bônus líquido" value={BRL.format(result.clt.annualBonusNet)} /> : null}
            {result.clt.annualPlrNet ? <Metric label="PLR líquida" value={BRL.format(result.clt.annualPlrNet)} /> : null}
          </MetricGroup>
          <MetricGroup title="PJ">
            <Metric label="Regime" value={formatRegime(result.pj.taxRegime)} />
            <Metric label="Alíquota efetiva" value={PERCENT.format(result.pj.effectiveTaxRate)} />
            <Metric label="Fator R" value={PERCENT.format(result.pj.factorR)} />
            <Metric label="Pró-labore" value={BRL.format(result.pj.proLabore)} />
            <Metric label="Impostos por mês" value={BRL.format(result.pj.monthlyTaxes)} />
            <Metric label="Custos fixos por mês" value={BRL.format(result.pj.monthlyCosts)} />
          </MetricGroup>
          <Reasons reasons={result.reasons} />
        </Breakdown>
      </div>
      <Disclaimer />
    </div>
  );
}

function EquivalentResultPanel({ mode, result }: { mode: Exclude<CalculatorMode, "compare">; result: EquivalentResult }) {
  const isCLTToPJ = mode === "clt_to_pj";
  const cltAnnual = isCLTToPJ ? result.reference.annualNet : result.equivalent.annualNet;
  const pjAnnual = isCLTToPJ ? result.equivalent.annualNet : result.reference.annualNet;
  const pj = isCLTToPJ ? result.equivalent : result.reference;
  const clt = isCLTToPJ ? result.reference : result.equivalent;

  return (
    <div className="card overflow-hidden">
      <div className={`border-b p-6 ${isCLTToPJ ? verdicts.pj.tone : verdicts.clt.tone}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
          {isCLTToPJ ? "Peça como PJ pelo menos" : "Salário CLT equivalente"}
        </p>
        <p className={`num mt-1 text-4xl font-bold ${isCLTToPJ ? verdicts.pj.title : verdicts.clt.title}`}>
          {BRL0.format(isCLTToPJ ? result.minimumPjRecommended : result.equivalentValue)}
          <span className="text-base font-semibold text-ink/45"> /mês</span>
        </p>
        <p className="mt-2 text-sm leading-6 text-ink/70">{result.summary}</p>
      </div>

      <div className="p-6">
        <AnnualBars clt={cltAnnual} pj={pjAnnual} />

        <div className="mt-6 grid grid-cols-2 gap-3">
          {isCLTToPJ ? (
            <>
              <Stat label="Empate exato" value={BRL0.format(result.minimumPjToBreakEven)} detail="por mês, sem margem" />
              <Stat label="Margem de risco" value={PERCENT.format(result.riskPremiumRate)} detail="sobre o empate" />
              <Stat label="Líquido PJ no mês" value={BRL0.format(result.equivalent.monthlyNet)} detail="no valor recomendado" />
              <Stat label="Líquido CLT no mês" value={BRL0.format(result.reference.monthlyNet)} detail="proposta atual" />
            </>
          ) : (
            <>
              <Stat label="Líquido CLT no mês" value={BRL0.format(result.equivalent.monthlyNet)} detail="no salário equivalente" />
              <Stat label="Líquido PJ no mês" value={BRL0.format(result.reference.monthlyNet)} detail="proposta atual" />
            </>
          )}
        </div>

        <SetAside value={pj.monthlyReserve} />

        <Breakdown>
          <MetricGroup title="CLT">
            <Metric label="INSS mensal" value={BRL.format(clt.monthlyInss)} />
            <Metric label="IRRF mensal" value={BRL.format(clt.monthlyIrrf)} />
            <Metric label="13º líquido" value={BRL.format(clt.annualThirteenthNet)} />
            <Metric label="1/3 de férias líquido" value={BRL.format(clt.annualVacationNet)} />
            <Metric label="FGTS no ano" value={BRL.format(clt.annualFgts)} />
          </MetricGroup>
          <MetricGroup title="PJ">
            <Metric label="Regime" value={formatRegime(pj.taxRegime)} />
            <Metric label="Alíquota efetiva" value={PERCENT.format(pj.effectiveTaxRate)} />
            <Metric label="Fator R" value={PERCENT.format(pj.factorR)} />
            <Metric label="Pró-labore" value={BRL.format(pj.proLabore)} />
            <Metric label="Impostos por mês" value={BRL.format(pj.monthlyTaxes)} />
            <Metric label="Custos fixos por mês" value={BRL.format(pj.monthlyCosts)} />
          </MetricGroup>
          <Reasons reasons={result.reasons} />
        </Breakdown>
      </div>
      <Disclaimer />
    </div>
  );
}

function AnnualBars({ clt, pj }: { clt: number; pj: number }) {
  const max = Math.max(clt, pj, 1);
  const rows = [
    { label: "CLT", value: clt, bar: "bg-clt", text: "text-clt-ink" },
    { label: "PJ", value: pj, bar: "bg-pj", text: "text-pj-ink" },
  ];

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink/70">Pacote anual disponível</p>
      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className={`font-semibold ${row.text}`}>{row.label}</span>
              <span className="num font-bold">{BRL0.format(row.value)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-paper">
              <div
                className={`h-2.5 rounded-full ${row.bar} transition-all duration-500`}
                style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, detail, highlight = false }: { label: string; value: string; detail?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3.5 ${highlight ? "border-mint/30 bg-mint-soft" : "border-line bg-white"}`}>
      <p className="text-xs font-medium text-ink/55">{label}</p>
      <p className={`num mt-1 text-lg font-bold ${highlight ? "text-mint-dark" : "text-ink"}`}>{value}</p>
      {detail ? <p className="text-xs text-ink/45">{detail}</p> : null}
    </div>
  );
}

function SetAside({ value }: { value: number }) {
  return (
    <p className="mt-4 flex gap-2 rounded-xl bg-paper p-3.5 text-sm text-ink/65">
      <Info size={17} className="mt-0.5 shrink-0 text-ink/40" />
      <span>
        Como PJ, separe cerca de <strong className="num text-ink">{BRL0.format(value)}</strong> por mês para férias, 13º e
        emergência. Esse dinheiro continua seu.
      </span>
    </p>
  );
}

function Breakdown({ children }: { children: ReactNode }) {
  return (
    <details className="group mt-5 border-t border-line pt-4">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-ink/75 hover:text-ink">
        Como chegamos nesse número
        <ChevronDown size={18} className="transition group-open:rotate-180" />
      </summary>
      <div className="mt-4 grid gap-5">{children}</div>
    </details>
  );
}

function MetricGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{title}</p>
      <div className="divide-y divide-line">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-ink/60">{label}</span>
      <strong className="num text-right font-semibold">{value}</strong>
    </div>
  );
}

function Reasons({ reasons }: { reasons: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Por quê</p>
      <ul className="grid gap-2 text-sm leading-6 text-ink/65">
        {reasons.map((reason) => (
          <li key={reason} className="flex gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/25" aria-hidden />
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="border-t border-line bg-paper/60 px-6 py-3 text-xs leading-5 text-ink/45">
      Simulação educativa com as regras de 2026. Não substitui a análise de um contador ou advogado.
    </p>
  );
}

function submitLabel(mode: CalculatorMode) {
  if (mode === "clt_to_pj") {
    return "Calcular quanto pedir como PJ";
  }
  if (mode === "pj_to_clt") {
    return "Calcular salário CLT equivalente";
  }
  return "Comparar propostas";
}

function emptyResultText(mode: CalculatorMode) {
  if (mode === "clt_to_pj") {
    return "Informe sua proposta CLT e descubra o valor mínimo para empatar e o valor recomendado como PJ.";
  }
  if (mode === "pj_to_clt") {
    return "Informe sua proposta PJ e descubra qual salário CLT entrega o mesmo pacote anual.";
  }
  return "Preencha as duas propostas e veja qual entrega mais dinheiro no ano, com a margem de risco do PJ.";
}

function formatRegime(regime: string) {
  const labels: Record<string, string> = {
    auto: "Automático",
    manual: "Alíquota manual",
    simples_anexo_iii: "Simples · Anexo III",
    simples_anexo_v: "Simples · Anexo V",
  };
  return labels[regime] ?? regime;
}

function number(form: FormData, name: string) {
  return parseBRNumber(String(form.get(name) || "0"));
}

function text(form: FormData, name: string) {
  return String(form.get(name) || "");
}

function formatCurrencyInput(value: number) {
  return BRL.format(Math.round(value * 100) / 100);
}

function parseBRNumber(value: string) {
  const normalized = value.trim();

  if (normalized.includes("R$") || normalized.includes(",")) {
    const cleaned = normalized.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    return Number(cleaned || 0);
  }

  return Number(normalized || 0);
}
