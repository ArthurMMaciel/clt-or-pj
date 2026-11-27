import { ArrowLeft, ArrowRight, Check, ChevronDown, Info, Loader2, PiggyBank, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import {
  cltToPj,
  compareContracts,
  pjToClt,
  type CLTPayload,
  type CompareResult,
  type EquivalentResult,
  type PJPayload,
} from "../lib/api";
import { defaultPJAssumptions } from "../lib/defaults";
import { useCountUp } from "../lib/motion";

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
  short: string;
  description: string;
}> = [
  {
    mode: "compare",
    label: "Comparar propostas",
    short: "Comparar",
    description: "Você tem uma proposta CLT e uma PJ e quer saber qual deixa mais dinheiro no ano.",
  },
  {
    mode: "clt_to_pj",
    label: "Quanto pedir como PJ",
    short: "Pedir como PJ",
    description: "Você tem só a proposta CLT e quer saber o valor mínimo da nota para a troca valer.",
  },
  {
    mode: "pj_to_clt",
    label: "Quanto vale em CLT",
    short: "Valor em CLT",
    description: "Você tem só a proposta PJ e quer saber qual salário CLT entrega o mesmo no ano.",
  },
];

type Prefill = { salary?: number; benefits?: number; pjRate?: number };

// Valores vindos da landing (?modo=&salario=&beneficios=&nota=).
function readPrefill(params: URLSearchParams): { mode: CalculatorMode; prefill: Prefill; hasValues: boolean } {
  const rawMode = params.get("modo");
  const mode: CalculatorMode = rawMode === "clt_to_pj" || rawMode === "pj_to_clt" ? rawMode : "compare";
  const read = (key: string) => {
    const value = Number(params.get(key));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  const prefill = { salary: read("salario"), benefits: read("beneficios"), pjRate: read("nota") };
  return { mode, prefill, hasValues: prefill.salary !== undefined || prefill.pjRate !== undefined };
}

type TabId = "clt" | "pj";

// So o modo "comparar" tem os dois lados; nele o formulario vira duas abas para nao precisar rolar.
function tabsFor(mode: CalculatorMode): TabId[] {
  return mode === "compare" ? ["clt", "pj"] : [];
}

// Abaixo de lg o resultado fica embaixo do formulario.
function isNarrow() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
}

const FORM_ID = "calculator-form";

