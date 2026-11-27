package mailer

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"net/http"
	"net/url"
	"time"
)

// Envio de email transacional pela API do Resend (https://resend.com/docs/api-reference/emails/send-email).
type Service struct {
	apiKey           string
	fromEmail        string
	fromName         string
	emailConfirmURL  string
	passwordResetURL string
	endpoint         string
	httpClient       *http.Client
}

func NewService(apiKey, fromEmail, fromName, emailConfirmURL, passwordResetURL string) *Service {
	return &Service{
		apiKey:           apiKey,
		fromEmail:        fromEmail,
		fromName:         fromName,
		emailConfirmURL:  emailConfirmURL,
		passwordResetURL: passwordResetURL,
		endpoint:         "https://api.resend.com/emails",
		httpClient:       &http.Client{Timeout: 15 * time.Second},
	}
}

func (s *Service) SendConfirmationEmail(toEmail, toName, token string) error {
	link := s.emailConfirmURL + "?token=" + url.QueryEscape(token)
	return s.send(toEmail, "Confirme seu cadastro no CLT ou PJ", message{
		greeting: toName,
		intro:    "Falta só confirmar seu email para salvar suas simulações.",
		action:   "Confirmar email",
		link:     link,
		footer:   "O link vale 24 horas. Se você não criou uma conta no CLT ou PJ, ignore este email.",
	})
}

func (s *Service) SendPasswordResetEmail(toEmail, toName, token string) error {
	link := s.passwordResetURL + "?token=" + url.QueryEscape(token)
	return s.send(toEmail, "Redefina sua senha no CLT ou PJ", message{
		greeting: toName,
		intro:    "Recebemos um pedido para redefinir a senha da sua conta.",
		action:   "Criar nova senha",
		link:     link,
		footer:   "Se você não pediu a troca de senha, ignore este email. Sua senha atual continua valendo.",
	})
}

type message struct {
	greeting string
	intro    string
	action   string
	link     string
	footer   string
}

func (m message) text() string {
	return fmt.Sprintf("Olá, %s.\n\n%s\n\n%s: %s\n\n%s\n", m.greeting, m.intro, m.action, m.link, m.footer)
}

func (m message) html() string {
	e := html.EscapeString
	return fmt.Sprintf(`<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0e1d17;max-width:480px">
<p>Olá, %s.</p>
<p>%s</p>
<p><a href="%s" style="display:inline-block;background:#17694a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">%s</a></p>
<p style="font-size:13px;color:#5f6b65">Se o botão não abrir, copie este endereço no navegador:<br>%s</p>
<p style="font-size:13px;color:#5f6b65">%s</p>
</div>`, e(m.greeting), e(m.intro), e(m.link), e(m.action), e(m.link), e(m.footer))
}

func (s *Service) send(toEmail, subject string, m message) error {
	if s.apiKey == "" {
		return fmt.Errorf("email service is not configured (RESEND_API_KEY missing)")
	}

	from := s.fromEmail
	if s.fromName != "" {
		from = fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)
	}

	body, err := json.Marshal(map[string]any{
		"from":    from,
		"to":      []string{toEmail},
		"subject": subject,
		"text":    m.text(),
		"html":    m.html(),
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, s.endpoint, bytes.NewReader(body))
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

	responseBody, _ := io.ReadAll(io.LimitReader(res.Body, 2048))
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("resend failed with %d: %s", res.StatusCode, string(responseBody))
	}
	return nil
}
