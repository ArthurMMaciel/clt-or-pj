import { Clock, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchMyCalculations, getToken } from "../lib/api";

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

export function HistoryPage() {
  const [rows, setRows] = useState<Calculation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setError("Entre com sua conta para ver o histórico.");
      return;
    }

    fetchMyCalculations()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro inesperado."));
  }, []);

  return (
    <section>
      <div className="mb-6 flex items-center gap-2">
        <Clock size={20} />
        <h1 className="text-2xl font-semibold">Histórico do usuário</h1>
      </div>
      {error ? <p className="mb-4 rounded-md border border-clay/30 bg-white p-4 text-clay">{error}</p> : null}
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Resultado</th>
              <th className="px-4 py-3">CLT</th>
              <th className="px-4 py-3">PJ</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-ink/10">
                <td className="px-4 py-3">{formatType(row.type)}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">{formatRecommendation(row.recommendation)}</td>
                <td className="px-4 py-3">{BRL.format(row.input_json.clt?.grossSalary ?? 0)}</td>
                <td className="px-4 py-3">{BRL.format(row.input_json.pj?.monthlyRate ?? 0)}</td>
                <td className="px-4 py-3">
                  <button className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-white">
                    <Copy size={16} />
                    Duplicar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!error && rows.length === 0 ? (
          <p className="p-5 text-sm text-ink/70">Nenhuma simulação salva ainda.</p>
        ) : null}
      </div>
    </section>
  );
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
    neutral: "Neutro",
  };
  return labels[recommendation] ?? recommendation;
}
