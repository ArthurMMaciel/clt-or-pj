import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    // --sticky-offset: altura do header fixo, usada pelo painel de resultado da calculadora.
    <div className="flex min-h-screen flex-col bg-paper text-ink [--sticky-offset:3.6rem]">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
        <nav className="mx-auto flex h-[3.6rem] max-w-6xl items-center justify-between gap-3 px-4" aria-label="Principal">
          <Logo />
          <div className="flex items-center gap-1 text-sm">
            <span className="hidden sm:block">
              <NavItem to="/calculadora">Calculadora</NavItem>
            </span>
            {!user ? <NavItem to="/login">Entrar</NavItem> : null}
            {!user ? (
              <Link to="/cadastro" className="btn-primary ml-1 whitespace-nowrap px-3.5">
                Criar conta
              </Link>
            ) : null}
            {user ? (
              <>
                <NavItem to="/historico">Histórico</NavItem>
                <button className="btn-secondary ml-1 px-3" onClick={logout}>
                  Sair
                </button>
              </>
            ) : null}
          </div>
        </nav>
      </header>

      <main id="conteudo" className={isLanding ? "w-full flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10"}>
        {routes}
      </main>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex min-h-[2.5rem] items-center whitespace-nowrap rounded-md px-3 font-medium transition-colors duration-fast ${
          isActive ? "text-ink underline decoration-mint decoration-2 underline-offset-[6px]" : "text-muted hover:bg-ink/5 hover:text-ink"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function ComingSoonAI() {
  return (
    <section className="max-w-xl">
      <p className="eyebrow">Em breve</p>
      <h1 className="mt-2 text-[1.9rem] leading-tight">Análise com IA</h1>
      <p className="mt-3 leading-7 text-muted">
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
