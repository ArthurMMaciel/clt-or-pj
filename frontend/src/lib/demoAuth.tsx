import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { clearToken, getToken } from "./api";

type DemoUser = {
  name: string;
  email: string;
  kind: "demo" | "real";
};

type AuthContextValue = {
  user: DemoUser | null;
  loginDemo: () => void;
  loginReal: (email: string) => void;
  logout: () => void;
};

const DEMO_USER_KEY = "clt_or_pj_demo_user";
const DEMO_USER: DemoUser = {
  name: "Arthur Maciel",
  email: "arthur@demo.com.br",
  kind: "demo",
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitialUser(): DemoUser | null {
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as DemoUser;
    } catch {
      localStorage.removeItem(DEMO_USER_KEY);
    }
  }

  if (getToken()) {
    return { name: "Sua conta", email: "Usuário autenticado", kind: "real" };
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(readInitialUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loginDemo() {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_USER));
        setUser(DEMO_USER);
      },
      loginReal(email: string) {
        const realUser: DemoUser = { name: email.split("@")[0] || "Sua conta", email, kind: "real" };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(realUser));
        setUser(realUser);
      },
      logout() {
        localStorage.removeItem(DEMO_USER_KEY);
        clearToken();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
