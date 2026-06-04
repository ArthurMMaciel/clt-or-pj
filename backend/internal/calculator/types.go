package calculator

type CLTInput struct {
	GrossSalary       float64 `json:"grossSalary" binding:"required,gte=0"`
	MonthlyBenefits   float64 `json:"monthlyBenefits" binding:"gte=0"`
	MonthlyDiscounts  float64 `json:"monthlyDiscounts" binding:"gte=0"`
	AnnualBonus       float64 `json:"annualBonus" binding:"gte=0"`
	IncludeFGTS       bool    `json:"includeFgts"`
	IncludeThirteenth bool    `json:"includeThirteenth"`
	IncludeVacation   bool    `json:"includeVacation"`
}

type PJInput struct {
	MonthlyRate           float64 `json:"monthlyRate" binding:"required,gte=0"`
	EffectiveTaxRate      float64 `json:"effectiveTaxRate" binding:"gte=0,lte=1"`
	MonthlyAccountingCost float64 `json:"monthlyAccountingCost" binding:"gte=0"`
	MonthlyHealthPlanCost float64 `json:"monthlyHealthPlanCost" binding:"gte=0"`
	OtherMonthlyCosts     float64 `json:"otherMonthlyCosts" binding:"gte=0"`
	VacationReserveRate   float64 `json:"vacationReserveRate" binding:"gte=0,lte=1"`
	ThirteenthReserveRate float64 `json:"thirteenthReserveRate" binding:"gte=0,lte=1"`
	EmergencyReserveRate  float64 `json:"emergencyReserveRate" binding:"gte=0,lte=1"`
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
	DefaultPJTaxRate         float64
	DefaultVacationReserve   float64
	DefaultThirteenthReserve float64
	DefaultEmergencyReserve  float64
}

type MoneyBreakdown struct {
	MonthlyNet     float64 `json:"monthlyNet"`
	AnnualNet      float64 `json:"annualNet"`
	MonthlyReserve float64 `json:"monthlyReserve"`
	AnnualReserve  float64 `json:"annualReserve"`
}

type CompareResult struct {
	CLT                  MoneyBreakdown `json:"clt"`
	PJ                   MoneyBreakdown `json:"pj"`
	MonthlyDifference    float64        `json:"monthlyDifference"`
	AnnualDifference     float64        `json:"annualDifference"`
	RecommendedOption    string         `json:"recommendedOption"`
	MinimumPJToBreakEven float64        `json:"minimumPjToBreakEven"`
	Reasons              []string       `json:"reasons"`
}

type EquivalentResult struct {
	EquivalentValue float64        `json:"equivalentValue"`
	Reference       MoneyBreakdown `json:"reference"`
	Reasons         []string       `json:"reasons"`
}
