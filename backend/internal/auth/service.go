package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"clt-or-pj/backend/internal/mailer"
	"clt-or-pj/backend/internal/users"
)

const (
	PurposeEmailConfirmation = "email_confirmation"
	PurposePasswordReset     = "password_reset"
)

type Service struct {
	repository  *users.Repository
	tokenIssuer *TokenIssuer
	mailer      *mailer.Service
}

func NewService(repository *users.Repository, tokenIssuer *TokenIssuer, mailer *mailer.Service) *Service {
	return &Service{repository: repository, tokenIssuer: tokenIssuer, mailer: mailer}
}

func (s *Service) Register(name, email, password string) (users.User, error) {
	name = strings.TrimSpace(name)
	email = strings.ToLower(strings.TrimSpace(email))

	if name == "" || email == "" || len(password) < 8 {
		return users.User{}, fmt.Errorf("name, valid email and password with at least 8 chars are required")
	}

	if _, exists, err := s.repository.FindUserByEmail(email); err != nil {
		return users.User{}, err
	} else if exists {
		return users.User{}, fmt.Errorf("email already registered")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return users.User{}, err
	}

	user, err := s.repository.CreateUser(name, email, string(passwordHash))
	if err != nil {
		return users.User{}, err
	}

	token, err := randomToken()
	if err != nil {
		return users.User{}, err
	}

	if err := s.repository.CreateAuthToken(user.ID, PurposeEmailConfirmation, hashToken(token), time.Now().UTC().Add(24*time.Hour)); err != nil {
		return users.User{}, err
	}

	_ = s.mailer.SendConfirmationEmail(user.Email, user.Name, token)
	return user, nil
}

func (s *Service) Login(email, password string) (string, users.User, error) {
	user, exists, err := s.repository.FindUserByEmail(strings.ToLower(strings.TrimSpace(email)))
	if err != nil {
		return "", users.User{}, err
	}
	if !exists {
		return "", users.User{}, fmt.Errorf("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", users.User{}, fmt.Errorf("invalid credentials")
	}
	if user.EmailConfirmedAt == nil {
		return "", users.User{}, fmt.Errorf("email not confirmed")
	}

	token, err := s.tokenIssuer.Issue(user)
	return token, user, err
}

func (s *Service) ConfirmEmail(token string) error {
	authToken, exists, err := s.repository.FindValidToken(hashToken(token), PurposeEmailConfirmation, time.Now().UTC())
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("invalid or expired token")
	}

	if err := s.repository.ConfirmUserEmail(authToken.UserID); err != nil {
		return err
	}

	return s.repository.MarkTokenUsed(authToken.ID)
}

func (s *Service) RequestPasswordReset(email string) error {
	user, exists, err := s.repository.FindUserByEmail(strings.ToLower(strings.TrimSpace(email)))
	if err != nil || !exists {
		return err
	}

	token, err := randomToken()
	if err != nil {
		return err
	}

	if err := s.repository.CreateAuthToken(user.ID, PurposePasswordReset, hashToken(token), time.Now().UTC().Add(2*time.Hour)); err != nil {
		return err
	}

	return s.mailer.SendPasswordResetEmail(user.Email, user.Name, token)
}

func (s *Service) ResetPassword(token, password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must have at least 8 chars")
	}

	authToken, exists, err := s.repository.FindValidToken(hashToken(token), PurposePasswordReset, time.Now().UTC())
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("invalid or expired token")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	if err := s.repository.UpdatePassword(authToken.UserID, string(passwordHash)); err != nil {
		return err
	}

	return s.repository.MarkTokenUsed(authToken.ID)
}

func randomToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
