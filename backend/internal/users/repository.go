package users

import (
	"net/url"
	"time"

	"clt-or-pj/backend/internal/supabase"
)

type Repository struct {
	client *supabase.Client
}

func NewRepository(client *supabase.Client) *Repository {
	return &Repository{client: client}
}

func (r *Repository) CreateUser(name, email, passwordHash string) (User, error) {
	payload := map[string]any{
		"name":          name,
		"email":         email,
		"password_hash": passwordHash,
		"role":          "user",
	}

	var users []User
	err := r.client.Insert("app_users", payload, &users)
	if err != nil || len(users) == 0 {
		return User{}, err
	}
	return users[0], nil
}

func (r *Repository) FindUserByEmail(email string) (User, bool, error) {
	query := url.Values{}
	query.Set("email", "eq."+email)
	query.Set("select", "*")
	query.Set("limit", "1")

	var users []User
	err := r.client.Select("app_users", query, &users)
	if err != nil {
		return User{}, false, err
	}
	if len(users) == 0 {
		return User{}, false, nil
	}
	return users[0], true, nil
}

func (r *Repository) FindUserByID(id string) (User, bool, error) {
	query := url.Values{}
	query.Set("id", "eq."+id)
	query.Set("select", "*")
	query.Set("limit", "1")

	var users []User
	err := r.client.Select("app_users", query, &users)
	if err != nil {
		return User{}, false, err
	}
	if len(users) == 0 {
		return User{}, false, nil
	}
	return users[0], true, nil
}

func (r *Repository) ConfirmUserEmail(userID string) error {
	now := time.Now().UTC()
	payload := map[string]any{
		"email_confirmed_at": now,
		"updated_at":         now,
	}

	query := url.Values{}
	query.Set("id", "eq."+userID)

	return r.client.Patch("app_users", query, payload, nil)
}

func (r *Repository) UpdatePassword(userID, passwordHash string) error {
	payload := map[string]any{
		"password_hash": passwordHash,
		"updated_at":    time.Now().UTC(),
	}

	query := url.Values{}
	query.Set("id", "eq."+userID)

	return r.client.Patch("app_users", query, payload, nil)
}

func (r *Repository) CreateAuthToken(userID, purpose, tokenHash string, expiresAt time.Time) error {
	payload := map[string]any{
		"user_id":    userID,
		"purpose":    purpose,
		"token_hash": tokenHash,
		"expires_at": expiresAt,
	}

	return r.client.Insert("auth_tokens", payload, nil)
}

func (r *Repository) FindValidToken(tokenHash, purpose string, now time.Time) (AuthToken, bool, error) {
	query := url.Values{}
	query.Set("token_hash", "eq."+tokenHash)
	query.Set("purpose", "eq."+purpose)
	query.Set("used_at", "is.null")
	query.Set("expires_at", "gt."+now.Format(time.RFC3339))
	query.Set("select", "*")
	query.Set("limit", "1")

	var tokens []AuthToken
	err := r.client.Select("auth_tokens", query, &tokens)
	if err != nil {
		return AuthToken{}, false, err
	}
	if len(tokens) == 0 {
		return AuthToken{}, false, nil
	}
	return tokens[0], true, nil
}

func (r *Repository) MarkTokenUsed(tokenID string) error {
	query := url.Values{}
	query.Set("id", "eq."+tokenID)

	return r.client.Patch("auth_tokens", query, map[string]any{"used_at": time.Now().UTC()}, nil)
}

func (r *Repository) SaveCalculation(userID *string, calculationType string, input any, result any, recommendation string) error {
	payload := map[string]any{
		"user_id":             userID,
		"type":                calculationType,
		"input_json":          input,
		"result_json":         result,
		"recommendation":      recommendation,
		"calculation_version": "mvp-1",
	}

	return r.client.Insert("calculations", payload, nil)
}

func (r *Repository) ListUserCalculations(userID string) ([]Calculation, error) {
	query := url.Values{}
	query.Set("user_id", "eq."+userID)
	query.Set("select", "*")
	query.Set("order", "created_at.desc")

	var calculations []Calculation
	err := r.client.Select("calculations", query, &calculations)
	return calculations, err
}
