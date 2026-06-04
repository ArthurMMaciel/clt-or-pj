package config

import (
	"bufio"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv            string
	Port              string
	FrontendURL       string
	JWTSecret         string
	JWTExpiresIn      time.Duration
	SupabaseURL       string
	SupabaseSecretKey string
	SendGridAPIKey    string
	SendGridFromEmail string
	SendGridFromName  string
	EmailConfirmURL   string
	PasswordResetURL  string
}

func Load() Config {
	loadDotEnv("../.env")
	loadDotEnv(".env")

	return Config{
		AppEnv:            env("APP_ENV", "local"),
		Port:              env("PORT", "8080"),
		FrontendURL:       env("FRONTEND_URL", "http://localhost:5173"),
		JWTSecret:         env("JWT_SECRET", "change-me"),
		JWTExpiresIn:      durationEnv("JWT_EXPIRES_IN_MINUTES", 60*24),
		SupabaseURL:       strings.TrimRight(env("SUPABASE_URL", ""), "/"),
		SupabaseSecretKey: env("SUPABASE_SECRET_KEY", ""),
		SendGridAPIKey:    env("SENDGRID_API_KEY", ""),
		SendGridFromEmail: env("SENDGRID_FROM_EMAIL", "no-reply@example.com"),
		SendGridFromName:  env("SENDGRID_FROM_NAME", "CLT ou PJ"),
		EmailConfirmURL:   env("EMAIL_CONFIRM_URL", "http://localhost:5173/confirmar-email"),
		PasswordResetURL:  env("PASSWORD_RESET_URL", "http://localhost:5173/redefinir-senha"),
	}
}

func env(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func durationEnv(key string, fallbackMinutes int) time.Duration {
	raw := env(key, "")
	if raw == "" {
		return time.Duration(fallbackMinutes) * time.Minute
	}

	minutes, err := strconv.Atoi(raw)
	if err != nil || minutes <= 0 {
		return time.Duration(fallbackMinutes) * time.Minute
	}

	return time.Duration(minutes) * time.Minute
}

func loadDotEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.Trim(strings.TrimSpace(parts[1]), `"`)
		if os.Getenv(key) == "" {
			_ = os.Setenv(key, value)
		}
	}
}
