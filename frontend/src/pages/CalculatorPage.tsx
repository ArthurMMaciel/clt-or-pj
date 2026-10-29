import { Calculator, TrendingUp } from "lucide-react";
import { useState, type FormEvent } from "react";

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

const PERCENT = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
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
  color: string;
}> = [
  {
    mode: "compare",
    label: "Comparar propostas",
    description: "CLT e PJ lado a lado",
    color: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  {
    mode: "clt_to_pj",
    label: "Saber proposta PJ equivalente a minha CLT",
    description: "Informe somente CLT",
    color: "bg-yellow-400 text-ink hover:bg-yellow-300",
  },
  {
    mode: "pj_to_clt",
    label: "Saber proposta CLT equivalente a minha PJ",
    description: "Informe somente PJ",
    color: "bg-blue-600 text-white hover:bg-blue-700",
  },
];

export function CalculatorPage() {
  const [mode, setMode] = useState<CalculatorMode>("compare");
  const [result, setResult] = useState<ResultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  }

  const showCLT = mode === "compare" || mode === "clt_to_pj";
  const showPJ = mode === "compare" || mode === "pj_to_clt";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section>
        <div className="mb-6 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-normal text-ink">
            Compare CLT e PJ pelo pacote anual, não só pelo líquido mensal
          </h1>
          <p className="mt-3 text-ink/70">
            A conta inclui impostos, direitos, FGTS, PLR, Simples/Fator R, pró-labore e margem de risco.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2 sm:grid-cols-3">
            {modes.map((item) => (
              <button
                key={item.mode}
                type="button"
                className={`rounded-md px-3 py-2 text-left text-sm font-semibold shadow-sm transition ${item.color} ${
                  mode === item.mode ? "ring-2 ring-ink/25 ring-offset-2" : "opacity-85 hover:opacity-100"
                }`}
                onClick={() => selectMode(item.mode)}
              >
                <span className="block leading-snug">{item.label}</span>
                <span className="mt-0.5 block text-[11px] opacity-80">{item.description}</span>
              </button>
            ))}
          </div>

          {showCLT && <CLTFields />}
          {showPJ && <PJFields />}

          <button
            type="submit"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-mint px-4 py-2 font-semibold text-white hover:bg-mint/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            <TrendingUp size={18} />
            {isLoading ? "Calculando..." : submitLabel(mode)}
          </button>
        </form>
      </section>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <ResultPanel mode={mode} result={result} error={error} />
      </aside>
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
    <fieldset className="rounded-lg border border-ink/10 bg-white p-5">
      <legend className="px-1 text-base font-semibold">Contrato CLT</legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CurrencyField name="cltGrossSalary" label="Salário bruto" defaultValue="10000" />
        <CurrencyField name="cltMonthlyBenefits" label="Benefícios não tributáveis" defaultValue="1000" />
        <CurrencyField name="cltMonthlyTaxableBenefits" label="Benefícios tributáveis" defaultValue="0" />
        <CurrencyField name="cltMonthlyDiscounts" label="Descontos extras" defaultValue="0" />
        <CurrencyField name="cltAnnualBonus" label="Bônus anual" defaultValue="0" />
        <CurrencyField name="cltAnnualPlr" label="PLR anual" defaultValue="0" />
        <Field name="cltDependents" label="Dependentes IRRF" defaultValue="0" step="1" />
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Check name="includeFgts" label="FGTS 8%" />
        <Check name="includeThirteenth" label="13º salário" />
        <Check name="includeVacation" label="Férias + 1/3" />
        <Check name="includeTerminationProtection" label="Multa FGTS 40%" />
      </div>
    </fieldset>
  );
}

