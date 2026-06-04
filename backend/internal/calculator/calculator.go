package calculator

import "math"

func DefaultParameters() Parameters {
	return Parameters{
		FGTSRate:                 0.08,
		DefaultPJTaxRate:         0.06,
		DefaultVacationReserve:   1.0 / 12.0,
		DefaultThirteenthReserve: 1.0 / 12.0,
		DefaultEmergencyReserve:  0.10,
	}
}

func Compare(input CompareInput, params Parameters) CompareResult {
	clt := calculateCLT(input.CLT, params)
	pj := calculatePJ(input.PJ, params)

	monthlyDifference := round2(pj.MonthlyNet - clt.MonthlyNet)
	annualDifference := round2(pj.AnnualNet - clt.AnnualNet)
	recommended := "neutral"
	if annualDifference > 0 {
		recommended = "pj"
	}
	if annualDifference < 0 {
		recommended = "clt"
	}

	return CompareResult{
		CLT:                  clt,
		PJ:                   pj,
		MonthlyDifference:    monthlyDifference,
		AnnualDifference:     annualDifference,
		RecommendedOption:    recommended,
		MinimumPJToBreakEven: round2(minimumPJToMatchCLT(clt.AnnualNet, input.PJ, params)),
		Reasons:              buildReasons(monthlyDifference, annualDifference, input),
	}
}

func CLTToPJ(input CLTToPJInput, params Parameters) EquivalentResult {
	clt := calculateCLT(input.CLT, params)
	minimum := minimumPJToMatchCLT(clt.AnnualNet, input.PJ, params)

	return EquivalentResult{
		EquivalentValue: round2(minimum),
		Reference:       clt,
		Reasons: []string{
			"O valor PJ sugerido considera o equivalente anual CLT, incluindo beneficios e reservas configuradas.",
			"Quanto maiores forem custos, impostos e reservas do PJ, maior precisa ser o contrato para empatar.",
		},
	}
}

func PJToCLT(input PJToCLTInput, params Parameters) EquivalentResult {
	pj := calculatePJ(input.PJ, params)
	equivalentGross := pj.AnnualNet / 13.333333

	return EquivalentResult{
		EquivalentValue: round2(equivalentGross),
		Reference:       pj,
		Reasons: []string{
			"O valor CLT equivalente e uma estimativa a partir do resultado anual PJ.",
			"A conta inicial considera uma distribuicao aproximada entre 12 salarios, 13 salario e ferias.",
		},
	}
}

func calculateCLT(input CLTInput, params Parameters) MoneyBreakdown {
	monthlyNet := input.GrossSalary + input.MonthlyBenefits - input.MonthlyDiscounts
	annualNet := monthlyNet*12 + input.AnnualBonus

	if input.IncludeThirteenth {
		annualNet += input.GrossSalary
	}
	if input.IncludeVacation {
		annualNet += input.GrossSalary + input.GrossSalary/3
	}
	if input.IncludeFGTS {
		annualNet += input.GrossSalary * params.FGTSRate * 12
	}

	return MoneyBreakdown{
		MonthlyNet: round2(monthlyNet),
		AnnualNet:  round2(annualNet),
	}
}

func calculatePJ(input PJInput, params Parameters) MoneyBreakdown {
	taxRate := valueOrDefault(input.EffectiveTaxRate, params.DefaultPJTaxRate)
	vacationReserve := valueOrDefault(input.VacationReserveRate, params.DefaultVacationReserve)
	thirteenthReserve := valueOrDefault(input.ThirteenthReserveRate, params.DefaultThirteenthReserve)
	emergencyReserve := valueOrDefault(input.EmergencyReserveRate, params.DefaultEmergencyReserve)

	monthlyTaxes := input.MonthlyRate * taxRate
	monthlyReserve := input.MonthlyRate * (vacationReserve + thirteenthReserve + emergencyReserve)
	monthlyCosts := monthlyTaxes + monthlyReserve + input.MonthlyAccountingCost + input.MonthlyHealthPlanCost + input.OtherMonthlyCosts
	monthlyNet := input.MonthlyRate - monthlyCosts

	return MoneyBreakdown{
		MonthlyNet:     round2(monthlyNet),
		AnnualNet:      round2(monthlyNet * 12),
		MonthlyReserve: round2(monthlyReserve),
		AnnualReserve:  round2(monthlyReserve * 12),
	}
}

func minimumPJToMatchCLT(targetAnnualNet float64, pj PJInput, params Parameters) float64 {
	taxRate := valueOrDefault(pj.EffectiveTaxRate, params.DefaultPJTaxRate)
	vacationReserve := valueOrDefault(pj.VacationReserveRate, params.DefaultVacationReserve)
	thirteenthReserve := valueOrDefault(pj.ThirteenthReserveRate, params.DefaultThirteenthReserve)
	emergencyReserve := valueOrDefault(pj.EmergencyReserveRate, params.DefaultEmergencyReserve)
	fixedCosts := pj.MonthlyAccountingCost + pj.MonthlyHealthPlanCost + pj.OtherMonthlyCosts
	retainedRate := 1 - taxRate - vacationReserve - thirteenthReserve - emergencyReserve

	if retainedRate <= 0 {
		return 0
	}

	targetMonthlyNet := targetAnnualNet / 12
	return (targetMonthlyNet + fixedCosts) / retainedRate
}

func buildReasons(monthlyDifference, annualDifference float64, input CompareInput) []string {
	reasons := []string{}

	if annualDifference > 0 {
		reasons = append(reasons, "PJ ficou acima no equivalente anual estimado.")
	} else if annualDifference < 0 {
		reasons = append(reasons, "CLT ficou acima no equivalente anual estimado.")
	} else {
		reasons = append(reasons, "As propostas ficaram muito proximas no equivalente anual estimado.")
	}

	if input.CLT.IncludeFGTS || input.CLT.IncludeThirteenth || input.CLT.IncludeVacation {
		reasons = append(reasons, "A comparacao inclui vantagens anuais de CLT como FGTS, 13 salario e ferias quando marcadas.")
	}

	if input.PJ.MonthlyAccountingCost > 0 || input.PJ.MonthlyHealthPlanCost > 0 || input.PJ.OtherMonthlyCosts > 0 {
		reasons = append(reasons, "Custos fixos do PJ reduzem o valor liquido disponivel.")
	}

	if monthlyDifference > 0 {
		reasons = append(reasons, "No mes, PJ tambem deixa mais dinheiro disponivel depois das reservas estimadas.")
	}

	return reasons
}

func valueOrDefault(value float64, fallback float64) float64 {
	if value == 0 {
		return fallback
	}
	return value
}

func round2(value float64) float64 {
	return math.Round(value*100) / 100
}
