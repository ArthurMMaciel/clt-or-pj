import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Scale, Sparkles } from "lucide-react";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./lib/demoAuth";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CalculatorPage } from "./pages/CalculatorPage";
import { ConfirmEmailPage } from "./pages/ConfirmEmailPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import "./styles.css";

const queryClient = new QueryClient();

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
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-1 text-sm">
            <span className="hidden sm:block">
              <NavItem to="/calculadora">Calculadora</NavItem>
            </span>
            {user ? <NavItem to="/historico">Histórico</NavItem> : null}
            <span
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-ink/40 sm:inline-flex"
              aria-disabled="true"
            >
              <Sparkles size={14} />
              IA em breve
            </span>
            {!user ? <NavItem to="/login">Entrar</NavItem> : null}
            {!user ? (
              <Link to="/cadastro" className="btn-primary ml-1 whitespace-nowrap px-3.5 py-2">
                Criar conta
              </Link>
            ) : null}
            {user ? (
              <div className="ml-1 flex items-center gap-3 border-l border-line pl-3">
                <div className="hidden text-right leading-tight md:block">
                  <span className="block text-xs font-semibold">{user.name}</span>
                  <span className="block text-[11px] text-ink/45">{user.kind === "demo" ? "Conta demo" : "Conta ativa"}</span>
                </div>
                <button className="btn-secondary px-3 py-2 text-xs" onClick={logout}>
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/calculadora" element={<CalculatorPage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/calculadora" replace />} />
          <Route path="/cadastro" element={!user ? <RegisterPage /> : <Navigate to="/calculadora" replace />} />
          <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
          <Route path="/historico" element={user ? <HistoryPage /> : <Navigate to="/login" replace />} />
          <Route path="/conversas" element={<ComingSoonAI />} />
          <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-lime">
        <Scale size={17} />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight">
        CLT <span className="text-ink/40">ou</span> PJ
      </span>
    </Link>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `whitespace-nowrap rounded-lg px-3 py-2 font-medium transition ${
          isActive ? "bg-ink/5 text-ink" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="max-w-xl leading-6">
          Simulações educativas com as regras de 2026. Não substituem a análise de um contador ou advogado.
        </p>
      </div>
    </footer>
  );
}

function ComingSoonAI() {
  return (
    <section className="card mx-auto max-w-xl p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-mint-soft text-mint">
        <Sparkles size={22} />
      </span>
      <p className="eyebrow mt-4">Em breve</p>
      <h1 className="mt-2 text-2xl font-bold">Análise com IA está chegando</h1>
      <p className="mt-3 leading-7 text-ink/65">
        Estamos preparando perguntas em chat e um checklist de pontos do contrato para levar ao seu advogado. Enquanto
        isso, a calculadora já responde quanto pedir e qual proposta rende mais.
      </p>
      <Link to="/calculadora" className="btn-primary mt-6">
        Ir para a calculadora
      </Link>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
