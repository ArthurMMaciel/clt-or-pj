import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchMyCalculations, getToken } from "../lib/api";
import { useAuth } from "../lib/demoAuth";

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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Sua conta</p>
          <h1 className="mt-2 text-[1.9rem] leading-tight sm:text-[2.4rem]">Histórico de simulações</h1>
          {rows.length > 0 ? (
            <p className="num mt-1.5 text-sm text-muted">
              {rows.length} {rows.length === 1 ? "simulação" : "simulações"} · PJ rendeu mais em {pjWins} · CLT rendeu mais em{" "}
              {cltWins}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {user?.kind === "demo" ? <span className="badge bg-paper text-muted">Dados demonstrativos</span> : null}
          <Link to="/calculadora" className="btn-primary">
            <Plus size={17} aria-hidden />
            Nova simulação
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-4 text-sm text-clay" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <HistorySkeleton /> : null}

      {!loading && !error && rows.length === 0 ? <EmptyHistory /> : null}

      {rows.length > 0 ? (
        <>
          {/* Desktop: tabela, para comparar varias simulacoes de relance. */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Simulações salvas, da mais recente para a mais antiga</caption>
              <thead className="border-b border-line bg-paper/60 text-xs uppercase tracking-[0.1em] text-subtle">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Data</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Tipo</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Salário CLT</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Nota PJ</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Resultado</th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => {
                  const view = describe(row);
                  return (
                    <tr key={row.id} className="hover:bg-paper/50">
                      <td className="num whitespace-nowrap px-5 py-3 text-muted">{formatDate(row.created_at)}</td>
                      <td className="px-5 py-3 font-medium">{formatType(row.type)}</td>
                      <td className="num px-5 py-3 text-right">{view.showCLT ? BRL0.format(view.salary) : <Dash />}</td>
                      <td className="num px-5 py-3 text-right">{view.showPJ ? BRL0.format(view.pjRate) : <Dash />}</td>
                      <td className="px-5 py-3">
                        <RecommendationBadge recommendation={row.recommendation} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={view.href}
                          className="inline-flex min-h-[2.25rem] items-center gap-1.5 whitespace-nowrap rounded-md px-2 font-semibold text-mint hover:bg-mint-soft hover:text-mint-dark"
                        >
                          Reabrir
                          <ArrowRight size={15} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Celular: lista com os mesmos dados. */}
          <ul className="grid gap-2 md:hidden">
            {rows.map((row) => (
              <li key={row.id}>
                <HistoryItem row={row} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

type RowView = { salary: number; pjRate: number; showCLT: boolean; showPJ: boolean; href: string };

function describe(row: Calculation): RowView {
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

  return { salary, pjRate, showCLT, showPJ, href: `/calculadora?${params.toString()}` };
}

function HistoryItem({ row }: { row: Calculation }) {
  const view = describe(row);

  return (
    <Link to={view.href} className="card flex items-center gap-3 p-4 transition-colors duration-fast hover:border-ink/25">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold">{formatType(row.type)}</span>
          <RecommendationBadge recommendation={row.recommendation} />
        </div>
        <p className="num mt-1 text-sm text-muted">
          {formatDate(row.created_at)}
          {view.showCLT ? ` · CLT ${BRL0.format(view.salary)}` : ""}
          {view.showPJ ? ` · PJ ${BRL0.format(view.pjRate)}` : ""}
        </p>
      </div>
      <ArrowRight size={18} className="shrink-0 text-subtle" aria-label="Reabrir na calculadora" />
    </Link>
  );
}

function Dash() {
  return (
    <span className="text-subtle" aria-label="não se aplica">
      —
    </span>
  );
}

function EmptyHistory() {
  return (
    <div className="card border-dashed bg-transparent px-6 py-12 text-center">
      <h2 className="text-2xl">Nenhuma simulação salva ainda</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Simule com a conta aberta e cada resultado aparece aqui, pronto para reabrir quando a negociação andar.
      </p>
      <Link to="/calculadora" className="btn-primary btn-lg mt-6">
        Fazer a primeira simulação
        <ArrowRight size={18} aria-hidden />
      </Link>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="card overflow-hidden" role="status" aria-label="Carregando histórico">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex animate-pulse items-center gap-4 border-b border-line px-5 py-4 last:border-b-0">
          <div className="h-3 w-20 rounded bg-paper" />
          <div className="h-3 w-32 rounded bg-paper" />
          <div className="ml-auto h-3 w-24 rounded bg-paper" />
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const styles: Record<string, string> = {
    clt: "bg-clt-soft text-clt-ink",
    pj: "bg-pj-soft text-pj-ink",
    neutral: "bg-paper text-muted",
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
