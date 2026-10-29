import { Clock, Plus } from "lucide-react";
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
    clt?: { grossSalary?: number };
    pj?: { monthlyRate?: number };
  };
};

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.kind === "demo") {
      setRows(demoCalculations);
      setError(null);
      return;
    }

    if (!getToken()) {
      setError("Entre com sua conta para ver o histórico.");
      return;
    }

    fetchMyCalculations()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro inesperado."));
  }, [user]);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Sua conta</p>
          <h1 className="mt-2 text-3xl font-extrabold">Histórico de simulações</h1>
        </div>
        <div className="flex items-center gap-2">
          {user?.kind === "demo" ? <span className="badge bg-lime/70 text-ink">Dados demonstrativos</span> : null}
          <Link to="/calculadora" className="btn-primary">
            <Plus size={17} />
            Nova simulação
          </Link>
        </div>
      </div>
      {error ? <p className="mb-4 rounded-xl border border-clay/25 bg-clay/5 p-4 text-sm text-clay">{error}</p> : null}
      {!error && rows.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-mint-soft text-mint">
            <Clock size={22} />
          </span>
          <h2 className="mt-4 text-lg font-bold">Nenhuma simulação salva ainda</h2>
          <p className="mt-2 text-sm text-ink/60">Simule logado e o resultado aparece aqui automaticamente.</p>
        </div>
      ) : null}
      {rows.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-paper/70 text-xs uppercase tracking-[0.08em] text-ink/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Simulação</th>
                <th className="px-5 py-3 font-semibold">Data</th>
                <th className="px-5 py-3 font-semibold">CLT</th>
                <th className="px-5 py-3 font-semibold">PJ</th>
                <th className="px-5 py-3 font-semibold">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-paper/60">
                  <td className="px-5 py-4 font-medium">{formatType(row.type)}</td>
                  <td className="px-5 py-4 text-ink/60">{new Date(row.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="num px-5 py-4">{BRL.format(row.input_json.clt?.grossSalary ?? 0)}</td>
                  <td className="num px-5 py-4">{BRL.format(row.input_json.pj?.monthlyRate ?? 0)}</td>
                  <td className="px-5 py-4">
                    <RecommendationBadge recommendation={row.recommendation} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
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
    clt_to_pj: "CLT para PJ",
    pj_to_clt: "PJ para CLT",
  };
  return labels[type] ?? type;
}

function formatRecommendation(recommendation: string) {
  const labels: Record<string, string> = {
    clt: "CLT",
    pj: "PJ",
    neutral: "Empate",
  };
  return labels[recommendation] ?? recommendation;
}
