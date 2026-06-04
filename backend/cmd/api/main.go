package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"clt-or-pj/backend/internal/auth"
	"clt-or-pj/backend/internal/calculator"
	"clt-or-pj/backend/internal/config"
	"clt-or-pj/backend/internal/httpapi"
	"clt-or-pj/backend/internal/mailer"
	"clt-or-pj/backend/internal/supabase"
	"clt-or-pj/backend/internal/users"
)

type app struct {
	config      config.Config
	repository  *users.Repository
	tokenIssuer *auth.TokenIssuer
}

func main() {
	cfg := config.Load()
	supabaseClient := supabase.NewClient(cfg.SupabaseURL, cfg.SupabaseSecretKey)
	repository := users.NewRepository(supabaseClient)
	tokenIssuer := auth.NewTokenIssuer(cfg.JWTSecret, cfg.JWTExpiresIn)
	mailerService := mailer.NewService(
		cfg.SendGridAPIKey,
		cfg.SendGridFromEmail,
		cfg.SendGridFromName,
		cfg.EmailConfirmURL,
		cfg.PasswordResetURL,
	)
	authService := auth.NewService(repository, tokenIssuer, mailerService)
	authHandlers := httpapi.NewAuthHandlers(authService)
	userHandlers := httpapi.NewUserHandlers(repository)
	application := app{config: cfg, repository: repository, tokenIssuer: tokenIssuer}

	router := gin.Default()
	router.Use(corsMiddleware(cfg.FrontendURL))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := router.Group("/api/v1")
	{
		api.POST("/calculations/compare", application.compare)
		api.POST("/calculations/clt-to-pj", application.cltToPJ)
		api.POST("/calculations/pj-to-clt", application.pjToCLT)

		api.POST("/auth/register", authHandlers.Register)
		api.POST("/auth/login", authHandlers.Login)
		api.POST("/auth/confirm-email", authHandlers.ConfirmEmail)
		api.POST("/auth/request-password-reset", authHandlers.RequestPasswordReset)
		api.POST("/auth/reset-password", authHandlers.ResetPassword)

		me := api.Group("/me", httpapi.AuthRequired(tokenIssuer))
		{
			me.GET("", userHandlers.Me)
			me.GET("/calculations", userHandlers.Calculations)
		}
	}

	router.Run(":" + cfg.Port)
}

func corsMiddleware(frontendURL string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", frontendURL)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func (a app) compare(c *gin.Context) {
	var input calculator.CompareInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := calculator.Compare(input, calculator.DefaultParameters())
	a.saveCalculationIfAuthenticated(c, "compare", input, result, result.RecommendedOption)
	c.JSON(http.StatusOK, result)
}

func (a app) cltToPJ(c *gin.Context) {
	var input calculator.CLTToPJInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := calculator.CLTToPJ(input, calculator.DefaultParameters())
	a.saveCalculationIfAuthenticated(c, "clt_to_pj", input, result, "neutral")
	c.JSON(http.StatusOK, result)
}

func (a app) pjToCLT(c *gin.Context) {
	var input calculator.PJToCLTInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := calculator.PJToCLT(input, calculator.DefaultParameters())
	a.saveCalculationIfAuthenticated(c, "pj_to_clt", input, result, "neutral")
	c.JSON(http.StatusOK, result)
}

func (a app) saveCalculationIfAuthenticated(c *gin.Context, calculationType string, input any, result any, recommendation string) {
	claims, ok := httpapi.ClaimsFromRequest(c, a.tokenIssuer)
	if !ok {
		return
	}

	userID := claims.UserID
	_ = a.repository.SaveCalculation(&userID, calculationType, input, result, recommendation)
}
