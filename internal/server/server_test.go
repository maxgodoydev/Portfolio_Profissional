package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/maxgodoydev/portfolio/internal/config"
	"github.com/maxgodoydev/portfolio/internal/store"
)

const browserUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

func newTestServer() *Server {
	cfg := config.Config{
		Env:           "development",
		SessionSecret: strings.Repeat("s", 40),
		AdminPassword: "senha-de-teste",
	}
	return New(cfg, store.NewMemory(), NewLogger())
}

func do(s *Server, method, path, body string, headers map[string]string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("User-Agent", browserUA)
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	rec := httptest.NewRecorder()
	s.ServeHTTP(rec, req)
	return rec
}

func TestHealthAndNotFound(t *testing.T) {
	s := newTestServer()
	if rec := do(s, "GET", "/api/health", "", nil); rec.Code != 200 {
		t.Fatalf("health: esperado 200, veio %d", rec.Code)
	}
	if rec := do(s, "GET", "/api/index?path=health", "", nil); rec.Code != 200 {
		t.Fatalf("rewrite da Vercel (?path=): esperado 200, veio %d", rec.Code)
	}
	if rec := do(s, "GET", "/api/nao-existe", "", nil); rec.Code != 404 {
		t.Fatalf("esperado 404, veio %d", rec.Code)
	}
	if rec := do(s, "GET", "/api/events", "", nil); rec.Code != 405 {
		t.Fatalf("esperado 405, veio %d", rec.Code)
	}
}

func TestEventValidationAndDedupe(t *testing.T) {
	s := newTestServer()
	good := `{"type":"pageview","path":"/pt/projects","lang":"pt","theme":"ice-tangerine"}`
	if rec := do(s, "POST", "/api/events", good, nil); rec.Code != 202 || !strings.Contains(rec.Body.String(), `"recorded":true`) {
		t.Fatalf("evento válido: %d %s", rec.Code, rec.Body.String())
	}
	if rec := do(s, "POST", "/api/events", good, nil); !strings.Contains(rec.Body.String(), `"recorded":false`) {
		t.Fatalf("evento repetido deveria ser ignorado: %s", rec.Body.String())
	}
	bad := `{"type":"hack","path":"x","lang":"fr"}`
	if rec := do(s, "POST", "/api/events", bad, nil); rec.Code != 422 {
		t.Fatalf("evento inválido: esperado 422, veio %d", rec.Code)
	}
	if rec := do(s, "POST", "/api/events", good, map[string]string{"DNT": "1"}); !strings.Contains(rec.Body.String(), `"recorded":false`) {
		t.Fatalf("DNT deveria impedir o registro: %s", rec.Body.String())
	}
	if rec := do(s, "POST", "/api/events", good, map[string]string{"User-Agent": "Googlebot/2.1"}); !strings.Contains(rec.Body.String(), "automated") {
		t.Fatalf("robôs não devem ser contabilizados: %s", rec.Body.String())
	}
}

func TestContactValidation(t *testing.T) {
	s := newTestServer()
	short := `{"name":"A","email":"x","message":"curta","lang":"pt"}`
	if rec := do(s, "POST", "/api/contact", short, nil); rec.Code != 422 {
		t.Fatalf("esperado 422, veio %d", rec.Code)
	}
	spam := `{"name":"Robô","email":"a@b.com","message":"mensagem longa o bastante","website":"http://spam"}`
	if rec := do(s, "POST", "/api/contact", spam, nil); rec.Code != 200 {
		t.Fatalf("honeypot deve responder 200 sem enviar, veio %d", rec.Code)
	}
	valid := `{"name":"Maria","email":"maria@example.com","message":"Olá, gostaria de conversar.","lang":"pt"}`
	// Sem Resend configurado, o envio precisa falhar de forma explícita.
	if rec := do(s, "POST", "/api/contact", valid, nil); rec.Code != 503 {
		t.Fatalf("esperado 503 sem serviço de e-mail, veio %d", rec.Code)
	}
}

func TestAdminFlow(t *testing.T) {
	s := newTestServer()
	if rec := do(s, "GET", "/api/admin/stats", "", nil); rec.Code != 401 {
		t.Fatalf("stats sem login: esperado 401, veio %d", rec.Code)
	}
	if rec := do(s, "POST", "/api/admin/login", `{"password":"errada"}`, nil); rec.Code != 401 {
		t.Fatalf("senha errada: esperado 401, veio %d", rec.Code)
	}
	rec := do(s, "POST", "/api/admin/login", `{"password":"senha-de-teste"}`, nil)
	if rec.Code != 200 {
		t.Fatalf("login: esperado 200, veio %d", rec.Code)
	}
	cookies := rec.Result().Cookies()
	if len(cookies) == 0 || !cookies[0].HttpOnly {
		t.Fatal("cookie de sessão HttpOnly não foi definido")
	}
	req := httptest.NewRequest("GET", "/api/admin/stats?days=7", nil)
	req.AddCookie(cookies[0])
	out := httptest.NewRecorder()
	s.ServeHTTP(out, req)
	if out.Code != 200 {
		t.Fatalf("stats com login: esperado 200, veio %d (%s)", out.Code, out.Body.String())
	}
}

func TestCrossOriginRejected(t *testing.T) {
	s := newTestServer()
	rec := do(s, "POST", "/api/events", `{"type":"pageview","path":"/","lang":"pt"}`, map[string]string{"Origin": "https://evil.example"})
	if rec.Code != http.StatusForbidden {
		t.Fatalf("origem externa: esperado 403, veio %d", rec.Code)
	}
}

func TestValidateContactTrimsControlChars(t *testing.T) {
	in, errs := validateContact(contactIn{Name: "Ana\r\nBcc: x@y.com", Email: "ana@example.com", Message: "uma mensagem válida", Lang: "xx"})
	if errs != nil {
		t.Fatalf("não esperava erros: %v", errs)
	}
	if strings.ContainsAny(in.Name, "\r\n") || in.Lang != "pt" {
		t.Fatalf("normalização falhou: %+v", in)
	}
}