function PJFields() {
  return (
    <fieldset className="rounded-lg border border-ink/10 bg-white p-5">
      <legend className="px-1 text-base font-semibold">Contrato PJ</legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CurrencyField name="pjMonthlyRate" label="Valor mensal PJ" defaultValue="15000" />
        <Select
          name="pjTaxRegime"
          label="Regime tributário"
          defaultValue="auto"
          options={[
            ["auto", "Automático por Fator R"],
            ["simples_anexo_iii", "Simples Anexo III"],
            ["simples_anexo_v", "Simples Anexo V"],
            ["manual", "Alíquota manual"],
          ]}
        />
        <Field name="pjEffectiveTaxRate" label="Alíquota manual (%)" defaultValue="6" />
        <CurrencyField name="pjGrossRevenueLast12Months" label="Receita bruta 12 meses" defaultValue="180000" />
        <CurrencyField name="pjPayrollLast12Months" label="Folha/pró-labore 12 meses" defaultValue="50400" />
        <CurrencyField name="pjProLabore" label="Pró-labore mensal" defaultValue="4200" />
        <Field name="pjProLaboreRate" label="Pró-labore automático (%)" defaultValue="28" />
        <Field name="pjPaidMonthsPerYear" label="Meses pagos no ano" defaultValue="12" step="1" />
        <CurrencyField name="pjMonthlyAccountingCost" label="Contador" defaultValue="250" />
        <CurrencyField name="pjMonthlyHealthPlanCost" label="Plano de saúde" defaultValue="700" />
        <CurrencyField name="pjOtherMonthlyCosts" label="Outros custos" defaultValue="0" />
        <Field name="pjVacationReserveRate" label="Separar p/ férias (%)" defaultValue="8.33" />
        <Field name="pjThirteenthReserveRate" label="Separar p/ 13º (%)" defaultValue="8.33" />
        <Field name="pjFgtsReserveRate" label="Separar tipo FGTS (%)" defaultValue="8" />
        <Field name="pjEmergencyReserveRate" label="Separar p/ emergência (%)" defaultValue="10" />
        <Select
          name="pjContractRisk"
          label="Risco do contrato"
          defaultValue="medium"
          options={[
            ["medium", "Médio"],
            ["low", "Baixo"],
            ["high", "Alto"],
          ]}
        />
        <Field name="pjNoticeDays" label="Aviso prévio PJ em dias" defaultValue="30" step="1" />
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Check name="pjHasPaidVacation" label="Tem pausa remunerada" />
        <Check name="pjAllowsOtherClients" label="Permite outros clientes" />
        <Check name="pjRequiresExclusivity" label="Exige exclusividade" defaultChecked={false} />
      </div>
    </fieldset>
  );
}

function Field({
  name,
  label,
  defaultValue,
  step = "0.01",
}: {
  name: string;
  label: string;
  defaultValue: string;
  step?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type="number" min="0" step={step} defaultValue={defaultValue} />
    </div>
  );
}

function CurrencyField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [value, setValue] = useState(formatCurrencyInput(Number(defaultValue)));

  function handleChange(nextValue: string) {
    const digits = nextValue.replace(/\D/g, "");
    const amount = nextValue.includes("R$") || nextValue.includes(",") ? Number(digits) / 100 : Number(digits || 0);
    setValue(formatCurrencyInput(amount));
  }

  return (
    <div className="grid gap-1.5">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
      />
    </div>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: Array<[string, string]>;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue}>
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}

function Check({
  name,
  label,
  defaultChecked = true,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <input className="h-4 w-4 accent-mint" name={name} type="checkbox" defaultChecked={defaultChecked} />
      {label}
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
    return <div className="rounded-lg border border-clay/30 bg-white p-5 text-clay">{error}</div>;
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Resultado</h2>
        <p className="mt-2 text-sm text-ink/70">{emptyResultText(mode)}</p>
      </div>
    );
  }

  if (result.mode === "compare") {
    return <CompareResultPanel result={result.data} />;
  }

  return <EquivalentResultPanel mode={result.mode} result={result.data} />;
}

