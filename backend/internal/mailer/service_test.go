package mailer

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSendConfirmationEmailUsesResendPayload(t *testing.T) {
	var got map[string]any
	var auth string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth = r.Header.Get("Authorization")
		_ = json.NewDecoder(r.Body).Decode(&got)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"id":"test"}`))
	}))
	defer server.Close()

	s := NewService("re_test", "contato@exemplo.com.br", "CLT ou PJ", "https://site/confirmar-email", "https://site/redefinir-senha")
	s.endpoint = server.URL

	if err := s.SendConfirmationEmail("pessoa@exemplo.com", "Pessoa", "tok en"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if auth != "Bearer re_test" {
		t.Fatalf("authorization header = %q", auth)
	}
	if got["from"] != "CLT ou PJ <contato@exemplo.com.br>" {
		t.Fatalf("from = %v", got["from"])
	}
	if to, _ := got["to"].([]any); len(to) != 1 || to[0] != "pessoa@exemplo.com" {
		t.Fatalf("to = %v", got["to"])
	}
	if text, _ := got["text"].(string); !strings.Contains(text, "https://site/confirmar-email?token=tok+en") {
		t.Fatalf("text without escaped link: %q", text)
	}
}

func TestSendReturnsErrorOnProviderFailure(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusForbidden)
		_, _ = w.Write([]byte(`{"message":"domain not verified"}`))
	}))
	defer server.Close()

	s := NewService("re_test", "a@b.com", "", "https://site/c", "https://site/r")
	s.endpoint = server.URL
	if err := s.SendPasswordResetEmail("x@y.com", "X", "t"); err == nil || !strings.Contains(err.Error(), "403") {
		t.Fatalf("expected 403 error, got %v", err)
	}
}

func TestSendWithoutKeyFails(t *testing.T) {
	s := NewService("", "a@b.com", "", "https://site/c", "https://site/r")
	if err := s.SendConfirmationEmail("x@y.com", "X", "t"); err == nil {
		t.Fatal("expected error when RESEND_API_KEY is missing")
	}
}
