package users

import "time"

type User struct {
	ID               string     `json:"id"`
	Name             string     `json:"name"`
	Email            string     `json:"email"`
	PasswordHash     string     `json:"password_hash"`
	Role             string     `json:"role"`
	EmailConfirmedAt *time.Time `json:"email_confirmed_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type AuthToken struct {
	ID        string     `json:"id"`
	UserID    string     `json:"user_id"`
	Purpose   string     `json:"purpose"`
	TokenHash string     `json:"token_hash"`
	ExpiresAt time.Time  `json:"expires_at"`
	UsedAt    *time.Time `json:"used_at"`
	CreatedAt time.Time  `json:"created_at"`
}

type Calculation struct {
	ID                 string    `json:"id"`
	UserID             *string   `json:"user_id"`
	Type               string    `json:"type"`
	InputJSON          any       `json:"input_json"`
	ResultJSON         any       `json:"result_json"`
	Recommendation     string    `json:"recommendation"`
	CalculationVersion string    `json:"calculation_version"`
	CreatedAt          time.Time `json:"created_at"`
}
