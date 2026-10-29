package calculator

import (
	"fmt"
	"math"
	"strings"
)

// Version identifica a regra de calculo gravada junto de cada simulacao salva.
const Version = "mvp-2"

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

// Desconto simplificado mensal e deducao por dependente (tabela vigente desde mai/2025).
const (
	irrfDependentDeduction = 189.59
	irrfSimplifiedDiscount = 607.20
)

// Tabela exclusiva de IRRF sobre PLR (Lei 10.101/2000). Valores 2026 obtidos de fonte
// secundaria; conferir com a publicacao oficial da Receita antes de cada ano.
var plrExclusive2026 = []taxBracket{
	{Limit: 8214.40, Rate: 0, Deduction: 0},
	{Limit: 9922.28, Rate: 0.075, Deduction: 616.08},
	{Limit: 13167.00, Rate: 0.15, Deduction: 1360.35},
	{Limit: 16380.38, Rate: 0.225, Deduction: 2347.85},
	{Limit: math.Inf(1), Rate: 0.275, Deduction: 3166.58},
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
		LowRiskPremium:           0.10,
		MediumRiskPremium:        0.20,
		HighRiskPremium:          0.30,
	}
}

func Compare(input CompareInput, params Parameters) CompareResult {
	clt := calculateCLT(input.CLT, params)
	pj := calculatePJ(input.PJ, params)

	monthlyDifference := round2(pj.MonthlyNet - clt.MonthlyNet)
	annualDifference := round2(pj.AnnualNet - clt.AnnualNet)
	minimumBreakEven := round2(minimumPJToMatchCLT(clt.AnnualNet, input.PJ, params))
	minimumRecommended := round2(minimumBreakEven * (1 + pj.RiskPremiumRate))
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
	minimumBreakEven := minimumPJToMatchCLT(clt.AnnualNet, pj, params)
	recommended := minimumBreakEven * (1 + riskPremium)
	minimumPJ := calculatePJWithMonthlyRate(pj, params, minimumBreakEven)
	recommendedPJ := calculatePJWithMonthlyRate(pj, params, recommended)

	return EquivalentResult{
		EquivalentValue:      round2(recommended),
		RecommendedValue:     round2(recommended),
		MinimumBreakEven:     round2(minimumBreakEven),
		Reference:            clt,
		Equivalent:           recommendedPJ,
		Summary:              fmt.Sprintf("Para substituir este pacote CLT, o PJ mínimo para empatar é %s. Com margem de risco de %s sobre o empate, a proposta recomendada é %s.", formatBRL(minimumBreakEven), formatPercent(riskPremium), formatBRL(recommended)),
		RecommendedOption:    recommendationPJ,
		RiskPremiumRate:      round4(riskPremium),
		MonthlyDifference:    round2(recommendedPJ.MonthlyNet - clt.MonthlyNet),
		AnnualDifference:     round2(recommendedPJ.AnnualNet - clt.AnnualNet),
		RiskAdjustedGap:      round2(recommended - minimumBreakEven),
		MinimumPJToBreakEven: round2(minimumBreakEven),
		MinimumPJRecommended: round2(recommended),
		Reasons: []string{
			"O valor PJ mínimo empata o pacote anual CLT, incluindo INSS, IRRF, 13º, férias, FGTS, bônus, PLR e benefícios marcados.",
			fmt.Sprintf("A recomendação usa %s, alíquota efetiva de %s, fator R de %s e pró-labore de %s.", recommendedPJ.TaxRegime, formatPercent(recommendedPJ.EffectiveTaxRate), formatPercent(recommendedPJ.FactorR), formatBRL(recommendedPJ.ProLabore)),
			fmt.Sprintf("Custos fixos do PJ recomendado somam %s por mês, pagos nos 12 meses do ano.", formatBRL(recommendedPJ.MonthlyCosts)),
			fmt.Sprintf("Sugestão: separar %s por mês para férias, 13º e emergência. Esse valor continua seu e não reduz o pacote anual.", formatBRL(recommendedPJ.MonthlyReserve)),
			fmt.Sprintf("A margem de risco adiciona %s por mês sobre o mínimo de empate, para compensar a ausência de proteções trabalhistas.", formatBRL(recommended-minimumBreakEven)),
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
	monthlyIRRF := calculateIRRF(monthlyTaxable, monthlyINSS, input.Dependents)
	monthlyNet := input.GrossSalary + input.MonthlyBenefits + input.MonthlyTaxableBenefits - monthlyINSS - monthlyIRRF - input.MonthlyDiscounts
	annualNet := monthlyNet * 12
	annualBenefits := (input.MonthlyBenefits + input.MonthlyTaxableBenefits) * 12

	// Bonus pago junto com um salario: INSS e IRRF incrementais do mes em que entra.
	bonusNet := 0.0
	if input.AnnualBonus > 0 {
		bonusBase := monthlyTaxable + input.AnnualBonus
		bonusINSS := calculateEmployeeINSS(bonusBase)
		bonusIRRF := calculateIRRF(bonusBase, bonusINSS, input.Dependents) - monthlyIRRF
		bonusNet = max0(input.AnnualBonus - max0(bonusINSS-monthlyINSS) - max0(bonusIRRF))
		annualNet += bonusNet
	}

	// PLR tem tributacao exclusiva e nao sofre INSS nem FGTS.
	plrNet := 0.0
	if input.AnnualPLR > 0 {
		plrNet = input.AnnualPLR - calculatePLRTax(input.AnnualPLR)
		annualNet += plrNet
	}

	thirteenthNet := 0.0
	if input.IncludeThirteenth {
		thirteenthINSS := calculateEmployeeINSS(input.GrossSalary)
		thirteenthIRRF := calculateIRRF(input.GrossSalary, thirteenthINSS, input.Dependents)
		thirteenthNet = max0(input.GrossSalary - thirteenthINSS - thirteenthIRRF)
		annualNet += thirteenthNet
	}

	vacationNet := 0.0
	if input.IncludeVacation {
		vacationGross := input.GrossSalary / 3
		vacationBase := input.GrossSalary + vacationGross
		vacationBaseINSS := calculateEmployeeINSS(vacationBase)
		vacationINSS := vacationBaseINSS - monthlyINSS
		vacationIRRF := calculateIRRF(vacationBase, vacationBaseINSS, input.Dependents) - monthlyIRRF
		vacationNet = max0(vacationGross - max0(vacationINSS) - max0(vacationIRRF))
		annualNet += vacationNet
	}

	fgtsBase := input.GrossSalary*12 + input.AnnualBonus
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
		AnnualBenefits:         round2(annualBenefits),
		AnnualBonusNet:         round2(bonusNet),
		AnnualPLRNet:           round2(plrNet),
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
	proLaboreIRRF := calculateIRRF(proLabore, proLaboreINSS, 0)
	monthlyTaxes := monthlyCompanyTaxes + proLaboreINSS + proLaboreIRRF
	monthlyFixedCosts := input.MonthlyAccountingCost + input.MonthlyHealthPlanCost + input.OtherMonthlyCosts
	monthlyNet := input.MonthlyRate - monthlyTaxes - monthlyFixedCosts
	// Impostos acompanham o faturamento; custos fixos correm os 12 meses do ano.
	annualNet := (input.MonthlyRate-monthlyTaxes)*paidMonths - monthlyFixedCosts*12
	// Reserva e sugestao de quanto separar: o dinheiro continua do PJ e nao reduz o anual,
	// senao 13o, ferias e FGTS seriam contados duas vezes contra o PJ.
	monthlyReserve := input.MonthlyRate * reserveRate(input, params)
	riskPremium := riskPremiumRate(input, params)

	return MoneyBreakdown{
		MonthlyNet:             round2(monthlyNet),
		AnnualNet:              round2(annualNet),
		MonthlyReserve:         round2(monthlyReserve),
		AnnualReserve:          round2(monthlyReserve * paidMonths),
		MonthlyGross:           round2(input.MonthlyRate),
		MonthlyTaxableIncome:   round2(proLabore),
		MonthlyINSS:            round2(proLaboreINSS),
		MonthlyIRRF:            round2(proLaboreIRRF),
		MonthlyNetAfterReserve: round2(monthlyNet - monthlyReserve),
		MonthlyTaxes:           round2(monthlyTaxes),
		MonthlyCosts:           round2(monthlyFixedCosts),
		TaxRegime:              regime,
		EffectiveTaxRate:       round4(effectiveTaxRate),
		FactorR:                round4(factorR),
		ProLabore:              round2(proLabore),
		PaidMonthsPerYear:      round2(paidMonths),
		RiskPremiumRate:        round4(riskPremium),
		RequiredRiskPremiumPJ:  round2(input.MonthlyRate * riskPremium),
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

// calculateIRRF recebe o rendimento tributavel bruto e o INSS ja retido. A base usa a
// deducao mais vantajosa entre as legais (INSS + dependentes) e o desconto simplificado.
func calculateIRRF(grossTaxable, inss float64, dependents int) float64 {
	legalDeductions := inss + float64(dependents)*irrfDependentDeduction
	base := max0(grossTaxable - math.Max(legalDeductions, irrfSimplifiedDiscount))
	tax := progressiveTax(base, irrfMonthly2026)
	tax = max0(tax - monthlyIRReduction(grossTaxable, tax))
	return round2(tax)
}

// monthlyIRReduction aplica a reducao da Lei 15.270/2025, calculada sobre o rendimento
// tributavel bruto do mes (nao sobre a base apos deducoes).
func monthlyIRReduction(grossTaxable, calculatedTax float64) float64 {
	if grossTaxable <= 5000 {
		return math.Min(calculatedTax, 312.89)
	}
	if grossTaxable <= 7350 {
		return math.Min(calculatedTax, max0(978.62-0.133145*grossTaxable))
	}
	return 0
}

func calculatePLRTax(plr float64) float64 {
	return round2(progressiveTax(plr, plrExclusive2026))
}

func progressiveTax(base float64, brackets []taxBracket) float64 {
	for _, bracket := range brackets {
		if base <= bracket.Limit {
			return max0(base*bracket.Rate - bracket.Deduction)
		}
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
		// Tolerancia evita que 28% exato vire 27,999...% por ponto flutuante e caia no Anexo V.
		if factor >= 0.28-1e-9 {
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
			premium -= 0.03
		}
		if input.HasPaidVacation {
			premium -= 0.03
		}
		if input.AllowsOtherClients {
			premium -= 0.03
		}
		if input.RequiresExclusivity {
			premium += 0.05
		}
		return clamp(premium, params.LowRiskPremium, params.HighRiskPremium)
	}
}

func minimumPJToMatchCLT(targetAnnualNet float64, pj PJInput, params Parameters) float64 {
	pj.PaidMonthsPerYear = valueOrDefault(pj.PaidMonthsPerYear, params.DefaultPaidMonthsPerYear)
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
		return fmt.Sprintf("PJ é mais benéfico no cenário informado: supera o pacote CLT em %s ao ano e passa o valor recomendado já com margem de risco.", formatBRL(annualDifference))
	case recommendationCLT:
		return fmt.Sprintf("CLT é mais benéfico no cenário informado: o pacote anual com direitos, benefícios e proteção fica %s acima do PJ.", formatBRL(math.Abs(annualDifference)))
	default:
		return fmt.Sprintf("O PJ empata ou supera o pacote anual CLT, mas falta %s por mês para cobrir a margem de risco recomendada.", formatBRL(math.Abs(riskAdjustedGap)))
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
	reasons = append(reasons, fmt.Sprintf("Custos fixos do PJ somam %s por mês, pagos nos 12 meses do ano.", formatBRL(pj.MonthlyCosts)))
	reasons = append(reasons, fmt.Sprintf("Sugestão: separar %s por mês para férias, 13º e emergência. Esse valor continua seu e não reduz o pacote anual.", formatBRL(pj.MonthlyReserve)))

	if pj.PaidMonthsPerYear < 12 {
		reasons = append(reasons, fmt.Sprintf("PJ considera %.0f meses pagos por ano, reduzindo o resultado anual para refletir pausa sem faturamento.", pj.PaidMonthsPerYear))
	}

	if riskAdjustedGap >= 0 {
		reasons = append(reasons, fmt.Sprintf("O valor PJ informado cobre o pacote CLT e a margem de risco de %s.", formatPercent(pj.RiskPremiumRate)))
	} else {
		reasons = append(reasons, fmt.Sprintf("Para cobrir a margem de risco de %s pela ausência de proteções trabalhistas, o PJ deveria ser %s maior por mês.", formatPercent(pj.RiskPremiumRate), formatBRL(math.Abs(riskAdjustedGap))))
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
