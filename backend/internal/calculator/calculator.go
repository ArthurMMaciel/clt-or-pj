package calculator

import (
	"fmt"
	"math"
	"strings"
)

const (
	taxRegimeAuto         = "auto"
	taxRegimeManual       = "manual"
	taxRegimeAnexoIII     = "simples_anexo_iii"
	taxRegimeAnexoV       = "simples_anexo_v"
	recommendationCLT     = "clt"
	recommendationPJ      = "pj"
	recommendationNeutral = "neutral"
)

type taxBracket struct {
	Limit     float64
	Rate      float64
	Deduction float64
}

type simpleBracket struct {
	Limit     float64
	Rate      float64
	Deduction float64
}

var inssEmployee2026 = []taxBracket{
	{Limit: 1621.00, Rate: 0.075},
	{Limit: 2902.84, Rate: 0.09},
	{Limit: 4354.27, Rate: 0.12},
	{Limit: 8475.55, Rate: 0.14},
}

var irrfMonthly2026 = []taxBracket{
	{Limit: 2428.80, Rate: 0, Deduction: 0},
	{Limit: 2826.65, Rate: 0.075, Deduction: 182.16},
	{Limit: 3751.05, Rate: 0.15, Deduction: 394.16},
	{Limit: 4664.68, Rate: 0.225, Deduction: 675.49},
	{Limit: math.Inf(1), Rate: 0.275, Deduction: 908.73},
}

var simpleAnexoIII = []simpleBracket{
	{Limit: 180000, Rate: 0.06},
	{Limit: 360000, Rate: 0.112, Deduction: 9360},
	{Limit: 720000, Rate: 0.135, Deduction: 17640},
	{Limit: 1800000, Rate: 0.16, Deduction: 35640},
	{Limit: 3600000, Rate: 0.21, Deduction: 125640},
	{Limit: 4800000, Rate: 0.33, Deduction: 648000},
}

var simpleAnexoV = []simpleBracket{
	{Limit: 180000, Rate: 0.155},
	{Limit: 360000, Rate: 0.18, Deduction: 4500},
	{Limit: 720000, Rate: 0.195, Deduction: 9900},
	{Limit: 1800000, Rate: 0.205, Deduction: 17100},
	{Limit: 3600000, Rate: 0.23, Deduction: 62100},
	{Limit: 4800000, Rate: 0.305, Deduction: 540000},
}

func DefaultParameters() Parameters {
	return Parameters{
		FGTSRate:                 0.08,
		TerminationFGTSPenalty:   0.40,
		DefaultPJTaxRate:         0.06,
		DefaultProLaboreRate:     0.28,
		DefaultPaidMonthsPerYear: 12,
		DefaultVacationReserve:   1.0 / 12.0,
		DefaultThirteenthReserve: 1.0 / 12.0,
		DefaultFGTSReserve:       0.08,
		DefaultEmergencyReserve:  0.10,
		LowRiskPremium:           0.35,
		MediumRiskPremium:        0.55,
		HighRiskPremium:          0.80,
	}
}

func Compare(input CompareInput, params Parameters) CompareResult {
	clt := calculateCLT(input.CLT, params)
	pj := calculatePJ(input.PJ, params)

	monthlyDifference := round2(pj.MonthlyNet - clt.MonthlyNet)
	annualDifference := round2(pj.AnnualNet - clt.AnnualNet)
	minimumBreakEven := round2(minimumPJToMatchCLT(clt.AnnualNet, input.PJ, params, 0))
	minimumRecommended := round2(minimumPJToMatchCLT(clt.AnnualNet, input.PJ, params, pj.RiskPremiumRate))
	riskAdjustedGap := round2(input.PJ.MonthlyRate - minimumRecommended)
	recommended := recommendationFrom(annualDifference, riskAdjustedGap)
	reasons := buildReasons(annualDifference, riskAdjustedGap, input, clt, pj)

	return CompareResult{
		CLT:                  clt,
		PJ:                   pj,
		MonthlyDifference:    monthlyDifference,
		AnnualDifference:     annualDifference,
		RiskAdjustedGap:      riskAdjustedGap,
		RecommendedOption:    recommended,
		MinimumPJToBreakEven: minimumBreakEven,
		MinimumPJRecommended: minimumRecommended,
		Summary:              buildSummary(recommended, annualDifference, riskAdjustedGap, clt, pj),
		Reasons:              reasons,
	}
}

