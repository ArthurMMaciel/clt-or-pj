export type CLTPayload = {
    grossSalary: number;
    monthlyBenefits: number;
    monthlyTaxableBenefits: number;
    monthlyDiscounts: number;
    annualBonus: number;
    annualPlr: number;
    dependents: number;
    includeFgts: boolean;
    includeThirteenth: boolean;
    includeVacation: boolean;
    includeTerminationProtection: boolean;
};

export type PJPayload = {
    monthlyRate: number;
    taxRegime: string;
    effectiveTaxRate: number;
    grossRevenueLast12Months: number;
    payrollLast12Months: number;
    proLabore: number;
    proLaboreRate: number;
    paidMonthsPerYear: number;
    monthlyAccountingCost: number;
    monthlyHealthPlanCost: number;
    otherMonthlyCosts: number;
    vacationReserveRate: number;
    thirteenthReserveRate: number;
    fgtsReserveRate: number;
    emergencyReserveRate: number;
    contractRisk: string;
    noticeDays: number;
    hasPaidVacation: boolean;
    allowsOtherClients: boolean;
    requiresExclusivity: boolean;
};

export type ComparePayload = {
  clt: CLTPayload;
  pj: PJPayload;
};

export type MoneyBreakdown = {
  monthlyNet: number;
  annualNet: number;
  monthlyReserve: number;
  monthlyNetAfterReserve: number;
  annualReserve: number;
  monthlyGross: number;
  monthlyTaxableIncome: number;
  monthlyInss: number;
  monthlyIrrf: number;
  monthlyTaxes: number;
  monthlyCosts: number;
  annualThirteenthNet: number;
  annualVacationNet: number;
  annualFgts: number;
  annualTerminationValue: number;
  annualBenefits: number;
  annualBonusNet: number;
  annualPlrNet: number;
  annualProtectionValue: number;
  taxRegime: string;
  effectiveTaxRate: number;
  factorR: number;
  proLabore: number;
  paidMonthsPerYear: number;
  riskPremiumRate: number;
  requiredRiskPremiumPj: number;
};

export type CompareResult = {
  clt: MoneyBreakdown;
  pj: MoneyBreakdown;
  monthlyDifference: number;
  annualDifference: number;
  riskAdjustedGap: number;
  recommendedOption: "clt" | "pj" | "neutral";
  minimumPjToBreakEven: number;
  minimumPjRecommended: number;
  summary: string;
  reasons: string[];
};

export type EquivalentResult = {
  equivalentValue: number;
  recommendedValue: number;
  minimumBreakEven: number;
  reference: MoneyBreakdown;
  equivalent: MoneyBreakdown;
  summary: string;
  recommendedOption: "clt" | "pj" | "neutral";
  riskPremiumRate: number;
  monthlyDifference: number;
  annualDifference: number;
  riskAdjustedGap: number;
  minimumPjToBreakEven: number;
  minimumPjRecommended: number;
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
    throw new Error("Não foi possível calcular a comparação.");
  }

  return response.json();
}

export async function cltToPj(payload: { clt: CLTPayload; pj: Partial<PJPayload> }): Promise<EquivalentResult> {
  const response = await fetch(`${API_URL}/api/v1/calculations/clt-to-pj`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Não foi possível calcular o PJ equivalente.");
  }

  return response.json();
}

export async function pjToClt(payload: { pj: PJPayload }): Promise<EquivalentResult> {
  const response = await fetch(`${API_URL}/api/v1/calculations/pj-to-clt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Não foi possível calcular o CLT equivalente.");
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
    throw new Error("Não foi possível cadastrar.");
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
    throw new Error("Email ou senha inválidos.");
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
    throw new Error("Não foi possível carregar o histórico.");
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
    throw new Error("Não foi possível confirmar o email.");
  }

  return response.json();
}
