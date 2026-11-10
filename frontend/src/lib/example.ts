// Resultado do motor mvp-2 para CLT R$ 10.000 + R$ 1.000 de beneficios x PJ R$ 15.000,
// com as premissas padrao da calculadora (pro-labore, faturamento e folha automaticos).
// Conferido chamando /api/v1/calculations/compare com quickCLT/quickPJ (2026-11-10).
export const EXAMPLE = {
  salary: 10000,
  benefits: 1000,
  pjRate: 15000,
  cltAnnual: 126101,
  pjAnnual: 152256,
  breakEven: 12603,
  recommended: 13989,
  margin: 0.11,
  pjMonthlyNet: 12688,
  pjMonthlyReserve: 5199,
  pjMonthlyFree: 7489,
};