func CLTToPJ(input CLTToPJInput, params Parameters) EquivalentResult {
	clt := calculateCLT(input.CLT, params)
	pj := input.PJ
	if pj.ContractRisk == "" {
		pj.ContractRisk = "medium"
	}
	riskPremium := riskPremiumRate(pj, params)
	minimumBreakEven := minimumPJToMatchCLT(clt.AnnualNet, pj, params, 0)
	recommended := minimumPJToMatchCLT(clt.AnnualNet, pj, params, riskPremium)
	minimumPJ := calculatePJWithMonthlyRate(pj, params, minimumBreakEven)
	recommendedPJ := calculatePJWithMonthlyRate(pj, params, recommended)

	return EquivalentResult{
		EquivalentValue:      round2(recommended),
		RecommendedValue:     round2(recommended),
		MinimumBreakEven:     round2(minimumBreakEven),
		Reference:            clt,
		Equivalent:           recommendedPJ,
		Summary:              fmt.Sprintf("Para substituir este pacote CLT, o PJ mínimo para empatar é %s. Com prêmio de risco de %s, a proposta recomendada sobe para %s.", formatBRL(minimumBreakEven), formatPercent(riskPremium), formatBRL(recommended)),
		RecommendedOption:    recommendationPJ,
		RiskPremiumRate:      round4(riskPremium),
		MonthlyDifference:    round2(recommendedPJ.MonthlyNet - clt.MonthlyNet),
		AnnualDifference:     round2(recommendedPJ.AnnualNet - clt.AnnualNet),
		RiskAdjustedGap:      round2(recommended - minimumBreakEven),
		MinimumPJToBreakEven: round2(minimumBreakEven),
		MinimumPJRecommended: round2(recommended),
		Reasons: []string{
			"O valor PJ mínimo empata o pacote anual CLT, incluindo INSS, IRRF, 13º, férias, FGTS e benefícios marcados.",
			fmt.Sprintf("A recomendação usa %s, alíquota efetiva de %s, fator R de %s e pró-labore de %s.", recommendedPJ.TaxRegime, formatPercent(recommendedPJ.EffectiveTaxRate), formatPercent(recommendedPJ.FactorR), formatBRL(recommendedPJ.ProLabore)),
			fmt.Sprintf("Reservas e custos no PJ recomendado retiram %s por mês antes do líquido disponível.", formatBRL(recommendedPJ.MonthlyReserve+recommendedPJ.MonthlyCosts)),
			fmt.Sprintf("O prêmio de risco adiciona %s por mês sobre o mínimo de empate.", formatBRL(recommended-minimumBreakEven)),
			fmt.Sprintf("No mínimo sem risco, o líquido mensal PJ estimado seria %s.", formatBRL(minimumPJ.MonthlyNet)),
		},
	}
}

func PJToCLT(input PJToCLTInput, params Parameters) EquivalentResult {
	pj := calculatePJ(input.PJ, params)
	equivalentGross := findCLTGrossForAnnualNet(pj.AnnualNet, params)
	cltInput := CLTInput{
		GrossSalary:       equivalentGross,
		IncludeFGTS:       true,
		IncludeThirteenth: true,
		IncludeVacation:   true,
	}
	clt := calculateCLT(cltInput, params)

	return EquivalentResult{
		EquivalentValue:   round2(equivalentGross),
		RecommendedValue:  round2(equivalentGross),
		MinimumBreakEven:  round2(equivalentGross),
		Reference:         pj,
		Equivalent:        clt,
		Summary:           fmt.Sprintf("Para chegar perto do pacote anual deste PJ, o salário CLT bruto equivalente fica em %s.", formatBRL(equivalentGross)),
		RecommendedOption: recommendationCLT,
		MonthlyDifference: round2(clt.MonthlyNet - pj.MonthlyNet),
		AnnualDifference:  round2(clt.AnnualNet - pj.AnnualNet),
		Reasons: []string{
			"O valor CLT equivalente é estimado buscando um pacote anual CLT próximo ao resultado anual PJ.",
			fmt.Sprintf("O CLT equivalente teria líquido mensal estimado de %s, INSS de %s e IRRF de %s.", formatBRL(clt.MonthlyNet), formatBRL(clt.MonthlyINSS), formatBRL(clt.MonthlyIRRF)),
			fmt.Sprintf("A conta considera 13º líquido de %s, férias líquidas de %s e FGTS anual de %s.", formatBRL(clt.AnnualThirteenthNet), formatBRL(clt.AnnualVacationNet), formatBRL(clt.AnnualFGTS)),
			fmt.Sprintf("O PJ usado como base está em %s, com alíquota efetiva de %s e fator R de %s.", pj.TaxRegime, formatPercent(pj.EffectiveTaxRate), formatPercent(pj.FactorR)),
		},
	}
}

