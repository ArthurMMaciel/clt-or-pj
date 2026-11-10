import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
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
  description: string;
  icon: LucideIcon;
}> = [
  { mode: "compare", label: "Comparar propostas", description: "Tenho uma CLT e uma PJ", icon: Scale },
  { mode: "clt_to_pj", label: "Quanto pedir como PJ", description: "Tenho só a proposta CLT", icon: ArrowLeftRight },
  { mode: "pj_to_clt", label: "Quanto vale em CLT", description: "Tenho só a proposta PJ", icon: ArrowLeftRight },
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
      if (isNarrow()) {
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    }
  }

  // Com abas, so a aba ativa aparece. Inputs escondidos continuam no FormData.
  const panelClass = (id: TabId) => (!hasTabs || tab === id ? "grid gap-5 animate-fade-up" : "hidden");

  const submitButton = (className: string) => (
    <button type="submit" form={FORM_ID} className={`btn-primary btn-lg w-full ${className}`} disabled={isLoading}>
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <TrendingUp size={18} />}
      {isLoading ? "Calculando..." : submitLabel(mode)}
    </button>
  );

  return (
    <div>
      <div className="mb-7 max-w-3xl">
        <p className="eyebrow">Simulador CLT x PJ · regras 2026</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Quanto sobra no ano em cada proposta?</h1>
        <p className="mt-3 text-ink/65">
          Impostos, 13º, férias, FGTS, PLR, Simples Nacional e margem de risco entram na conta. Os campos já vêm com um
          exemplo preenchido: troque pelos números da sua proposta.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Tipo de simulação"
        className="mb-6 grid gap-1.5 rounded-3xl border border-line bg-white p-1.5 shadow-card sm:grid-cols-3"
      >
        {modes.map((item) => {
          const active = mode === item.mode;
          const Icon = item.icon;
          return (
            <button
              key={item.mode}
              type="button"
              role="tab"
              aria-selected={active}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition duration-300 ${
                active ? "bg-forest text-white shadow-float" : "hover:bg-paper"
              }`}
              onClick={() => selectMode(item.mode)}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                  active ? "bg-lime text-forest-deep" : "bg-paper text-ink/55"
                }`}
              >
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${active ? "text-white" : "text-ink/80"}`}>{item.label}</span>
                <span className={`block text-xs ${active ? "text-white/60" : "text-ink/50"}`}>{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
                  <ArrowRight size={18} />
                </button>
              ) : null}
            </div>
          ) : null}

          {mode !== "clt_to_pj" ? (
            <div className={panelClass("pj")} role={hasTabs ? "tabpanel" : undefined} id="painel-pj">
              <PJFields prefill={initial.prefill} />
              <ContractFields />
              {hasTabs ? (
                <button type="button" className="btn-ghost w-fit px-0 hover:bg-transparent" onClick={() => goToTab("clt")}>
                  <ArrowLeft size={17} />
                  Voltar para a proposta CLT
                </button>
              ) : null}
            </div>
          ) : null}

          {mode === "clt_to_pj" ? (
            <p className="flex gap-2 rounded-2xl border border-line bg-white p-4 text-sm text-ink/65">
              <Info size={18} className="mt-0.5 shrink-0 text-ink/40" />
              Para o lado PJ usamos premissas padrão: Simples Nacional com Fator R, contador de R$ 250, plano de saúde de
              R$ 700, 12 meses faturados e margem de risco média.
            </p>
          ) : null}

          {/* No celular o botao fica no fim do formulario; no desktop ele mora na coluna do resultado. */}
          {!hasTabs || tab === "pj" ? submitButton("lg:hidden") : null}
        </form>

        <aside ref={resultRef} className="grid scroll-mt-24 content-start gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card hidden p-4 lg:block">
            {submitButton("")}
            <p className="hint mt-2.5 text-center">
              {hasTabs ? "Usa os valores das duas abas, CLT e PJ." : "O resultado aparece logo abaixo."}
            </p>
          </div>
          <ResultPanel key={resultVersion} mode={mode} result={result} error={error} />
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
  const items: Array<{ id: TabId; label: string; value: number; icon: LucideIcon; on: string; dot: string }> = [
    { id: "clt", label: "Proposta CLT", value: salary, icon: Building2, on: "border-clt bg-clt-soft text-clt-ink", dot: "bg-clt" },
    { id: "pj", label: "Proposta PJ", value: pjRate, icon: BriefcaseBusiness, on: "border-pj bg-pj-soft text-pj-ink", dot: "bg-pj" },
  ];

  return (
    <div role="tablist" aria-label="Propostas" className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`painel-${item.id}`}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition duration-300 ${
              isActive ? `${item.on} shadow-card` : "border-transparent bg-white text-ink/60 hover:border-line"
            }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isActive ? "bg-white/70" : "bg-paper"}`}
            >
              <item.icon size={17} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="num flex items-center gap-1.5 text-xs opacity-80">
                <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} aria-hidden />
                {BRL0.format(item.value)}
                {item.id === "pj" ? " /mês" : " bruto"}
              </span>
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
    <FormSection side="clt" title="Proposta CLT" icon={Building2}>
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

function PJFields({ prefill }: { prefill: Prefill }) {
  const [regime, setRegime] = useState("auto");

  return (
    <FormSection side="pj" title="Proposta PJ" icon={BriefcaseBusiness}>
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

function ContractFields() {
  return (
    <FormSection side="pj" title="Contrato PJ" icon={ShieldCheck}>
      <p className="hint -mt-2 mb-4">Define a margem de risco sobre o valor de empate.</p>
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
      <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} aria-hidden />
      <div className="mb-5 flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${accent}`}>
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
    <details className="group mt-5 rounded-2xl border border-line bg-paper/60">
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
        className="num"
        placeholder={placeholder}
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
      <div className="card animate-shake border-clay/30 p-6">
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
      <span className="grid h-12 w-12 animate-float-slow place-items-center rounded-2xl bg-forest text-lime">
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
    <div className="card animate-fade-up overflow-hidden">
      <div className={`border-b p-6 ${verdict.tone}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">Veredito</p>
        <h2 className={`mt-1 animate-pop-in text-2xl font-bold ${verdict.title}`} style={{ animationDelay: "150ms" }}>
          {verdict.label}
        </h2>
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
          <Stat label="Líquido no mês" value={<Money value={result.pj.monthlyNet} />} detail={`PJ · CLT ${BRL0.format(result.clt.monthlyNet)}`} />
          <Stat label="PJ para empatar" value={<Money value={result.minimumPjToBreakEven} />} detail="por mês" />
          <Stat
            label="PJ recomendado"
            value={<Money value={result.minimumPjRecommended} />}
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
    <div className="card animate-fade-up overflow-hidden">
      <div className={`border-b p-6 ${isCLTToPJ ? verdicts.pj.tone : verdicts.clt.tone}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
          {isCLTToPJ ? "Peça como PJ pelo menos" : "Salário CLT equivalente"}
        </p>
        <p className={`num mt-1 text-4xl font-bold ${isCLTToPJ ? verdicts.pj.title : verdicts.clt.title}`}>
          <Money value={isCLTToPJ ? result.minimumPjRecommended : result.equivalentValue} />
          <span className="text-base font-semibold text-ink/45"> /mês</span>
        </p>
        <p className="mt-2 text-sm leading-6 text-ink/70">{result.summary}</p>
      </div>

      <div className="p-6">
        <AnnualBars clt={cltAnnual} pj={pjAnnual} />

        <div className="mt-6 grid grid-cols-2 gap-3">
          {isCLTToPJ ? (
            <>
              <Stat label="Empate exato" value={<Money value={result.minimumPjToBreakEven} />} detail="por mês, sem margem" />
              <Stat label="Margem de risco" value={PERCENT.format(result.riskPremiumRate)} detail="sobre o empate" />
              <Stat label="Líquido PJ no mês" value={<Money value={result.equivalent.monthlyNet} />} detail="no valor recomendado" />
              <Stat label="Líquido CLT no mês" value={<Money value={result.reference.monthlyNet} />} detail="proposta atual" />
            </>
          ) : (
            <>
              <Stat label="Líquido CLT no mês" value={<Money value={result.equivalent.monthlyNet} />} detail="no salário equivalente" />
              <Stat label="Líquido PJ no mês" value={<Money value={result.reference.monthlyNet} />} detail="proposta atual" />
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
        {rows.map((row, index) => (
          <div key={row.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className={`font-semibold ${row.text}`}>{row.label}</span>
              <span className="num font-bold">
                <Money value={row.value} />
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-paper">
              <div
                className={`h-full origin-left animate-grow-x rounded-full ${row.bar}`}
                style={{ width: `${Math.max(4, (row.value / max) * 100)}%`, animationDelay: `${index * 150}ms` }}
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
    <div className={`rounded-2xl p-3.5 transition ${highlight ? "bg-forest text-white shadow-float" : "bg-paper"}`}>
      <p className={`text-xs font-medium ${highlight ? "text-white/65" : "text-ink/55"}`}>{label}</p>
      <p className={`num mt-1 text-lg font-bold ${highlight ? "text-lime" : "text-ink"}`}>{value}</p>
      {detail ? <p className={`text-xs ${highlight ? "text-white/55" : "text-ink/45"}`}>{detail}</p> : null}
    </div>
  );
}

function Money({ value }: { value: number }) {
  return <>{BRL0.format(useCountUp(value))}</>;
}

function SetAside({ value }: { value: number }) {
  return (
    <p className="mt-4 flex gap-2 rounded-2xl border border-pj/20 bg-pj-soft/60 p-3.5 text-sm text-ink/70">
      <Info size={17} className="mt-0.5 shrink-0 text-pj" />
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
