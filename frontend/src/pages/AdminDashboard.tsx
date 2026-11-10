import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BadgeCheck, BarChart3, Calculator, CalendarDays, Users, type LucideIcon } from "lucide-react";

import { Reveal } from "../lib/motion";

// Ainda nao ha endpoint de metricas: os numeros abaixo sao fixos, so para desenhar o painel.
const monthlyData = [
  { month: "Jan", users: 12, calculations: 80 },
  { month: "Fev", users: 18, calculations: 132 },
  { month: "Mar", users: 25, calculations: 180 },
  { month: "Abr", users: 41, calculations: 260 },
  { month: "Mai", users: 55, calculations: 340 },
  { month: "Jun", users: 72, calculations: 410 },
];

const users = [
  { name: "Ana Souza", email: "ana@email.com", createdAt: "04/06/2026", confirmed: true },
  { name: "Bruno Lima", email: "bruno@email.com", createdAt: "02/06/2026", confirmed: false },
];

export function AdminDashboard() {
  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Administração</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold sm:text-4xl">
            <BarChart3 size={28} className="text-mint" />
            Painel
          </h1>
        </div>
        <span className="badge bg-pj-soft text-pj-ink">Dados de exemplo, sem conexão com o banco</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Kpi label="Usuários totais" value="72" icon={Users} highlight />
        <Kpi label="Usuários confirmados" value="61" icon={BadgeCheck} />
        <Kpi label="Cálculos totais" value="1.382" icon={Calculator} />
        <Kpi label="Cálculos no mês" value="410" icon={CalendarDays} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Chart title="Usuários cadastrados por mês" dataKey="users" color="#17694a" />
        </Reveal>
        <Reveal delay={100}>
          <Chart title="Cálculos feitos por mês" dataKey="calculations" color="#2f7a52" />
        </Reveal>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Users size={18} className="text-mint" />
          <h2 className="font-semibold">Cadastros recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-paper/70 text-xs uppercase tracking-[0.08em] text-ink/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Nome</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Cadastro</th>
                <th className="px-5 py-3 font-semibold">Email confirmado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.email} className="transition hover:bg-paper/60">
                  <td className="px-5 py-3.5 font-medium">{user.name}</td>
                  <td className="px-5 py-3.5 text-ink/65">{user.email}</td>
                  <td className="px-5 py-3.5 text-ink/65">{user.createdAt}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${user.confirmed ? "bg-mint-soft text-mint-dark" : "bg-paper text-ink/55"}`}>
                      {user.confirmed ? "Sim" : "Pendente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Kpi({ label, value, icon: Icon, highlight = false }: { label: string; value: string; icon: LucideIcon; highlight?: boolean }) {
  return (
    <div
      className={`card flex flex-col items-start gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${
        highlight ? "border-forest bg-forest text-white" : ""
      }`}
    >
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${highlight ? "bg-lime text-forest-deep" : "bg-mint-soft text-mint"}`}>
        <Icon size={19} />
      </span>
      <span>
        <span className="num block font-display text-2xl font-bold leading-none">{value}</span>
        <span className={`mt-1 block text-xs ${highlight ? "text-white/65" : "text-ink/55"}`}>{label}</span>
      </span>
    </div>
  );
}

function Chart({ title, dataKey, color }: { title: string; dataKey: "users" | "calculations"; color: string }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e6de" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
            <Tooltip cursor={{ fill: "rgba(23, 105, 74, 0.06)" }} contentStyle={{ borderRadius: 16, border: "1px solid #e1e6de" }} />
            <Bar dataKey={dataKey} fill={color} radius={[10, 10, 10, 10]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
