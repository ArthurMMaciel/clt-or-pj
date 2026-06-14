package calculator

type CLTInput struct {
	GrossSalary                  float64 `json:"grossSalary" binding:"required,gte=0"`
	MonthlyBenefits              float64 `json:"monthlyBenefits" binding:"gte=0"`
	MonthlyTaxableBenefits       float64 `json:"monthlyTaxableBenefits" binding:"gte=0"`
	MonthlyDiscounts             float64 `json:"monthlyDiscounts" binding:"gte=0"`
	AnnualBonus                  float64 `json:"annualBonus" binding:"gte=0"`
	Dependents                   int     `json:"dependents" binding:"gte=0"`
	IncludeFGTS                  bool    `json:"includeFgts"`
	IncludeThirteenth            bool    `json:"includeThirteenth"`
	IncludeVacation              bool    `json:"includeVacation"`
	IncludeTerminationProtection bool    `json:"includeTerminationProtection"`
}

type PJInput struct {
	MonthlyRate              float64 `json:"monthlyRate" binding:"required,gte=0"`
	TaxRegime                string  `json:"taxRegime"`
	EffectiveTaxRate         float64 `json:"effectiveTaxRate" binding:"gte=0,lte=1"`
	GrossRevenueLast12Months float64 `json:"grossRevenueLast12Months" binding:"gte=0"`
	PayrollLast12Months      float64 `json:"payrollLast12Months" binding:"gte=0"`
	ProLabore                float64 `json:"proLabore" binding:"gte=0"`
	ProLaboreRate            float64 `json:"proLaboreRate" binding:"gte=0,lte=1"`
	PaidMonthsPerYear        float64 `json:"paidMonthsPerYear" binding:"gte=0,lte=12"`
	MonthlyAccountingCost    float64 `json:"monthlyAccountingCost" binding:"gte=0"`
	MonthlyHealthPlanCost    float64 `json:"monthlyHealthPlanCost" binding:"gte=0"`
	OtherMonthlyCosts        float64 `json:"otherMonthlyCosts" binding:"gte=0"`
	VacationReserveRate      float64 `json:"vacationReserveRate" binding:"gte=0,lte=1"`
	ThirteenthReserveRate    float64 `json:"thirteenthReserveRate" binding:"gte=0,lte=1"`
	FGTSReserveRate          float64 `json:"fgtsReserveRate" binding:"gte=0,lte=1"`
	EmergencyReserveRate     float64 `json:"emergencyReserveRate" binding:"gte=0,lte=1"`
	ContractRisk             string  `json:"contractRisk"`
	NoticeDays               int     `json:"noticeDays" binding:"gte=0"`
	HasPaidVacation          bool    `json:"hasPaidVacation"`
	AllowsOtherClients       bool    `json:"allowsOtherClients"`
	RequiresExclusivity      bool    `json:"requiresExclusivity"`
}

type CompareInput struct {
	CLT CLTInput `json:"clt" binding:"required"`
	PJ  PJInput  `json:"pj" binding:"required"`
}

type CLTToPJInput struct {
	CLT CLTInput `json:"clt" binding:"required"`
	PJ  PJInput  `json:"pj"`
}

type PJToCLTInput struct {
	PJ PJInput `json:"pj" binding:"required"`
}

type Parameters struct {
	FGTSRate                 float64
	TerminationFGTSPenalty   float64
	DefaultPJTaxRate         float64
	DefaultProLaboreRate     float64
	DefaultPaidMonthsPerYear float64
	DefaultVacationReserve   float64
	DefaultThirteenthReserve float64
	DefaultFGTSReserve       float64
	DefaultEmergencyReserve  float64
	LowRiskPremium           float64
	MediumRiskPremium        float64
	HighRiskPremium          float64
}

type MoneyBreakdown struct {
	MonthlyNet             float64 `json:"monthlyNet"`
	AnnualNet              float64 `json:"annualNet"`
	MonthlyReserve         float64 `json:"monthlyReserve"`
	AnnualReserve          float64 `json:"annualReserve"`
	MonthlyGross           float64 `json:"monthlyGross"`
	MonthlyTaxableIncome   float64 `json:"monthlyTaxableIncome"`
	MonthlyINSS            float64 `json:"monthlyInss"`
	MonthlyIRRF            float64 `json:"monthlyIrrf"`
	MonthlyTaxes           float64 `json:"monthlyTaxes"`
	MonthlyCosts           float64 `json:"monthlyCosts"`
	AnnualThirteenthNet    float64 `json:"annualThirteenthNet"`
	AnnualVacationNet      float64 `json:"annualVacationNet"`
	AnnualFGTS             float64 `json:"annualFgts"`
	AnnualTerminationValue float64 `json:"annualTerminationValue"`
	AnnualBenefits         float64 `json:"annualBenefits"`
	AnnualProtectionValue  float64 `json:"annualProtectionValue"`
	TaxRegime              string  `json:"taxRegime"`
	EffectiveTaxRate       float64 `json:"effectiveTaxRate"`
	FactorR                float64 `json:"factorR"`
	ProLabore              float64 `json:"proLabore"`
	PaidMonthsPerYear      float64 `json:"paidMonthsPerYear"`
	RiskPremiumRate        float64 `json:"riskPremiumRate"`
	RequiredRiskPremiumPJ  float64 `json:"requiredRiskPremiumPj"`
}

type CompareResult struct {
	CLT                  MoneyBreakdown `json:"clt"`
	PJ                   MoneyBreakdown `json:"pj"`
	MonthlyDifference    float64        `json:"monthlyDifference"`
	AnnualDifference     float64        `json:"annualDifference"`
	RiskAdjustedGap      float64        `json:"riskAdjustedGap"`
	RecommendedOption    string         `json:"recommendedOption"`
	MinimumPJToBreakEven float64        `json:"minimumPjToBreakEven"`
	MinimumPJRecommended float64        `json:"minimumPjRecommended"`
	Summary              string         `json:"summary"`
	Reasons              []string       `json:"reasons"`
}

type EquivalentResult struct {
	EquivalentValue      float64        `json:"equivalentValue"`
	RecommendedValue     float64        `json:"recommendedValue"`
	MinimumBreakEven     float64        `json:"minimumBreakEven"`
	Reference            MoneyBreakdown `json:"reference"`
	Equivalent           MoneyBreakdown `json:"equivalent"`
	Summary              string         `json:"summary"`
	RecommendedOption    string         `json:"recommendedOption"`
	RiskPremiumRate      float64        `json:"riskPremiumRate"`
	MonthlyDifference    float64        `json:"monthlyDifference"`
	AnnualDifference     float64        `json:"annualDifference"`
	RiskAdjustedGap      float64        `json:"riskAdjustedGap"`
	MinimumPJToBreakEven float64        `json:"minimumPjToBreakEven"`
	MinimumPJRecommended float64        `json:"minimumPjRecommended"`
	Reasons              []string       `json:"reasons"`
}
