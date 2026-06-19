import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./lib/demoAuth";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CalculatorPage } from "./pages/CalculatorPage";
import { ConfirmEmailPage } from "./pages/ConfirmEmailPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import "./styles.css";

const queryClient = new QueryClient();
const ConversationsPage = lazy(() =>
  import("./pages/ConversationsPage").then((module) => ({ default: module.ConversationsPage })),
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <NavLink to="/" className="shrink-0 text-lg font-semibold">
            CLT ou PJ
          </NavLink>
          <div className="flex items-center gap-1 overflow-x-auto text-sm">
            <NavItem to="/">Calculadora</NavItem>
            {user ? <NavItem to="/historico">Histórico</NavItem> : null}
            {user ? <NavItem to="/conversas">Conversas</NavItem> : null}
            {!user ? <NavItem to="/login">Login</NavItem> : null}
            {!user ? <NavItem to="/cadastro">Cadastro</NavItem> : null}
            {user ? (
              <div className="ml-1 hidden items-center gap-2 border-l border-ink/10 pl-3 md:flex">
                <div className="text-right leading-tight">
                  <span className="block text-xs font-semibold">{user.name}</span>
                  <span className="block text-[10px] text-ink/45">
                    {user.kind === "demo" ? "Conta demo" : "Conta ativa"}
                  </span>
                </div>
                <button className="rounded-md border border-ink/10 px-3 py-2 text-xs hover:bg-ink/5" onClick={logout}>
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<CalculatorPage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/conversas" replace />} />
          <Route path="/cadastro" element={!user ? <RegisterPage /> : <Navigate to="/conversas" replace />} />
          <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
          <Route path="/historico" element={user ? <HistoryPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/conversas"
            element={
              user ? (
                <Suspense fallback={<div className="rounded-xl bg-white p-6">Carregando conversas...</div>}>
                  <ConversationsPage />
                </Suspense>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `whitespace-nowrap rounded-md px-3 py-2 ${isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5"}`
      }
    >
      {children}
    </NavLink>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