function CompareResultPanel({ result }: { result: CompareResult }) {
  const label =
    result.recommendedOption === "pj"
      ? "PJ é mais benéfico"
      : result.recommendedOption === "clt"
        ? "CLT é mais benéfico"
        : "PJ melhora o anual, mas não cobre o risco";

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-lime/60 px-3 py-1 text-sm font-medium">
        <Calculator size={16} />
        {label}
      </div>
      <p className="text-sm leading-6 text-ink/75">{result.summary}</p>

      <div className="mt-5 grid gap-3">
        <Metric label="Líquido mensal CLT" value={BRL.format(result.clt.monthlyNet)} />
        <Metric label="Líquido mensal PJ" value={BRL.format(result.pj.monthlyNet)} />
        <Metric label="Pacote anual CLT" value={BRL.format(result.clt.annualNet)} />
        <Metric label="Pacote anual PJ" value={BRL.format(result.pj.annualNet)} />
        <Metric label="Diferença anual" value={BRL.format(result.annualDifference)} />
        <Metric label="PJ mínimo para empatar" value={BRL.format(result.minimumPjToBreakEven)} />
        <Metric label="PJ recomendado com margem de risco" value={BRL.format(result.minimumPjRecommended)} />
        <Metric label="PJ: separar por mês (fica com você)" value={BRL.format(result.pj.monthlyReserve)} />
      </div>

      <Details result={result} />
    </div>
  );
}

function EquivalentResultPanel({ mode, result }: { mode: Exclude<CalculatorMode, "compare">; result: EquivalentResult }) {
  const isCLTToPJ = mode === "clt_to_pj";

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-lime/60 px-3 py-1 text-sm font-medium">
        <Calculator size={16} />
        {isCLTToPJ ? "PJ equivalente" : "CLT equivalente"}
      </div>
      <p className="text-sm leading-6 text-ink/75">{result.summary}</p>

      <div className="grid gap-3">
        {isCLTToPJ ? (
          <>
            <Metric label="PJ mínimo para empatar" value={BRL.format(result.minimumPjToBreakEven)} />
            <Metric label="PJ recomendado com margem de risco" value={BRL.format(result.minimumPjRecommended)} />
            <Metric label="Líquido mensal PJ recomendado" value={BRL.format(result.equivalent.monthlyNet)} />
            <Metric label="Pacote anual CLT base" value={BRL.format(result.reference.annualNet)} />
            <Metric label="Pacote anual PJ recomendado" value={BRL.format(result.equivalent.annualNet)} />
            <Metric label="Diferença anual recomendada" value={BRL.format(result.annualDifference)} />
          </>
        ) : (
          <>
            <Metric label="Salário CLT bruto equivalente" value={BRL.format(result.equivalentValue)} />
            <Metric label="Líquido mensal CLT equivalente" value={BRL.format(result.equivalent.monthlyNet)} />
            <Metric label="Pacote anual PJ base" value={BRL.format(result.reference.annualNet)} />
            <Metric label="Pacote anual CLT equivalente" value={BRL.format(result.equivalent.annualNet)} />
            <Metric label="Diferença anual estimada" value={BRL.format(result.annualDifference)} />
          </>
        )}
      </div>

      {isCLTToPJ ? <PJEquivalentDetails result={result} /> : <CLTEquivalentDetails result={result} />}

      <ul className="mt-5 grid gap-2 text-sm text-ink/70">
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}

function PJEquivalentDetails({ result }: { result: EquivalentResult }) {
  return (
    <div className="mt-5 grid gap-3 border-t border-ink/10 pt-4 text-sm">
      <Metric label="Regime PJ" value={formatRegime(result.equivalent.taxRegime)} />
      <Metric label="Alíquota PJ efetiva" value={PERCENT.format(result.equivalent.effectiveTaxRate)} />
      <Metric label="Fator R" value={PERCENT.format(result.equivalent.factorR)} />
      <Metric label="Pró-labore" value={BRL.format(result.equivalent.proLabore)} />
      <Metric label="INSS pró-labore" value={BRL.format(result.equivalent.monthlyInss)} />
      <Metric label="IRRF pró-labore" value={BRL.format(result.equivalent.monthlyIrrf)} />
      <Metric label="Impostos mensais PJ" value={BRL.format(result.equivalent.monthlyTaxes)} />
      <Metric label="Custos fixos PJ" value={BRL.format(result.equivalent.monthlyCosts)} />
      <Metric label="Separar por mês (fica com você)" value={BRL.format(result.equivalent.monthlyReserve)} />
      <Metric label="Margem de risco" value={PERCENT.format(result.riskPremiumRate)} />
      <Metric label="Líquido mensal CLT base" value={BRL.format(result.reference.monthlyNet)} />
      <Metric label="INSS CLT base" value={BRL.format(result.reference.monthlyInss)} />
      <Metric label="IRRF CLT base" value={BRL.format(result.reference.monthlyIrrf)} />
      <Metric label="FGTS anual CLT base" value={BRL.format(result.reference.annualFgts)} />
    </div>
  );
}

