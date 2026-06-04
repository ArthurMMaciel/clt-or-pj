import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";

import { AdminDashboard } from "./pages/AdminDashboard";
import { CalculatorPage } from "./pages/CalculatorPage";
import { ConfirmEmailPage } from "./pages/ConfirmEmailPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import "./styles.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-paper text-ink">
          <header className="border-b border-ink/10 bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <NavLink to="/" className="text-lg font-semibold">
                CLT ou PJ
              </NavLink>
              <div className="flex gap-2 text-sm">
                <NavItem to="/">Calculadora</NavItem>
                <NavItem to="/historico">Historico</NavItem>
                <NavItem to="/login">Login</NavItem>
                <NavItem to="/cadastro">Cadastro</NavItem>
                <NavItem to="/admin">Admin</NavItem>
              </div>
            </nav>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-8">
            <Routes>
              <Route path="/" element={<CalculatorPage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />
              <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 ${isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5"}`
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