func calculateCLT(input CLTInput, params Parameters) MoneyBreakdown {
	monthlyTaxable := input.GrossSalary + input.MonthlyTaxableBenefits
	monthlyINSS := calculateEmployeeINSS(monthlyTaxable)
	monthlyIRRF := calculateIRRF(monthlyTaxable-monthlyINSS, input.Dependents)
	monthlyNet := input.GrossSalary + input.MonthlyBenefits + input.MonthlyTaxableBenefits - monthlyINSS - monthlyIRRF - input.MonthlyDiscounts
	annualNet := monthlyNet*12 + input.AnnualBonus
	annualBenefits := (input.MonthlyBenefits + input.MonthlyTaxableBenefits) * 12

	thirteenthNet := 0.0
	if input.IncludeThirteenth {
		thirteenthINSS := calculateEmployeeINSS(input.GrossSalary)
		thirteenthIRRF := calculateIRRF(input.GrossSalary-thirteenthINSS, input.Dependents)
		thirteenthNet = max0(input.GrossSalary - thirteenthINSS - thirteenthIRRF)
		annualNet += thirteenthNet
	}

	vacationNet := 0.0
	if input.IncludeVacation {
		vacationGross := input.GrossSalary / 3
		vacationBase := input.GrossSalary + vacationGross
		vacationINSS := calculateEmployeeINSS(vacationBase) - monthlyINSS
		vacationIRRF := calculateIRRF(vacationBase-calculateEmployeeINSS(vacationBase), input.Dependents) - monthlyIRRF
		vacationNet = max0(vacationGross - max0(vacationINSS) - max0(vacationIRRF))
		annualNet += vacationNet
	}

	fgtsBase := input.GrossSalary * 12
	if input.IncludeThirteenth {
		fgtsBase += input.GrossSalary
	}
	if input.IncludeVacation {
		fgtsBase += input.GrossSalary / 3
	}

	annualFGTS := 0.0
	if input.IncludeFGTS {
		annualFGTS = fgtsBase * params.FGTSRate
		annualNet += annualFGTS
	}

	terminationValue := 0.0
	if input.IncludeTerminationProtection && input.IncludeFGTS {
		terminationValue = annualFGTS * params.TerminationFGTSPenalty
		annualNet += terminationValue
	}

	return MoneyBreakdown{
		MonthlyNet:             round2(monthlyNet),
		AnnualNet:              round2(annualNet),
		MonthlyGross:           round2(input.GrossSalary),
		MonthlyTaxableIncome:   round2(monthlyTaxable),
		MonthlyINSS:            round2(monthlyINSS),
		MonthlyIRRF:            round2(monthlyIRRF),
		AnnualThirteenthNet:    round2(thirteenthNet),
		AnnualVacationNet:      round2(vacationNet),
		AnnualFGTS:             round2(annualFGTS),
		AnnualTerminationValue: round2(terminationValue),
		AnnualBenefits:         round2(annualBenefits + input.AnnualBonus),
		AnnualProtectionValue:  round2(annualFGTS + terminationValue + thirteenthNet + vacationNet),
	}
}

