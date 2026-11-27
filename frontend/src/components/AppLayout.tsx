import { Calculator, History, LogOut, Menu, Sparkles, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../lib/demoAuth";
import { Logo } from "./Logo";

// Rotas que, com usuario logado, abrem dentro do layout com sidebar.
export const APP_ROUTES = ["/calculadora", "/historico", "/conversas", "/admin"];

type NavEntry = { to: string; label: string; icon: LucideIcon; soon?: boolean };

const groups: Array<{ title: string; items: NavEntry[] }> = [
  { title: "Simular", items: [{ to: "/calculadora", label: "Calculadora", icon: Calculator }] },
  { title: "Histórico", items: [{ to: "/historico", label: "Simulações", icon: History }] },
  { title: "Em breve", items: [{ to: "/conversas", label: "Análise com IA", icon: Sparkles, soon: true }] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Ao fechar a gaveta, o foco volta para o botao que a abriu.
  useEffect(() => {
    if (wasOpen.current && !open) menuButton.current?.focus();
    wasOpen.current = open;
  }, [open]);

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

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-2.5 backdrop-blur-sm lg:hidden">
        <Logo />
        <button
          ref={menuButton}
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white transition-colors hover:bg-paper"
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="app-drawer"
          onClick={() => setOpen(true)}
        >
          <Menu size={19} aria-hidden />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-forest-deep/40"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="app-drawer"
            className="absolute inset-y-0 left-0 w-[18rem] max-w-[85vw] animate-drawer-in overflow-hidden bg-white shadow-overlay"
          >
            <SidebarPanel onClose={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main id="conteudo" className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:px-12">
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
            autoFocus
            className="grid h-9 w-9 place-items-center rounded-md text-subtle hover:bg-paper hover:text-ink"
            aria-label="Fechar menu"
            onClick={onClose}
          >
            <X size={18} aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">{group.title}</p>
            <ul className="mt-1.5 grid gap-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `relative flex min-h-[2.5rem] items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-fast ${
                        isActive
                          ? "bg-paper text-ink before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r before:bg-mint before:content-['']"
                          : item.soon
                            ? "text-subtle hover:bg-paper"
                            : "text-muted hover:bg-paper hover:text-ink"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={17} className={isActive ? "text-mint" : "text-subtle"} aria-hidden />
                        <span className="truncate">{item.label}</span>
                        {item.soon ? (
                          <span className="badge ml-auto shrink-0 bg-paper px-1.5 text-[11px] text-subtle">Em breve</span>
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

      <div className="mt-auto border-t border-line pt-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-semibold text-lime" aria-hidden>
            {initials}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">{user?.name}</span>
            <span className="block text-xs text-subtle">{user?.kind === "demo" ? "Conta demo" : "Conta ativa"}</span>
          </span>
        </div>
        <button type="button" className="btn-secondary mt-3 w-full" onClick={logout}>
          <LogOut size={15} aria-hidden />
          Sair
        </button>
      </div>
    </nav>
  );
}