function CLTEquivalentDetails({ result }: { result: EquivalentResult }) {
  return (
    <div className="mt-5 grid gap-3 border-t border-ink/10 pt-4 text-sm">
      <Metric label="INSS CLT mensal" value={BRL.format(result.equivalent.monthlyInss)} />
      <Metric label="IRRF CLT mensal" value={BRL.format(result.equivalent.monthlyIrrf)} />
      <Metric label="13º líquido estimado" value={BRL.format(result.equivalent.annualThirteenthNet)} />
      <Metric label="Férias líquidas estimadas" value={BRL.format(result.equivalent.annualVacationNet)} />
      <Metric label="FGTS anual estimado" value={BRL.format(result.equivalent.annualFgts)} />
      <Metric label="Líquido mensal PJ base" value={BRL.format(result.reference.monthlyNet)} />
      <Metric label="Regime PJ base" value={formatRegime(result.reference.taxRegime)} />
      <Metric label="Alíquota PJ efetiva" value={PERCENT.format(result.reference.effectiveTaxRate)} />
      <Metric label="Fator R PJ base" value={PERCENT.format(result.reference.factorR)} />
      <Metric label="Pró-labore PJ base" value={BRL.format(result.reference.proLabore)} />
      <Metric label="PJ base: separar por mês" value={BRL.format(result.reference.monthlyReserve)} />
    </div>
  );
}

function Details({ result }: { result: CompareResult }) {
  return (
    <>
      <div className="mt-5 grid gap-3 border-t border-ink/10 pt-4 text-sm">
        <Metric label="INSS CLT mensal" value={BRL.format(result.clt.monthlyInss)} />
        <Metric label="IRRF CLT mensal" value={BRL.format(result.clt.monthlyIrrf)} />
        <Metric label="FGTS anual" value={BRL.format(result.clt.annualFgts)} />
        <Metric label="Regime PJ" value={formatRegime(result.pj.taxRegime)} />
        <Metric label="Alíquota PJ efetiva" value={PERCENT.format(result.pj.effectiveTaxRate)} />
        <Metric label="Fator R" value={PERCENT.format(result.pj.factorR)} />
        <Metric label="Pró-labore" value={BRL.format(result.pj.proLabore)} />
        <Metric label="Margem de risco" value={PERCENT.format(result.pj.riskPremiumRate)} />
      </div>

      <ul className="mt-5 grid gap-2 text-sm text-ink/70">
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-2">
      <span className="text-sm text-ink/70">{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}

function submitLabel(mode: CalculatorMode) {
  if (mode === "clt_to_pj") {
    return "Calcular PJ equivalente";
  }
  if (mode === "pj_to_clt") {
    return "Calcular CLT equivalente";
  }
  return "Calcular comparação";
}

function emptyResultText(mode: CalculatorMode) {
  if (mode === "clt_to_pj") {
    return "Preencha os dados CLT para descobrir a proposta PJ equivalente.";
  }
  if (mode === "pj_to_clt") {
    return "Preencha os dados PJ para descobrir o salário CLT equivalente.";
  }
  return "Preencha CLT e PJ para comparar as duas propostas.";
}

function formatRegime(regime: string) {
  const labels: Record<string, string> = {
    auto: "Automático",
    manual: "Manual",
    simples_anexo_iii: "Simples Anexo III",
    simples_anexo_v: "Simples Anexo V",
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