func calculatePJ(input PJInput, params Parameters) MoneyBreakdown {
	paidMonths := valueOrDefault(input.PaidMonthsPerYear, params.DefaultPaidMonthsPerYear)
	proLabore := input.ProLabore
	if proLabore == 0 {
		proLabore = input.MonthlyRate * valueOrDefault(input.ProLaboreRate, params.DefaultProLaboreRate)
	}

	regime, factorR, effectiveTaxRate := resolvePJTax(input, proLabore, params)
	monthlyCompanyTaxes := input.MonthlyRate * effectiveTaxRate
	proLaboreINSS := calculateIndividualINSS(proLabore)
	proLaboreIRRF := calculateIRRF(proLabore-proLaboreINSS, 0)
	monthlyReserve := input.MonthlyRate * reserveRate(input, params)
	monthlyCosts := monthlyCompanyTaxes + proLaboreINSS + proLaboreIRRF + monthlyReserve + input.MonthlyAccountingCost + input.MonthlyHealthPlanCost + input.OtherMonthlyCosts
	monthlyNet := input.MonthlyRate - monthlyCosts
	annualNet := monthlyNet * paidMonths
	riskPremium := riskPremiumRate(input, params)

	return MoneyBreakdown{
		MonthlyNet:            round2(monthlyNet),
		AnnualNet:             round2(annualNet),
		MonthlyReserve:        round2(monthlyReserve),
		AnnualReserve:         round2(monthlyReserve * paidMonths),
		MonthlyGross:          round2(input.MonthlyRate),
		MonthlyTaxableIncome:  round2(proLabore),
		MonthlyINSS:           round2(proLaboreINSS),
		MonthlyIRRF:           round2(proLaboreIRRF),
		MonthlyTaxes:          round2(monthlyCompanyTaxes + proLaboreINSS + proLaboreIRRF),
		MonthlyCosts:          round2(input.MonthlyAccountingCost + input.MonthlyHealthPlanCost + input.OtherMonthlyCosts),
		TaxRegime:             regime,
		EffectiveTaxRate:      round4(effectiveTaxRate),
		FactorR:               round4(factorR),
		ProLabore:             round2(proLabore),
		PaidMonthsPerYear:     round2(paidMonths),
		RiskPremiumRate:       round4(riskPremium),
		RequiredRiskPremiumPJ: round2(input.MonthlyRate * riskPremium),
	}
}

func calculateEmployeeINSS(salary float64) float64 {
	previous := 0.0
	total := 0.0
	for _, bracket := range inssEmployee2026 {
		if salary <= previous {
			break
		}
		taxable := math.Min(salary, bracket.Limit) - previous
		total += taxable * bracket.Rate
		previous = bracket.Limit
	}
	return round2(total)
}

func calculateIndividualINSS(proLabore float64) float64 {
	if proLabore <= 0 {
		return 0
	}
	minimum := 1621.00
	ceiling := 8475.55
	base := clamp(proLabore, minimum, ceiling)
	return round2(base * 0.11)
}

func calculateIRRF(base float64, dependents int) float64 {
	taxable := max0(base - float64(dependents)*189.59)
	tax := 0.0
	for _, bracket := range irrfMonthly2026 {
		if taxable <= bracket.Limit {
			tax = taxable*bracket.Rate - bracket.Deduction
			break
		}
	}
	tax = max0(tax - monthlyIRReduction(taxable, tax))
	return round2(tax)
}

func monthlyIRReduction(taxable, calculatedTax float64) float64 {
	if taxable <= 5000 {
		return math.Min(calculatedTax, 312.89)
	}
	if taxable <= 7350 {
		return max0(978.62 - 0.133145*taxable)
	}
	return 0
}

func resolvePJTax(input PJInput, proLabore float64, params Parameters) (string, float64, float64) {
	regime := strings.TrimSpace(input.TaxRegime)
	if regime == "" {
		regime = taxRegimeAuto
	}
	if regime == taxRegimeManual {
		return regime, factorR(input, proLabore), valueOrDefault(input.EffectiveTaxRate, params.DefaultPJTaxRate)
	}

	factor := factorR(input, proLabore)
	if regime == taxRegimeAuto {
		if factor >= 0.28 {
			regime = taxRegimeAnexoIII
		} else {
			regime = taxRegimeAnexoV
		}
	}

	rbt12 := input.GrossRevenueLast12Months
	if rbt12 == 0 {
		rbt12 = input.MonthlyRate * 12
	}

	switch regime {
	case taxRegimeAnexoIII:
		return regime, factor, calculateSimpleEffectiveRate(rbt12, simpleAnexoIII)
	case taxRegimeAnexoV:
		return regime, factor, calculateSimpleEffectiveRate(rbt12, simpleAnexoV)
	default:
		return taxRegimeManual, factor, valueOrDefault(input.EffectiveTaxRate, params.DefaultPJTaxRate)
	}
}

