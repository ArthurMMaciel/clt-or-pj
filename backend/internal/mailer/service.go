package mailer

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type Service struct {
	apiKey           string
	fromEmail        string
	fromName         string
	emailConfirmURL  string
	passwordResetURL string
	httpClient       *http.Client
}

func NewService(apiKey, fromEmail, fromName, emailConfirmURL, passwordResetURL string) *Service {
	return &Service{
		apiKey:           apiKey,
		fromEmail:        fromEmail,
		fromName:         fromName,
		emailConfirmURL:  emailConfirmURL,
		passwordResetURL: passwordResetURL,
		httpClient:       &http.Client{Timeout: 15 * time.Second},
	}
}

func (s *Service) SendConfirmationEmail(toEmail, toName, token string) error {
	link := s.emailConfirmURL + "?token=" + url.QueryEscape(token)
	return s.send(toEmail, toName, "Confirme seu cadastro no CLT ou PJ", fmt.Sprintf("Confirme seu email acessando: %s", link))
}

func (s *Service) SendPasswordResetEmail(toEmail, toName, token string) error {
	link := s.passwordResetURL + "?token=" + url.QueryEscape(token)
	return s.send(toEmail, toName, "Redefina sua senha no CLT ou PJ", fmt.Sprintf("Redefina sua senha acessando: %s", link))
}

func (s *Service) send(toEmail, toName, subject, text string) error {
	if s.apiKey == "" {
		return nil
	}

	payload := map[string]any{
		"personalizations": []map[string]any{
			{
				"to": []map[string]string{
					{"email": toEmail, "name": toName},
				},
			},
		},
		"from": map[string]string{
			"email": s.fromEmail,
			"name":  s.fromName,
		},
		"subject": subject,
		"content": []map[string]string{
			{"type": "text/plain", "value": text},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.sendgrid.com/v3/mail/send", bytes.NewReader(body))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	res, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	responseBody, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("sendgrid failed with %d: %s", res.StatusCode, string(responseBody))
	}

	return nil
}
