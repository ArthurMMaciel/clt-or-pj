import { ArrowRight, BriefcaseBusiness, Building2, Calculator, Plus, RotateCcw, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { HillsArt } from "../components/HillsArt";
import { fetchMyCalculations, getToken } from "../lib/api";
import { useAuth } from "../lib/demoAuth";
import { Reveal } from "../lib/motion";

type Calculation = {
  id: string;
  type: string;
  created_at: string;
  recommendation: string;
  input_json: {
    clt?: { grossSalary?: number; monthlyBenefits?: number };
    pj?: { monthlyRate?: number };
  };
};

const BRL0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const demoCalculations: Calculation[] = [
  {
    id: "demo-1",
    type: "compare",
    created_at: "2026-06-18T13:20:00Z",
    recommendation: "pj",
    input_json: { clt: { grossSalary: 10000 }, pj: { monthlyRate: 15500 } },
  },
  {
    id: "demo-2",
    type: "clt_to_pj",
    created_at: "2026-06-12T10:00:00Z",
    recommendation: "pj",
    input_json: { clt: { grossSalary: 8500 }, pj: { monthlyRate: 14200 } },
  },
  {
    id: "demo-3",
    type: "pj_to_clt",
    created_at: "2026-06-08T15:45:00Z",
    recommendation: "clt",
    input_json: { clt: { grossSalary: 9200 }, pj: { monthlyRate: 13000 } },
  },
];

export function HistoryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.kind === "demo") {
      setRows(demoCalculations);
      setError(null);
      setLoading(false);
      return;
    }

    if (!getToken()) {
      setError("Entre com sua conta para ver o histórico.");
      setLoading(false);
      return;
    }

    fetchMyCalculations()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro inesperado."))
      .finally(() => setLoading(false));
  }, [user]);

  const pjWins = rows.filter((row) => row.recommendation === "pj").length;
  const cltWins = rows.filter((row) => row.recommendation === "clt").length;

  return (
    <section>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Sua conta</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Histórico de simulações</h1>
        </div>
        <div className="flex items-center gap-2">
          {user?.kind === "demo" ? <span className="badge bg-lime-soft text-forest">Dados demonstrativos</span> : null}
          <Link to="/calculadora" className="btn-primary">
            <Plus size={17} />
            Nova simulação
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mb-4 animate-shake rounded-2xl border border-clay/25 bg-clay/5 p-4 text-sm text-clay">{error}</p>
      ) : null}

      {loading ? <HistorySkeleton /> : null}

      {!loading && !error && rows.length === 0 ? <EmptyHistory /> : null}

      {rows.length > 0 ? (
        <>
          <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
            <Summary label="Simulações" value={String(rows.length)} icon={Calculator} tone="bg-forest text-lime" />
            <Summary label="PJ rendeu mais" value={String(pjWins)} icon={BriefcaseBusiness} tone="bg-pj-soft text-pj" />
            <Summary label="CLT rendeu mais" value={String(cltWins)} icon={Building2} tone="bg-clt-soft text-clt" />
          </div>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row, index) => (
              <Reveal as="li" key={row.id} delay={index * 70}>
                <HistoryCard row={row} />
              </Reveal>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function Summary({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Calculator; tone: string }) {
  return (
    <div className="card flex flex-col items-start gap-2 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-2xl sm:h-11 sm:w-11 ${tone}`}>
        <Icon size={19} />
      </span>
      <span>
        <span className="num block font-display text-2xl font-bold leading-none">{value}</span>
        <span className="mt-1 block text-xs text-ink/55">{label}</span>
      </span>
    </div>
  );
}

function HistoryCard({ row }: { row: Calculation }) {
  const salary = row.input_json.clt?.grossSalary ?? 0;
  const benefits = row.input_json.clt?.monthlyBenefits ?? 0;
  // No modo "quanto pedir como PJ" o lado PJ e premissa (valor 1), entao nao exibimos.
  const pjRate = (row.input_json.pj?.monthlyRate ?? 0) > 1 ? row.input_json.pj!.monthlyRate! : 0;
  const showCLT = row.type !== "pj_to_clt" && salary > 0;
  const showPJ = row.type !== "clt_to_pj" && pjRate > 0;

  const params = new URLSearchParams({ modo: row.type });
  if (showCLT) {
    params.set("salario", String(salary));
    if (benefits > 0) params.set("beneficios", String(benefits));
  }
  if (showPJ) params.set("nota", String(pjRate));

  return (
    <article className="card group flex h-full flex-col p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-paper text-ink/60">
            <Scale size={18} />
          </span>
          <span className="leading-tight">
            <span className="block font-semibold">{formatType(row.type)}</span>
            <span className="block text-xs text-ink/50">{new Date(row.created_at).toLocaleDateString("pt-BR")}</span>
          </span>
        </div>
        <RecommendationBadge recommendation={row.recommendation} />
      </div>

      <dl className="mt-5 grid flex-1 content-start gap-2 text-sm">
        {showCLT ? <Value side="clt" label="Salário CLT" value={salary} /> : null}
        {showPJ ? <Value side="pj" label="Nota PJ" value={pjRate} /> : null}
      </dl>

      <Link
        to={`/calculadora?${params.toString()}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mint hover:text-mint-dark"
      >
        <RotateCcw size={15} />
        Abrir de novo na calculadora
        <ArrowRight size={15} className="transition group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

function Value({ side, label, value }: { side: "clt" | "pj"; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-paper px-3 py-2">
      <dt className="flex items-center gap-2 text-ink/60">
        <span className={`h-2 w-2 rounded-full ${side === "clt" ? "bg-clt" : "bg-pj"}`} aria-hidden />
        {label}
      </dt>
      <dd className="num font-semibold">{BRL0.format(value)}</dd>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="card relative isolate overflow-hidden px-6 pb-40 pt-12 text-center sm:pb-44">
      <HillsArt className="absolute inset-x-0 bottom-0 -z-10 h-40 w-full opacity-90 sm:h-44" />
      <span className="mx-auto grid h-14 w-14 animate-float place-items-center rounded-2xl bg-forest text-lime shadow-float">
        <Calculator size={24} />
      </span>
      <h2 className="mt-5 text-2xl font-bold">Nenhuma simulação salva ainda</h2>
      <p className="mx-auto mt-2 max-w-md text-ink/60">
        Simule com a conta aberta e cada resultado aparece aqui, pronto para reabrir quando a negociação andar.
      </p>
      <Link to="/calculadora" className="btn-primary btn-lg mt-6">
        Fazer a primeira simulação
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Carregando histórico">
      {[0, 1, 2].map((item) => (
        <div key={item} className="card h-48 animate-pulse p-5">
          <div className="h-10 w-1/2 rounded-2xl bg-paper" />
          <div className="mt-6 h-9 rounded-xl bg-paper" />
          <div className="mt-2 h-9 rounded-xl bg-paper" />
        </div>
      ))}
    </div>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const styles: Record<string, string> = {
    clt: "bg-clt-soft text-clt-ink",
    pj: "bg-pj-soft text-pj-ink",
    neutral: "bg-paper text-ink/60",
  };
  return <span className={`badge ${styles[recommendation] ?? styles.neutral}`}>{formatRecommendation(recommendation)}</span>;
}

function formatType(type: string) {
  const labels: Record<string, string> = {
    compare: "CLT x PJ",
    clt_to_pj: "Quanto pedir como PJ",
    pj_to_clt: "Quanto vale em CLT",
  };
  return labels[type] ?? type;
}

function formatRecommendation(recommendation: string) {
  const labels: Record<string, string> = {
    clt: "CLT rende mais",
    pj: "PJ rende mais",
    neutral: "Empate",
  };
  return labels[recommendation] ?? recommendation;
}
