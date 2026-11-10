import { Calculator, History, LogOut, Menu, Plus, Sparkles, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../lib/demoAuth";
import { Logo } from "./Logo";

// Rotas que, com usuario logado, abrem dentro do layout com sidebar.
export const APP_ROUTES = ["/calculadora", "/historico", "/conversas", "/admin"];

type NavEntry = { to: string; label: string; icon: LucideIcon; soon?: boolean };

const groups: Array<{ title: string; items: NavEntry[] }> = [
  { title: "Simular", items: [{ to: "/calculadora", label: "Calculadora", icon: Calculator }] },
  { title: "Sua conta", items: [{ to: "/historico", label: "Histórico", icon: History }] },
  { title: "Em breve", items: [{ to: "/conversas", label: "Análise com IA", icon: Sparkles, soon: true }] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Fecha o menu do celular ao trocar de tela.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-white lg:block">
        <SidebarPanel />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/70 bg-paper/85 px-4 py-3 backdrop-blur-md lg:hidden">
        <Logo />
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white transition hover:shadow-sm"
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="app-drawer"
          onClick={() => setOpen(true)}
        >
          <Menu size={19} />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-forest-deep/40 backdrop-blur-sm"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="app-drawer"
            className="absolute inset-y-0 left-0 w-[18rem] max-w-[85vw] animate-drawer-in overflow-hidden rounded-r-3xl bg-white shadow-float"
          >
            <SidebarPanel onClose={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:px-12">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}

function SidebarPanel({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const initials = (user?.name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <nav className="flex h-full flex-col overflow-y-auto p-5" aria-label="Principal">
      <div className="flex items-center justify-between px-1">
        <Logo />
        {onClose ? (
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-ink/50 hover:bg-paper hover:text-ink"
            aria-label="Fechar menu"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <Link to="/calculadora" className="btn-primary mt-6 w-full">
        <Plus size={17} />
        Nova simulação
      </Link>

      <div className="mt-6 grid gap-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">{group.title}</p>
            <ul className="mt-1.5 grid gap-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive ? "bg-mint-soft text-mint-dark" : item.soon ? "text-ink/45 hover:bg-paper" : "text-ink/70 hover:bg-paper hover:text-ink"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                            isActive ? "bg-mint text-white" : "bg-paper text-ink/55 group-hover:text-ink"
                          }`}
                        >
                          <item.icon size={16} />
                        </span>
                        <span className="truncate">{item.label}</span>
                        {item.soon ? (
                          <span className="badge ml-auto shrink-0 bg-lime-soft px-2 py-0.5 text-[10px] text-forest">Breve</span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-2xl bg-paper p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest font-display text-sm font-bold text-lime">
            {initials}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">{user?.name}</span>
            <span className="block text-xs text-ink/50">{user?.kind === "demo" ? "Conta demo" : "Conta ativa"}</span>
          </span>
        </div>
        <button type="button" className="btn-secondary mt-3 w-full py-2 text-xs" onClick={logout}>
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </nav>
  );
}