func factorR(input PJInput, proLabore float64) float64 {
	revenue := input.GrossRevenueLast12Months
	if revenue == 0 {
		revenue = input.MonthlyRate * 12
	}
	payroll := input.PayrollLast12Months
	if payroll == 0 {
		payroll = proLabore * 12
	}
	if revenue <= 0 {
		return 0
	}
	return payroll / revenue
}

func calculateSimpleEffectiveRate(rbt12 float64, brackets []simpleBracket) float64 {
	if rbt12 <= 0 {
		return 0
	}
	for _, bracket := range brackets {
		if rbt12 <= bracket.Limit {
			return max0((rbt12*bracket.Rate - bracket.Deduction) / rbt12)
		}
	}
	last := brackets[len(brackets)-1]
	return max0((rbt12*last.Rate - last.Deduction) / rbt12)
}

func reserveRate(input PJInput, params Parameters) float64 {
	return valueOrDefault(input.VacationReserveRate, params.DefaultVacationReserve) +
		valueOrDefault(input.ThirteenthReserveRate, params.DefaultThirteenthReserve) +
		valueOrDefault(input.FGTSReserveRate, params.DefaultFGTSReserve) +
		valueOrDefault(input.EmergencyReserveRate, params.DefaultEmergencyReserve)
}

func riskPremiumRate(input PJInput, params Parameters) float64 {
	switch strings.ToLower(input.ContractRisk) {
	case "low":
		return params.LowRiskPremium
	case "high":
		return params.HighRiskPremium
	default:
		premium := params.MediumRiskPremium
		if input.NoticeDays >= 30 {
			premium -= 0.05
		}
		if input.HasPaidVacation {
			premium -= 0.05
		}
		if input.AllowsOtherClients {
			premium -= 0.05
		}
		if input.RequiresExclusivity {
			premium += 0.10
		}
		return clamp(premium, params.LowRiskPremium, params.HighRiskPremium)
	}
}

func minimumPJToMatchCLT(targetAnnualNet float64, pj PJInput, params Parameters, premium float64) float64 {
	pj.PaidMonthsPerYear = valueOrDefault(pj.PaidMonthsPerYear, params.DefaultPaidMonthsPerYear)
	targetAnnualNet = targetAnnualNet * (1 + premium)
	low := 0.0
	high := math.Max(targetAnnualNet, 1000)
	for calculatePJWithMonthlyRate(pj, params, high).AnnualNet < targetAnnualNet {
		high *= 2
		if high > 10000000 {
			return 0
		}
	}
	for i := 0; i < 80; i++ {
		mid := (low + high) / 2
		if calculatePJWithMonthlyRate(pj, params, mid).AnnualNet >= targetAnnualNet {
			high = mid
		} else {
			low = mid
		}
	}
	return high
}

func calculatePJWithMonthlyRate(input PJInput, params Parameters, monthlyRate float64) MoneyBreakdown {
	input.MonthlyRate = monthlyRate
	if input.GrossRevenueLast12Months == 0 {
		input.GrossRevenueLast12Months = monthlyRate * 12
	}
	if input.ProLabore == 0 {
		input.ProLabore = monthlyRate * valueOrDefault(input.ProLaboreRate, params.DefaultProLaboreRate)
	}
	return calculatePJ(input, params)
}

func findCLTGrossForAnnualNet(targetAnnualNet float64, params Parameters) float64 {
	input := CLTInput{
		IncludeFGTS:       true,
		IncludeThirteenth: true,
		IncludeVacation:   true,
	}
	low := 0.0
	high := math.Max(targetAnnualNet, 1000)
	for {
		input.GrossSalary = high
		if calculateCLT(input, params).AnnualNet >= targetAnnualNet {
			break
		}
		high *= 2
		if high > 10000000 {
			return 0
		}
	}
	for i := 0; i < 80; i++ {
		mid := (low + high) / 2
		input.GrossSalary = mid
		if calculateCLT(input, params).AnnualNet >= targetAnnualNet {
			high = mid
		} else {
			low = mid
		}
	}
	return high
}

func recommendationFrom(annualDifference, riskAdjustedGap float64) string {
	if riskAdjustedGap >= 0 {
		return recommendationPJ
	}
	if annualDifference < 0 {
		return recommendationCLT
	}
	return recommendationNeutral
}

