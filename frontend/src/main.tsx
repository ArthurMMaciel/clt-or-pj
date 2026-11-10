import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";

import { APP_ROUTES, AppLayout } from "./components/AppLayout";
import { Logo } from "./components/Logo";
import { AuthProvider, useAuth } from "./lib/demoAuth";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CalculatorPage } from "./pages/CalculatorPage";
import { ConfirmEmailPage } from "./pages/ConfirmEmailPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LandingPage } from "./pages/LandingPage";
import { LegalDraftPage } from "./pages/LegalDraftPage";
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
  const { pathname } = useLocation();
  // A landing ocupa a largura toda (hero e CTA em blocos de borda a borda); as demais telas usam o container.
  const isLanding = pathname === "/";

  const routes = (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/calculadora" element={<CalculatorPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/calculadora" replace />} />
      <Route path="/cadastro" element={!user ? <RegisterPage /> : <Navigate to="/calculadora" replace />} />
      <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
      <Route path="/historico" element={user ? <HistoryPage /> : <Navigate to="/login" replace />} />
      <Route path="/conversas" element={<ComingSoonAI />} />
      <Route path="/privacidade" element={<LegalDraftPage kind="privacy" />} />
      <Route path="/termos" element={<LegalDraftPage kind="terms" />} />
      <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
    </Routes>
  );

  // Logado, as telas do produto abrem com sidebar; landing e paginas publicas mantem o header.
  if (user && APP_ROUTES.includes(pathname)) {
    return <AppLayout>{routes}</AppLayout>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-1 text-sm">
            <span className="hidden sm:block">
              <NavItem to="/calculadora">Calculadora</NavItem>
            </span>
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
              <>
                <NavItem to="/historico">Histórico</NavItem>
                <button className="btn-secondary ml-1 px-3 py-2 text-xs" onClick={logout}>
                  Sair
                </button>
              </>
            ) : null}
          </div>
        </nav>
      </header>

      <main className={isLanding ? "w-full flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10"}>{routes}</main>

    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `whitespace-nowrap rounded-full px-3.5 py-2 font-medium transition ${
          isActive ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
        }`
      }
    >
      {children}
    </NavLink>
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