export function CalculatorPage() {
  const [searchParams] = useSearchParams();
  const [initial] = useState(() => readPrefill(searchParams));
  const [mode, setMode] = useState<CalculatorMode>(initial.mode);
  const [tab, setTab] = useState<TabId>("clt");
  const [summary, setSummary] = useState({ salary: initial.prefill.salary ?? 10000, pjRate: initial.prefill.pjRate ?? 15000 });
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [resultVersion, setResultVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Resultado desatualizado: o usuario mexeu no formulario depois de calcular.
  const [stale, setStale] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  const tabs = tabsFor(mode);
  const hasTabs = tabs.length > 1;

  // Quem chega da landing com valores ja ve o resultado calculado.
  // O ref evita calcular duas vezes (StrictMode roda o efeito em dobro e, logado, salvaria duplicado no historico).
  const autoSubmitted = useRef(false);
  const autoSubmitting = useRef(false);
  useEffect(() => {
    if (initial.hasValues && !autoSubmitted.current) {
      autoSubmitted.current = true;
      autoSubmitting.current = true;
      formRef.current?.requestSubmit();
    }
  }, [initial.hasValues]);

  function selectMode(nextMode: CalculatorMode) {
    setMode(nextMode);
    setTab("clt");
    setResult(null);
    setError(null);
    setStale(false);
  }

  function goToTab(next: TabId) {
    setTab(next);
    if (isNarrow()) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Valores mostrados nas abas, lidos do proprio formulario a cada digitacao.
  function handleInput() {
    if (!formRef.current) return;
    if (result) setStale(true);
    const form = new FormData(formRef.current);
    setSummary((current) => ({
      salary: form.has("cltGrossSalary") ? number(form, "cltGrossSalary") : current.salary,
      pjRate: form.has("pjMonthlyRate") ? number(form, "pjMonthlyRate") : current.pjRate,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // No celular, Enter na aba CLT leva para a aba PJ em vez de calcular com a PJ ainda nao revisada.
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const isAuto = autoSubmitting.current;
    autoSubmitting.current = false;
    if (hasTabs && tab === "clt" && isNarrow() && !submitter && !isAuto) {
      goToTab("pj");
      return;
    }

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
      setResultVersion((value) => value + 1);
      setStale(false);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsLoading(false);
      if (isNarrow()) {
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    }
  }

  // Com abas, so a aba ativa aparece. Inputs escondidos continuam no FormData.
  const panelClass = (id: TabId) => (!hasTabs || tab === id ? "grid gap-5" : "hidden");

  const submitButton = (className: string) => (
    <button type="submit" form={FORM_ID} className={`btn-primary btn-lg w-full ${className}`} disabled={isLoading}>
      {isLoading ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
      {isLoading ? "Calculando..." : submitLabel(mode, Boolean(result))}
    </button>
  );

  const activeMode = modes.find((item) => item.mode === mode) ?? modes[0];

  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <p className="eyebrow">Simulador · regras de 2026</p>
        <h1 className="mt-2 text-[1.9rem] leading-tight text-ink sm:text-[2.4rem]">Quanto sobra no ano em cada proposta?</h1>
        <p className="mt-2 text-muted">
          Impostos, 13º, férias, FGTS, Simples Nacional e margem de risco entram na conta. Os campos começam com um
          exemplo: troque pelos números da sua proposta.
        </p>
      </div>

      {/* Seletor segmentado: tres modos lado a lado, ate no celular, com a descricao do modo ativo logo abaixo. */}
      <div className="mb-6">
        <div
          role="group"
          aria-label="O que você quer descobrir"
          className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-white p-1"
        >
          {modes.map((item) => {
            const active = mode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                aria-pressed={active}
                className={`min-h-[2.75rem] rounded-md px-2 py-2 text-[0.8125rem] font-semibold leading-tight transition duration-fast sm:text-sm ${
                  active ? "bg-forest text-white" : "text-muted hover:bg-paper hover:text-ink"
                }`}
                onClick={() => selectMode(item.mode)}
              >
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-subtle" aria-live="polite">
          {activeMode.description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:gap-8">
        <form
          id={FORM_ID}
          ref={formRef}
          onSubmit={handleSubmit}
          onInput={handleInput}
          className="grid scroll-mt-24 content-start gap-5"
        >
          {hasTabs ? <ProposalTabs active={tab} onSelect={goToTab} salary={summary.salary} pjRate={summary.pjRate} /> : null}

          {mode !== "pj_to_clt" ? (
            <div className={panelClass("clt")} role={hasTabs ? "tabpanel" : undefined} id="painel-clt">
              <CLTFields prefill={initial.prefill} />
              {hasTabs ? (
                <button type="button" className="btn-secondary btn-lg w-full sm:w-fit" onClick={() => goToTab("pj")}>
                  Próximo: proposta PJ
                  <ArrowRight size={18} aria-hidden />
                </button>
              ) : null}
            </div>
          ) : null}

          {mode !== "clt_to_pj" ? (
            <div className={panelClass("pj")} role={hasTabs ? "tabpanel" : undefined} id="painel-pj">
              <PJFields prefill={initial.prefill} />
              <ContractFields />
              {hasTabs ? (
                <button type="button" className="btn-ghost w-fit px-2" onClick={() => goToTab("clt")}>
                  <ArrowLeft size={17} aria-hidden />
                  Voltar para a proposta CLT
                </button>
              ) : null}
            </div>
          ) : null}

          {mode === "clt_to_pj" ? (
            <p className="flex gap-2 rounded-lg border border-line bg-white p-4 text-sm text-muted">
              <Info size={18} className="mt-0.5 shrink-0 text-subtle" aria-hidden />
              Para o lado PJ usamos premissas padrão: Simples Nacional com Fator R, contador de R$ 250, plano de saúde de
              R$ 700, 12 meses faturados e margem de risco média.
            </p>
          ) : null}

          {/* No celular o botao fica no fim do formulario; no desktop ele mora na coluna do resultado. */}
          {!hasTabs || tab === "pj" ? submitButton("lg:hidden") : null}
        </form>

        {/* --sticky-offset vem do layout: altura do header fixo das paginas publicas (0 no layout com sidebar). */}
        <aside
          ref={resultRef}
          aria-label="Resultado"
          className="grid scroll-mt-24 content-start gap-3 lg:sticky lg:top-[calc(var(--sticky-offset,0px)+1.5rem)] lg:self-start"
        >
          <div className="hidden lg:block">
            {submitButton("")}
            <p className="hint mt-2 text-center">
              {hasTabs ? "Usa os valores das duas abas, CLT e PJ." : "O resultado aparece logo abaixo."}
            </p>
          </div>
          {stale && result ? (
            <p role="status" className="flex items-start gap-2 rounded-lg border border-pj/30 bg-pj-soft px-3.5 py-2.5 text-sm text-pj-ink">
              <RefreshCw size={16} className="mt-0.5 shrink-0" aria-hidden />
              Você mudou valores depois do cálculo. Recalcule para atualizar o resultado.
            </p>
          ) : null}
          <div className={stale && result ? "opacity-60 transition-opacity duration-base" : "transition-opacity duration-base"}>
            <ResultPanel key={resultVersion} mode={mode} result={result} error={error} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProposalTabs({
  active,
  onSelect,
  salary,
  pjRate,
}: {
  active: TabId;
  onSelect: (tab: TabId) => void;
  salary: number;
  pjRate: number;
}) {
  const items: Array<{ id: TabId; label: string; value: number; suffix: string; on: string; dot: string }> = [
    { id: "clt", label: "Proposta CLT", value: salary, suffix: "bruto", on: "border-clt text-clt-ink", dot: "bg-clt" },
    { id: "pj", label: "Proposta PJ", value: pjRate, suffix: "por mês", on: "border-pj text-pj-ink", dot: "bg-pj" },
  ];

  return (
    <div role="tablist" aria-label="Propostas" className="grid grid-cols-2 border-b border-line">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`aba-${item.id}`}
            aria-selected={isActive}
            aria-controls={`painel-${item.id}`}
            onClick={() => onSelect(item.id)}
            className={`-mb-px border-b-2 px-1 pb-3 pt-1 text-left transition-colors duration-fast ${
              isActive ? item.on : "border-transparent text-muted hover:border-line hover:text-ink"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className={`h-2 w-2 rounded-full ${item.dot}`} aria-hidden />
              {item.label}
            </span>
            <span className="num mt-0.5 block text-[0.8125rem] text-subtle">
              {BRL0.format(item.value)} {item.suffix}
            </span>
          </button>
        );
      })}
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

function CLTFields({ prefill }: { prefill: Prefill }) {
  return (
    <FormSection side="clt" title="Proposta CLT">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="cltGrossSalary" label="Salário bruto mensal" defaultValue={String(prefill.salary ?? 10000)} />
        <MoneyField
          name="cltMonthlyBenefits"
          label="Benefícios por mês"
          hint="VR, VA, auxílio home office e similares."
          defaultValue={String(prefill.benefits ?? (prefill.salary ? 0 : 1000))}
        />
        <MoneyField name="cltAnnualBonus" label="Bônus anual" hint="Tributado como salário." defaultValue="0" />
        <MoneyField name="cltAnnualPlr" label="PLR anual" hint="Tem tabela de IR própria." defaultValue="0" />
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium text-muted">Direitos considerados</legend>
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

function PJFields({ prefill }: { prefill: Prefill }) {
  const [regime, setRegime] = useState("auto");

  return (
    <FormSection side="pj" title="Proposta PJ">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="pjMonthlyRate" label="Valor mensal da nota" defaultValue={String(prefill.pjRate ?? 15000)} />
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
          {/* Vazios = automaticos: o motor usa o % abaixo sobre a nota, nota x 12 e pro-labore x 12. */}
          <MoneyField
            name="pjProLabore"
            label="Pró-labore mensal"
            hint="Vazio: calculado pelo percentual ao lado."
            defaultValue=""
            placeholder="Automático"
          />
          <NumberField name="pjProLaboreRate" label="Pró-labore automático" hint="28% fecha o Fator R." defaultValue="28" suffix="%" />
          <MoneyField
            name="pjGrossRevenueLast12Months"
            label="Faturamento dos últimos 12 meses"
            hint="Vazio: valor da nota x 12 (empresa nova)."
            defaultValue=""
            placeholder="Automático"
          />
          <MoneyField
            name="pjPayrollLast12Months"
            label="Pró-labore dos últimos 12 meses"
            hint="Vazio: pró-labore x 12."
            defaultValue=""
            placeholder="Automático"
          />
          <MoneyField name="pjOtherMonthlyCosts" label="Outros custos mensais" defaultValue="0" />
        </div>

        <p className="mb-1 mt-5 text-sm font-medium text-muted">Quanto separar por mês</p>
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

function ContractFields() {
  return (
    <FormSection side="pj" title="Contrato PJ" description="Define a margem de risco sobre o valor de empate.">
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
      <div className="mt-4 flex flex-wrap gap-2">
        <Toggle name="pjHasPaidVacation" label="Tem pausa remunerada" />
        <Toggle name="pjAllowsOtherClients" label="Posso ter outros clientes" />
        <Toggle name="pjRequiresExclusivity" label="Exige exclusividade" defaultChecked={false} />
      </div>
    </FormSection>
  );
}

function FormSection({
  side,
  title,
  description,
  children,
}: {
  side: "clt" | "pj";
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const rule = side === "clt" ? "before:bg-clt" : "before:bg-pj";

  return (
    <section
      className={`card relative p-5 before:absolute before:inset-y-5 before:left-0 before:w-[3px] before:rounded-r before:content-[''] sm:p-6 ${rule}`}
    >
      <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>
      {description ? <p className="hint mt-0.5">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Advanced({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group mt-5 border-t border-line pt-1">
      <summary className="-mx-2 flex min-h-[2.75rem] cursor-pointer items-center justify-between gap-3 rounded-md px-2 text-sm font-semibold text-muted hover:text-ink">
        {title}
        <ChevronDown size={18} className="transition-transform duration-base group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-1 pt-3">{children}</div>
    </details>
  );
}

function FieldHint({ id, hint }: { id: string; hint?: string }) {
  return hint ? (
    <span id={`${id}-hint`} className="hint">
      {hint}
    </span>
  ) : null;
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
          aria-describedby={hint ? `${name}-hint` : undefined}
          className={`num ${suffix ? "pr-16" : ""}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-subtle">{suffix}</span>
        ) : null}
      </div>
      <FieldHint id={name} hint={hint} />
    </div>
  );
}

function MoneyField({
  name,
  label,
  defaultValue,
  hint,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
  placeholder?: string;
}) {
  // Com placeholder o campo pode ficar vazio (vazio = automatico, enviado como 0).
  const allowEmpty = placeholder !== undefined;
  const [value, setValue] = useState(defaultValue === "" && allowEmpty ? "" : formatCurrencyInput(Number(defaultValue)));

  function handleChange(nextValue: string) {
    const digits = nextValue.replace(/\D/g, "");
    if (allowEmpty && (digits === "" || Number(digits) === 0)) {
      setValue("");
      return;
    }
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
        autoComplete="off"
        className="num"
        placeholder={placeholder}
        value={value}
        aria-describedby={hint ? `${name}-hint` : undefined}
        onChange={(event) => handleChange(event.target.value)}
      />
      <FieldHint id={name} hint={hint} />
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
      <select id={name} name={name} defaultValue={defaultValue} aria-describedby={hint ? `${name}-hint` : undefined}>
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
      <FieldHint id={name} hint={hint} />
    </div>
  );
}

// Caixa de selecao com marca visivel: o estado nao depende so da cor.
function Toggle({ name, label, defaultChecked = true }: { name: string; label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label
      className={`inline-flex min-h-[2.5rem] cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-sm font-medium transition-colors duration-fast has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint has-[:focus-visible]:ring-offset-2 ${
        checked ? "border-mint/40 bg-mint-soft text-mint-dark" : "border-line bg-white text-muted hover:border-ink/25"
      }`}
    >
      <input className="sr-only" name={name} type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-colors duration-fast ${
          checked ? "border-mint bg-mint text-white" : "border-ink/30 bg-white"
        }`}
        aria-hidden
      >
        {checked ? <Check size={12} strokeWidth={3} /> : null}
      </span>
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
    return (
      <div className="card animate-shake border-clay/40 p-5" role="alert">
        <h2 className="font-sans text-base font-semibold tracking-normal text-clay">Não foi possível calcular</h2>
        <p className="mt-1.5 text-sm text-muted">{error}</p>
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
    <div className="card border-dashed bg-transparent p-5 sm:p-6">
      <h2 className="font-sans text-base font-semibold tracking-normal">Seu resultado aparece aqui</h2>
      <p className="mt-1.5 text-sm leading-6 text-muted">{emptyResultText(mode)}</p>
      <dl className="mt-4 border-t border-line pt-3 text-sm">
        <LedgerRow label="INSS e IR" value="tabelas de 2026" />
        <LedgerRow label="Isenção de IR" value="até R$ 5 mil" />
        <LedgerRow label="Lado PJ" value="Simples com Fator R" />
      </dl>
    </div>
  );
}

const verdicts = {
  pj: {
    label: "PJ compensa mais",
    rule: "border-l-pj",
    title: "text-pj-ink",
  },
  clt: {
    label: "CLT compensa mais",
    rule: "border-l-clt",
    title: "text-clt-ink",
  },
  neutral: {
    label: "PJ empata, mas sem folga para o risco",
    rule: "border-l-ink/30",
    title: "text-ink",
  },
} as const;

function CompareResultPanel({ result }: { result: CompareResult }) {
  const verdict = verdicts[result.recommendedOption];
  const gain = result.annualDifference;

  return (
    <article className="card animate-fade-up overflow-hidden" aria-live="polite">
      <header className={`border-l-4 px-5 py-5 sm:px-6 ${verdict.rule}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Veredito</p>
        <h2 className={`mt-1 text-[1.6rem] leading-tight ${verdict.title}`}>{verdict.label}</h2>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="num font-display text-[1.75rem] font-semibold leading-none text-ink">
            {gain >= 0 ? "+" : "−"}
            <Money value={Math.abs(gain)} />
          </span>
          <span className="text-sm text-muted">por ano {gain >= 0 ? "a favor do PJ" : "a favor da CLT"}</span>
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">{result.summary}</p>
      </header>

      <Block>
        <AnnualBars clt={result.clt.annualNet} pj={result.pj.annualNet} />
      </Block>

      <Block title="Para negociar como PJ">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Para empatar" value={<Money value={result.minimumPjToBreakEven} />} detail="nota por mês, sem margem" />
          <Stat
            label="Recomendado"
            value={<Money value={result.minimumPjRecommended} />}
            detail={`com ${PERCENT.format(result.pj.riskPremiumRate)} de margem de risco`}
            highlight
          />
        </div>
      </Block>

      <Block title="Líquido por mês">
        <dl>
          <LedgerRow side="clt" label="CLT" value={BRL0.format(result.clt.monthlyNet)} />
          <LedgerRow side="pj" label="PJ, antes da reserva" value={BRL0.format(result.pj.monthlyNet)} />
        </dl>
        <SetAside value={result.pj.monthlyReserve} />
      </Block>

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
      <Disclaimer />
    </article>
  );
}

function EquivalentResultPanel({ mode, result }: { mode: Exclude<CalculatorMode, "compare">; result: EquivalentResult }) {
  const isCLTToPJ = mode === "clt_to_pj";
  const cltAnnual = isCLTToPJ ? result.reference.annualNet : result.equivalent.annualNet;
  const pjAnnual = isCLTToPJ ? result.equivalent.annualNet : result.reference.annualNet;
  const pj = isCLTToPJ ? result.equivalent : result.reference;
  const clt = isCLTToPJ ? result.reference : result.equivalent;
  const side = isCLTToPJ ? verdicts.pj : verdicts.clt;

  return (
    <article className="card animate-fade-up overflow-hidden" aria-live="polite">
      <header className={`border-l-4 px-5 py-5 sm:px-6 ${side.rule}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
          {isCLTToPJ ? "Peça como PJ pelo menos" : "Salário CLT equivalente"}
        </p>
        <p className={`num mt-1.5 font-display text-[2.4rem] font-semibold leading-none ${side.title}`}>
          <Money value={isCLTToPJ ? result.minimumPjRecommended : result.equivalentValue} />
          <span className="ml-1 font-sans text-base font-medium text-muted">/mês</span>
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">{result.summary}</p>
      </header>

      <Block>
        <AnnualBars clt={cltAnnual} pj={pjAnnual} />
      </Block>

      <Block title={isCLTToPJ ? "De onde vem esse valor" : "Líquido por mês"}>
        <dl>
          {isCLTToPJ ? (
            <>
              <LedgerRow label="Nota para empatar" value={BRL0.format(result.minimumPjToBreakEven)} />
              <LedgerRow label="Margem de risco" value={`+ ${PERCENT.format(result.riskPremiumRate)}`} />
              <LedgerRow side="pj" label="Líquido PJ no valor recomendado" value={BRL0.format(result.equivalent.monthlyNet)} />
              <LedgerRow side="clt" label="Líquido CLT da proposta" value={BRL0.format(result.reference.monthlyNet)} />
            </>
          ) : (
            <>
              <LedgerRow side="clt" label="Líquido CLT no salário equivalente" value={BRL0.format(result.equivalent.monthlyNet)} />
              <LedgerRow side="pj" label="Líquido PJ da proposta" value={BRL0.format(result.reference.monthlyNet)} />
            </>
          )}
        </dl>
        <SetAside value={pj.monthlyReserve} />
      </Block>

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
      <Disclaimer />
    </article>
  );
}

function Block({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line px-5 py-4 sm:px-6">
      {title ? <h3 className="mb-2.5 text-sm font-semibold text-ink">{title}</h3> : null}
      {children}
    </section>
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
      <h3 className="mb-2.5 text-sm font-semibold text-ink">
        Dinheiro disponível no ano <span className="font-normal text-subtle">· depois de impostos e custos</span>
      </h3>
      <div className="grid gap-2.5">
        {rows.map((row, index) => (
          <div key={row.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className={`font-semibold ${row.text}`}>{row.label}</span>
              <span className="num font-semibold">
                <Money value={row.value} />
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-paper">
              <div
                className={`h-full origin-left animate-grow-x rounded-sm ${row.bar}`}
                style={{ width: `${Math.max(4, (row.value / max) * 100)}%`, animationDelay: `${index * 80}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, detail, highlight = false }: { label: string; value: ReactNode; detail?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3.5 ${highlight ? "bg-forest text-white" : "border border-line bg-paper/60"}`}>
      <p className={`text-xs font-medium ${highlight ? "text-white/75" : "text-muted"}`}>{label}</p>
      <p className={`num mt-1 font-display text-[1.35rem] font-semibold leading-tight ${highlight ? "text-lime" : "text-ink"}`}>
        {value}
      </p>
      {detail ? <p className={`mt-0.5 text-xs leading-4 ${highlight ? "text-white/70" : "text-subtle"}`}>{detail}</p> : null}
    </div>
  );
}

function LedgerRow({ label, value, side }: { label: string; value: string; side?: "clt" | "pj" }) {
  return (
    <div className="ledger-row">
      <dt className="flex items-center gap-2">
        {side ? <span className={`h-2 w-2 shrink-0 rounded-full ${side === "clt" ? "bg-clt" : "bg-pj"}`} aria-hidden /> : null}
        {label}
      </dt>
      <span className="ledger-fill" aria-hidden />
      <dd className="num text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

// Count-up curto: comunica que o numero mudou sem atrasar a leitura.
function Money({ value }: { value: number }) {
  return <>{BRL0.format(useCountUp(value, { duration: 450 }))}</>;
}

function SetAside({ value }: { value: number }) {
  return (
    <p className="mt-3 flex gap-2 rounded-lg bg-pj-soft px-3.5 py-3 text-sm text-pj-ink">
      <PiggyBank size={17} className="mt-0.5 shrink-0" aria-hidden />
      <span>
        Como PJ, separe cerca de <strong className="num">{BRL0.format(value)}</strong> por mês para férias, 13º e emergência.
        Esse dinheiro continua seu.
      </span>
    </p>
  );
}

function Breakdown({ children }: { children: ReactNode }) {
  return (
    <details className="group border-t border-line">
      <summary className="flex min-h-[3rem] cursor-pointer items-center justify-between px-5 text-sm font-semibold text-ink hover:bg-paper/60 sm:px-6">
        Ver a conta completa
        <ChevronDown size={18} className="text-subtle transition-transform duration-base group-open:rotate-180" aria-hidden />
      </summary>
      <div className="grid gap-5 px-5 pb-5 pt-1 sm:px-6">{children}</div>
    </details>
  );
}

function MetricGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">{title}</p>
      <dl>{children}</dl>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <LedgerRow label={label} value={value} />;
}

function Reasons({ reasons }: { reasons: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">Por quê</p>
      <ul className="grid list-disc gap-1.5 pl-5 text-sm leading-6 text-muted marker:text-ink/30">
        {reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="border-t border-line bg-paper/60 px-5 py-3 text-xs leading-5 text-subtle sm:px-6">
      Simulação educativa com as regras de 2026. Não substitui a análise de um contador ou advogado.
    </p>
  );
}

function submitLabel(mode: CalculatorMode, hasResult: boolean) {
  if (hasResult) return "Recalcular";
  if (mode === "clt_to_pj") {
    return "Calcular quanto pedir como PJ";
  }
  if (mode === "pj_to_clt") {
    return "Calcular salário CLT equivalente";
  }
  return "Comparar propostas";
}

// Falha de rede chega como TypeError em ingles ("Failed to fetch"); nunca mostrar isso ao usuario.
function friendlyError(err: unknown) {
  if (err instanceof TypeError) {
    return "Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo.";
  }
  return err instanceof Error ? err.message : "Algo deu errado no cálculo. Tente de novo.";
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
