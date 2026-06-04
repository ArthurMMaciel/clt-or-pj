import { Calculator, TrendingUp } from "lucide-react";
import { useState, type FormEvent } from "react";

import { compareContracts, type CompareResult } from "../lib/api";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CalculatorPage() {
  const [result, setResult] = useState<CompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const number = (name: string) => Number(form.get(name) || 0);

    try {
      const data = await compareContracts({
        clt: {
          grossSalary: number("cltGrossSalary"),
          monthlyBenefits: number("cltMonthlyBenefits"),
          monthlyDiscounts: number("cltMonthlyDiscounts"),
          annualBonus: number("cltAnnualBonus"),
          includeFgts: form.has("includeFgts"),
          includeThirteenth: form.has("includeThirteenth"),
          includeVacation: form.has("includeVacation"),
        },
        pj: {
          monthlyRate: number("pjMonthlyRate"),
          effectiveTaxRate: number("pjEffectiveTaxRate") / 100,
          monthlyAccountingCost: number("pjMonthlyAccountingCost"),
          monthlyHealthPlanCost: number("pjMonthlyHealthPlanCost"),
          otherMonthlyCosts: number("pjOtherMonthlyCosts"),
          vacationReserveRate: number("pjVacationReserveRate") / 100,
          thirteenthReserveRate: number("pjThirteenthReserveRate") / 100,
          emergencyReserveRate: number("pjEmergencyReserveRate") / 100,
        },
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <div className="mb-6 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-lime/60 px-3 py-1 text-sm font-medium">
            <Calculator size={16} />
            Comparador publico
          </div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">
            Compare uma proposta CLT com uma proposta PJ
          </h1>
          <p className="mt-3 text-ink/70">
            Primeira versao funcional para validar fluxo, resultado e explicacao.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <fieldset className="rounded-lg border border-ink/10 bg-white p-5">
            <legend className="px-1 text-base font-semibold">Contrato CLT</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="cltGrossSalary" label="Salario bruto" defaultValue="4000" />
              <Field name="cltMonthlyBenefits" label="Beneficios mensais" defaultValue="800" />
              <Field name="cltMonthlyDiscounts" label="Descontos mensais" defaultValue="450" />
              <Field name="cltAnnualBonus" label="Bonus/PLR anual" defaultValue="0" />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <Check name="includeFgts" label="Considerar FGTS" />
              <Check name="includeThirteenth" label="Considerar 13 salario" />
              <Check name="includeVacation" label="Considerar ferias + 1/3" />
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-ink/10 bg-white p-5">
            <legend className="px-1 text-base font-semibold">Contrato PJ</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="pjMonthlyRate" label="Valor mensal PJ" defaultValue="6500" />
              <Field name="pjEffectiveTaxRate" label="Imposto efetivo (%)" defaultValue="6" />
              <Field name="pjMonthlyAccountingCost" label="Contador" defaultValue="250" />
              <Field name="pjMonthlyHealthPlanCost" label="Plano de saude" defaultValue="450" />
              <Field name="pjOtherMonthlyCosts" label="Outros custos" defaultValue="0" />
              <Field name="pjVacationReserveRate" label="Reserva ferias (%)" defaultValue="8.33" />
              <Field name="pjThirteenthReserveRate" label="Reserva 13 (%)" defaultValue="8.33" />
              <Field name="pjEmergencyReserveRate" label="Reserva emergencia (%)" defaultValue="10" />
            </div>
          </fieldset>

          <button
            type="submit"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-mint px-4 py-2 font-semibold text-white hover:bg-mint/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            <TrendingUp size={18} />
            {isLoading ? "Calculando..." : "Comparar propostas"}
          </button>
        </form>
      </section>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <ResultPanel result={result} error={error} />
      </aside>
    </div>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type="number" min="0" step="0.01" defaultValue={defaultValue} />
    </div>
  );
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="inline-flex items-center gap-2">
      <input className="h-4 w-4 accent-mint" name={name} type="checkbox" defaultChecked />
      {label}
    </label>
  );
}

function ResultPanel({ result, error }: { result: CompareResult | null; error: string | null }) {
  if (error) {
    return <div className="rounded-lg border border-clay/30 bg-white p-5 text-clay">{error}</div>;
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Resultado</h2>
        <p className="mt-2 text-sm text-ink/70">
          Preencha os dados e rode a comparacao para ver o equivalente mensal, anual e os motivos.
        </p>
      </div>
    );
  }

  const label =
    result.recommendedOption === "pj"
      ? "PJ vale mais financeiramente"
      : result.recommendedOption === "clt"
        ? "CLT vale mais financeiramente"
        : "Resultado equilibrado";

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold">{label}</h2>
      <div className="mt-4 grid gap-3">
        <Metric label="Liquido mensal CLT" value={BRL.format(result.clt.monthlyNet)} />
        <Metric label="Liquido mensal PJ" value={BRL.format(result.pj.monthlyNet)} />
        <Metric label="Diferenca mensal" value={BRL.format(result.monthlyDifference)} />
        <Metric label="Diferenca anual" value={BRL.format(result.annualDifference)} />
        <Metric label="PJ minimo para empatar" value={BRL.format(result.minimumPjToBreakEven)} />
      </div>
      <ul className="mt-5 grid gap-2 text-sm text-ink/70">
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 pb-2">
      <span className="text-sm text-ink/70">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
