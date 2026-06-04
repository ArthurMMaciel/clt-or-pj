export type ComparePayload = {
  clt: {
    grossSalary: number;
    monthlyBenefits: number;
    monthlyDiscounts: number;
    annualBonus: number;
    includeFgts: boolean;
    includeThirteenth: boolean;
    includeVacation: boolean;
  };
  pj: {
    monthlyRate: number;
    effectiveTaxRate: number;
    monthlyAccountingCost: number;
    monthlyHealthPlanCost: number;
    otherMonthlyCosts: number;
    vacationReserveRate: number;
    thirteenthReserveRate: number;
    emergencyReserveRate: number;
  };
};

export type CompareResult = {
  clt: {
    monthlyNet: number;
    annualNet: number;
    monthlyReserve: number;
    annualReserve: number;
  };
  pj: {
    monthlyNet: number;
    annualNet: number;
    monthlyReserve: number;
    annualReserve: number;
  };
  monthlyDifference: number;
  annualDifference: number;
  recommendedOption: "clt" | "pj" | "neutral";
  minimumPjToBreakEven: number;
  reasons: string[];
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "clt_or_pj_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function compareContracts(payload: ComparePayload): Promise<CompareResult> {
  const response = await fetch(`${API_URL}/api/v1/calculations/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel calcular a comparacao.");
  }

  return response.json();
}

export async function register(payload: { name: string; email: string; password: string }) {
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel cadastrar.");
  }

  return response.json();
}

export async function login(payload: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Email ou senha invalidos.");
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

export async function fetchMyCalculations() {
  const response = await fetch(`${API_URL}/api/v1/me/calculations`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o historico.");
  }

  return response.json();
}

export async function confirmEmail(token: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/confirm-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel confirmar o email.");
  }

  return response.json();
}
