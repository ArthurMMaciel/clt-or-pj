package calculator

import (
	"math"
	"testing"
)

func assertMoney(t *testing.T, label string, got, want float64) {
	t.Helper()
	if math.Abs(got-want) > 0.01 {
		t.Fatalf("%s: got %.2f, want %.2f", label, got, want)
	}
}

func TestCLTMonthlyTaxes2026(t *testing.T) {
	cases := []struct {
		gross, inss, irrf float64
	}{
		{gross: 4000, inss: 368.60, irrf: 0},        // desconto simplificado + reducao zeram o IR
		{gross: 5000, inss: 501.51, irrf: 0},        // limite da isencao da Lei 15.270
		{gross: 6000, inss: 641.51, irrf: 385.10},   // reducao parcial sobre o bruto
		{gross: 7000, inss: 781.51, irrf: 754.75},   // reducao parcial sobre o bruto
		{gross: 7350, inss: 830.51, irrf: 884.13},   // fim da reducao
		{gross: 10000, inss: 988.09, irrf: 1569.55}, // teto do INSS, sem reducao
	}

	for _, tc := range cases {
		result := calculateCLT(CLTInput{GrossSalary: tc.gross}, DefaultParameters())
		assertMoney(t, "INSS", result.MonthlyINSS, tc.inss)
		assertMoney(t, "IRRF", result.MonthlyIRRF, tc.irrf)
	}
}

func TestIRRFUsesDependentsWhenBetterThanSimplifiedDiscount(t *testing.T) {
	// 7.000 com 2 dependentes: INSS 781,51 + 379,18 > 607,20.
	assertMoney(t, "IRRF", calculateIRRF(7000, 781.51, 2), 650.48)
}

func TestPLRUsesExclusiveTable(t *testing.T) {
	assertMoney(t, "PLR isenta", calculatePLRTax(8000), 0)
	assertMoney(t, "PLR 12 mil", calculatePLRTax(12000), 439.65)
	assertMoney(t, "PLR 20 mil", calculatePLRTax(20000), 2333.42)

	result := calculateCLT(CLTInput{GrossSalary: 10000, AnnualPLR: 12000}, DefaultParameters())
	assertMoney(t, "PLR liquida", result.AnnualPLRNet, 11560.35)
	assertMoney(t, "FGTS sem PLR", result.AnnualFGTS, 0)
}

func TestBonusIsTaxedAsSalaryAndAddsFGTS(t *testing.T) {
	base := CLTInput{GrossSalary: 10000, IncludeFGTS: true}
	withBonus := base
	withBonus.AnnualBonus = 10000

	plain := calculateCLT(base, DefaultParameters())
	result := calculateCLT(withBonus, DefaultParameters())

	// Salario ja acima do teto do INSS: o bonus paga so IR marginal de 27,5%.
	assertMoney(t, "bonus liquido", result.AnnualBonusNet, 7250)
	assertMoney(t, "FGTS do bonus", result.AnnualFGTS-plain.AnnualFGTS, 800)
}

func TestPJAnnualIgnoresReservesAndKeepsFixedCostsAllYear(t *testing.T) {
	pj := PJInput{
		MonthlyRate:           15000,
		TaxRegime:             taxRegimeAuto,
		ProLaboreRate:         0.28,
		PaidMonthsPerYear:     12,
		MonthlyAccountingCost: 250,
		MonthlyHealthPlanCost: 700,
	}
	params := DefaultParameters()

	// DAS 6% = 900; INSS pro-labore 11% de 4.200 = 462; IRRF 0.
	result := calculatePJ(pj, params)
	assertMoney(t, "liquido mensal", result.MonthlyNet, 12688)
	assertMoney(t, "anual 12 meses", result.AnnualNet, 152256)
	assertMoney(t, "reserva sugerida", result.MonthlyReserve, 5200)
	assertMoney(t, "liquido apos reserva", result.MonthlyNetAfterReserve, 7488)

	noReserves := pj
	noReserves.VacationReserveRate = 1e-9
	noReserves.ThirteenthReserveRate = 1e-9
	noReserves.FGTSReserveRate = 1e-9
	noReserves.EmergencyReserveRate = 1e-9
	assertMoney(t, "anual sem reservas", calculatePJ(noReserves, params).AnnualNet, result.AnnualNet)

	// 11 meses faturados: (15.000 - 1.362) x 11 - 950 x 12.
	elevenMonths := pj
	elevenMonths.PaidMonthsPerYear = 11
	assertMoney(t, "anual 11 meses", calculatePJ(elevenMonths, params).AnnualNet, 138618)
}