func buildSummary(recommended string, annualDifference, riskAdjustedGap float64, clt, pj MoneyBreakdown) string {
	switch recommended {
	case recommendationPJ:
		return fmt.Sprintf("PJ é mais benéfico no cenário informado: supera o pacote CLT em %s ao ano e passa o mínimo recomendado já com prêmio de risco.", formatBRL(annualDifference))
	case recommendationCLT:
		return fmt.Sprintf("CLT é mais benéfico no cenário informado: o pacote anual com direitos, benefícios e proteção fica %s acima do PJ.", formatBRL(math.Abs(annualDifference)))
	default:
		return fmt.Sprintf("O PJ fica acima no anual bruto comparável, mas falta %s por mês para compensar o prêmio de risco estimado frente ao pacote CLT.", formatBRL(math.Abs(riskAdjustedGap)))
	}
}

func buildReasons(annualDifference, riskAdjustedGap float64, input CompareInput, clt, pj MoneyBreakdown) []string {
	reasons := []string{}

	if annualDifference >= 0 {
		reasons = append(reasons, "PJ ficou acima no valor anual comparável antes do ajuste de risco.")
	} else {
		reasons = append(reasons, "CLT ficou acima no valor anual comparável antes do ajuste de risco.")
	}

	reasons = append(reasons, fmt.Sprintf("CLT inclui INSS de %s e IRRF de %s por mês, além dos direitos anuais marcados.", formatBRL(clt.MonthlyINSS), formatBRL(clt.MonthlyIRRF)))

	if input.CLT.IncludeFGTS {
		reasons = append(reasons, fmt.Sprintf("FGTS adiciona %s ao valor anual comparável, mas não entra como dinheiro livre todo mês.", formatBRL(clt.AnnualFGTS)))
	}

	reasons = append(reasons, fmt.Sprintf("PJ foi calculado como %s, com alíquota efetiva de %s e fator R de %s.", pj.TaxRegime, formatPercent(pj.EffectiveTaxRate), formatPercent(pj.FactorR)))
	reasons = append(reasons, fmt.Sprintf("Reservas e custos do PJ retiram %s por mês antes de comparar com CLT.", formatBRL(pj.MonthlyReserve+pj.MonthlyCosts)))

	if pj.PaidMonthsPerYear < 12 {
		reasons = append(reasons, fmt.Sprintf("PJ considera %.0f meses pagos por ano, reduzindo o resultado anual para refletir pausa sem faturamento.", pj.PaidMonthsPerYear))
	}

	if riskAdjustedGap >= 0 {
		reasons = append(reasons, "O valor PJ informado cobre o pacote CLT e o prêmio de risco configurado.")
	} else {
		reasons = append(reasons, fmt.Sprintf("Para compensar ausência de proteção trabalhista, o PJ recomendado deveria ser %s maior por mês.", formatBRL(math.Abs(riskAdjustedGap))))
	}

	return reasons
}

func valueOrDefault(value float64, fallback float64) float64 {
	if value == 0 {
		return fallback
	}
	return value
}

func max0(value float64) float64 {
	if value < 0 {
		return 0
	}
	return value
}

func clamp(value, min, max float64) float64 {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func round2(value float64) float64 {
	return math.Round(value*100) / 100
}

func round4(value float64) float64 {
	return math.Round(value*10000) / 10000
}

func formatBRL(value float64) string {
	sign := ""
	if value < 0 {
		sign = "-"
		value = math.Abs(value)
	}

	rounded := fmt.Sprintf("%.2f", round2(value))
	parts := strings.Split(rounded, ".")
	integer := parts[0]
	decimal := "00"
	if len(parts) > 1 {
		decimal = parts[1]
	}

	withThousands := ""
	for len(integer) > 3 {
		withThousands = "." + integer[len(integer)-3:] + withThousands
		integer = integer[:len(integer)-3]
	}
	withThousands = integer + withThousands

	return fmt.Sprintf("%sR$ %s,%s", sign, withThousands, decimal)
}

func formatPercent(value float64) string {
	formatted := fmt.Sprintf("%.2f", round2(value*100))
	return strings.Replace(formatted, ".", ",", 1) + "%"
}
