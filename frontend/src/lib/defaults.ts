import type { CLTPayload, PJPayload } from "./api";

// Premissas padrao usadas fora do formulario completo (mini-simulador da landing e modo "quanto pedir como PJ").
// Pro-labore e faturamento 12m em zero fazem o motor derivar os valores (28% da nota e nota x 12).

export const PRO_LABORE_RATE = 0.28;

export function quickCLT(grossSalary: number, monthlyBenefits: number): CLTPayload {
  return {
    grossSalary,
    monthlyBenefits,
    monthlyTaxableBenefits: 0,
    monthlyDiscounts: 0,
    annualBonus: 0,
    annualPlr: 0,
    dependents: 0,
    includeFgts: true,
    includeThirteenth: true,
    includeVacation: true,
    includeTerminationProtection: true,
  };
}

export function defaultPJAssumptions(overrides: Partial<PJPayload> = {}): PJPayload {
  return {
    monthlyRate: 1,
    taxRegime: "auto",
    effectiveTaxRate: 0.06,
    grossRevenueLast12Months: 0,
    payrollLast12Months: 0,
    proLabore: 0,
    proLaboreRate: PRO_LABORE_RATE,
    paidMonthsPerYear: 12,
    monthlyAccountingCost: 250,
    monthlyHealthPlanCost: 700,
    otherMonthlyCosts: 0,
    vacationReserveRate: 0.0833,
    thirteenthReserveRate: 0.0833,
    fgtsReserveRate: 0.08,
    emergencyReserveRate: 0.1,
    contractRisk: "medium",
    noticeDays: 30,
    hasPaidVacation: false,
    allowsOtherClients: true,
    requiresExclusivity: false,
    ...overrides,
  };
}

// Mesmas premissas que o formulario da calculadora traz preenchidas: pausa remunerada ligada e
// pro-labore/faturamento/folha automaticos (zero). Com zero o motor usa 28% da nota, nota x 12 e
// pro-labore x 12, inclusive ao procurar o valor de empate. Precisa ser igual ao formulario, senao o
// "PJ para empatar" da landing diverge do da calculadora.
export function quickPJ(monthlyRate: number): PJPayload {
  return defaultPJAssumptions({ monthlyRate, hasPaidVacation: true });
}