func TestCLTToPJStaysWithinMarketRange(t *testing.T) {
	params := DefaultParameters()
	pj := PJInput{
		TaxRegime:             taxRegimeAuto,
		ProLaboreRate:         0.28,
		MonthlyAccountingCost: 250,
		MonthlyHealthPlanCost: 700,
		ContractRisk:          "medium",
		NoticeDays:            30,
		AllowsOtherClients:    true,
	}

	for _, gross := range []float64{5000, 10000, 20000} {
		result := CLTToPJ(CLTToPJInput{
			CLT: CLTInput{GrossSalary: gross, IncludeFGTS: true, IncludeThirteenth: true, IncludeVacation: true},
			PJ:  pj,
		}, params)

		breakEvenRatio := result.MinimumBreakEven / gross
		recommendedRatio := result.RecommendedValue / gross
		if breakEvenRatio < 1.0 || breakEvenRatio > 1.7 {
			t.Fatalf("CLT %.0f: break-even ratio %.2f outside 1.0-1.7", gross, breakEvenRatio)
		}
		if recommendedRatio <= breakEvenRatio || recommendedRatio > 2.0 {
			t.Fatalf("CLT %.0f: recommended ratio %.2f outside (break-even, 2.0]", gross, recommendedRatio)
		}
		if math.Abs(result.RecommendedValue-result.MinimumBreakEven*(1+result.RiskPremiumRate)) > 0.05 {
			t.Fatalf("CLT %.0f: recommended %.2f is not break-even plus risk margin", gross, result.RecommendedValue)
		}

		// O PJ no empate precisa reproduzir o anual CLT.
		equivalent := calculatePJWithMonthlyRate(pj, params, result.MinimumBreakEven)
		if math.Abs(equivalent.AnnualNet-result.Reference.AnnualNet) > 1 {
			t.Fatalf("CLT %.0f: break-even PJ annual %.2f differs from CLT annual %.2f", gross, equivalent.AnnualNet, result.Reference.AnnualNet)
		}
	}
}

func TestRiskPremiumIsMarginWithinBounds(t *testing.T) {
	params := DefaultParameters()
	cases := []struct {
		input PJInput
		want  float64
	}{
		{input: PJInput{ContractRisk: "low"}, want: 0.10},
		{input: PJInput{ContractRisk: "high"}, want: 0.30},
		{input: PJInput{ContractRisk: "medium"}, want: 0.20},
		{input: PJInput{ContractRisk: "medium", NoticeDays: 30, AllowsOtherClients: true}, want: 0.14},
		{input: PJInput{ContractRisk: "medium", RequiresExclusivity: true}, want: 0.25},
		{input: PJInput{ContractRisk: "medium", NoticeDays: 30, HasPaidVacation: true, AllowsOtherClients: true}, want: 0.11},
	}

	for _, tc := range cases {
		got := riskPremiumRate(tc.input, params)
		if math.Abs(got-tc.want) > 0.0001 {
			t.Fatalf("risk premium for %+v: got %.4f, want %.4f", tc.input, got, tc.want)
		}
	}
}

func TestFactorRAtExactly28PercentStaysInAnexoIII(t *testing.T) {
	params := DefaultParameters()
	pj := PJInput{TaxRegime: taxRegimeAuto, ProLaboreRate: 0.28}

	// Valores que geravam 27,999...% por ponto flutuante e caiam no Anexo V.
	for _, rate := range []float64{14993, 14999, 15005.5, 15030.5} {
		result := calculatePJWithMonthlyRate(pj, params, rate)
		if result.TaxRegime != taxRegimeAnexoIII {
			t.Fatalf("rate %.2f with pro-labore 28%%: got %s", rate, result.TaxRegime)
		}
	}
}

func TestPJToCLTRoundTrip(t *testing.T) {
	params := DefaultParameters()
	pj := PJInput{
		MonthlyRate:           15000,
		TaxRegime:             taxRegimeAuto,
		ProLaboreRate:         0.28,
		MonthlyAccountingCost: 250,
		MonthlyHealthPlanCost: 700,
	}

	clt := PJToCLT(PJToCLTInput{PJ: pj}, params)
	back := CLTToPJ(CLTToPJInput{
		CLT: CLTInput{GrossSalary: clt.EquivalentValue, IncludeFGTS: true, IncludeThirteenth: true, IncludeVacation: true},
		PJ:  pj,
	}, params)

	if math.Abs(back.MinimumBreakEven-pj.MonthlyRate) > 1 {
		t.Fatalf("round trip PJ 15000 -> CLT %.2f -> PJ %.2f", clt.EquivalentValue, back.MinimumBreakEven)
	}
}
