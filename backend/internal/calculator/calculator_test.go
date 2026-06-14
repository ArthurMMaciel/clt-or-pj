package calculator

import "testing"

func TestCompareCLTBeatsPJWhenPJDoesNotCoverRisk(t *testing.T) {
	result := Compare(CompareInput{
		CLT: CLTInput{
			GrossSalary:       10000,
			MonthlyBenefits:   1000,
			IncludeFGTS:       true,
			IncludeThirteenth: true,
			IncludeVacation:   true,
		},
		PJ: PJInput{
			MonthlyRate:              12000,
			TaxRegime:                taxRegimeAuto,
			ProLabore:                3360,
			GrossRevenueLast12Months: 144000,
			PayrollLast12Months:      40320,
			PaidMonthsPerYear:        12,
			MonthlyAccountingCost:    250,
			MonthlyHealthPlanCost:    700,
			ContractRisk:             "medium",
			NoticeDays:               30,
		},
	}, DefaultParameters())

	if result.RecommendedOption != recommendationNeutral && result.RecommendedOption != recommendationCLT {
		t.Fatalf("expected CLT or neutral when PJ does not cover risk, got %s", result.RecommendedOption)
	}
	if result.MinimumPJRecommended <= result.MinimumPJToBreakEven {
		t.Fatalf("expected risk-adjusted PJ minimum above break-even, got recommended %.2f and break-even %.2f", result.MinimumPJRecommended, result.MinimumPJToBreakEven)
	}
}

func TestCompareRecommendsPJWhenItCoversAnnualAndRiskPremium(t *testing.T) {
	result := Compare(CompareInput{
		CLT: CLTInput{
			GrossSalary:       10000,
			MonthlyBenefits:   1000,
			IncludeFGTS:       true,
			IncludeThirteenth: true,
			IncludeVacation:   true,
		},
		PJ: PJInput{
			MonthlyRate:              33000,
			TaxRegime:                taxRegimeAuto,
			ProLabore:                6160,
			GrossRevenueLast12Months: 396000,
			PayrollLast12Months:      110880,
			PaidMonthsPerYear:        12,
			MonthlyAccountingCost:    250,
			MonthlyHealthPlanCost:    700,
			ContractRisk:             "low",
			NoticeDays:               30,
			AllowsOtherClients:       true,
		},
	}, DefaultParameters())

	if result.RecommendedOption != recommendationPJ {
		t.Fatalf("expected PJ recommendation, got %s; summary: %s", result.RecommendedOption, result.Summary)
	}
	if result.PJ.TaxRegime != taxRegimeAnexoIII {
		t.Fatalf("expected automatic Anexo III, got %s", result.PJ.TaxRegime)
	}
}

func TestFactorRSelectsAnexoVBelowThreshold(t *testing.T) {
	result := Compare(CompareInput{
		CLT: CLTInput{
			GrossSalary:       8000,
			IncludeFGTS:       true,
			IncludeThirteenth: true,
			IncludeVacation:   true,
		},
		PJ: PJInput{
			MonthlyRate:              15000,
			TaxRegime:                taxRegimeAuto,
			ProLabore:                2000,
			GrossRevenueLast12Months: 180000,
			PayrollLast12Months:      24000,
			PaidMonthsPerYear:        12,
		},
	}, DefaultParameters())

	if result.PJ.TaxRegime != taxRegimeAnexoV {
		t.Fatalf("expected automatic Anexo V below factor R threshold, got %s", result.PJ.TaxRegime)
	}
	if result.PJ.EffectiveTaxRate < 0.15 {
		t.Fatalf("expected Anexo V effective tax rate near initial bracket, got %.4f", result.PJ.EffectiveTaxRate)
	}
}
