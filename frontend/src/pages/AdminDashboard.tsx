import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Users } from "lucide-react";

const monthlyData = [
  { month: "Jan", users: 12, calculations: 80 },
  { month: "Fev", users: 18, calculations: 132 },
  { month: "Mar", users: 25, calculations: 180 },
  { month: "Abr", users: 41, calculations: 260 },
  { month: "Mai", users: 55, calculations: 340 },
  { month: "Jun", users: 72, calculations: 410 },
];

const users = [
  { name: "Ana Souza", email: "ana@email.com", createdAt: "04/06/2026", confirmed: "Sim" },
  { name: "Bruno Lima", email: "bruno@email.com", createdAt: "02/06/2026", confirmed: "Nao" },
];

export function AdminDashboard() {
  return (
    <section className="grid gap-6">
      <div className="flex items-center gap-2">
        <BarChart3 size={22} />
        <h1 className="text-2xl font-semibold">Dashboard admin</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Usuarios totais" value="72" />
        <Card label="Usuarios confirmados" value="61" />
        <Card label="Calculos totais" value="1.382" />
        <Card label="Calculos no mes" value="410" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Usuarios cadastrados x mes" dataKey="users" color="#2f8f72" />
        <Chart title="Calculos feitos x mes" dataKey="calculations" color="#c46a4a" />
      </div>

      <div className="rounded-lg border border-ink/10 bg-white">
        <div className="flex items-center gap-2 border-b border-ink/10 px-5 py-4">
          <Users size={18} />
          <h2 className="font-semibold">Cadastrados/clientes</h2>
        </div>
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Confirmado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email} className="border-t border-ink/10">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.createdAt}</td>
                <td className="px-4 py-3">{user.confirmed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <span className="text-sm text-ink/60">{label}</span>
      <strong className="mt-2 block text-2xl">{value}</strong>
    </div>
  );
}

function Chart({ title, dataKey, color }: { title: string; dataKey: "users" | "calculations"; color: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
