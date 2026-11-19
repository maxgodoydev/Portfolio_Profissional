package server

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/maxgodoydev/portfolio/internal/config"
	"github.com/maxgodoydev/portfolio/internal/store"
)

// fakeResend simula a API do Resend e guarda o último corpo recebido.
type fakeResend struct {
	*httptest.Server
	calls int
	last  map[string]any
	auth  string
}

func newFakeResend(status int) *fakeResend {
	f := &fakeResend{}
	f.Server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		f.calls++
		f.auth = r.Header.Get("Authorization")
		b, _ := io.ReadAll(r.Body)
		_ = json.Unmarshal(b, &f.last)
		w.WriteHeader(status)
		_, _ = w.Write([]byte(`{"id":"x"}`))
	}))
	return f
}

func contactServer(resendURL string) *Server {
	cfg := config.Config{
		Env:          "development",
		ResendAPIKey: "re_chave_de_teste",
		ContactTo:    "dono@example.com",
		ContactFrom:  "Portfólio <onboarding@resend.dev>",
	}
	s := New(cfg, store.NewMemory(), NewLogger())
	s.resendURL = resendURL
	return s
}

const validContact = `{"name":"Maria","email":"maria@example.com","message":"Olá, gostaria de conversar sobre uma vaga.","lang":"en"}`

func TestContactSuccessOnlyWhenProviderConfirms(t *testing.T) {
	ok := newFakeResend(200)
	defer ok.Close()
	s := contactServer(ok.URL)
	rec := do(s, "POST", "/api/contact", validContact, nil)
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"sent":true`) {
		t.Fatalf("esperado 200 sent:true, veio %d %s", rec.Code, rec.Body.String())
	}
	if ok.calls != 1 || ok.auth != "Bearer re_chave_de_teste" {
		t.Fatalf("chamada ao provedor incorreta: calls=%d", ok.calls)
	}
	if ok.last["reply_to"] != "maria@example.com" || ok.last["to"].([]any)[0] != "dono@example.com" {
		t.Fatalf("payload do e-mail incorreto: %v", ok.last)
	}
	if strings.Contains(rec.Body.String(), "re_chave_de_teste") {
		t.Fatal("a resposta não pode conter a chave da API")
	}

	bad := newFakeResend(500)
	defer bad.Close()
	rec = do(contactServer(bad.URL), "POST", "/api/contact", validContact, nil)
	if rec.Code != http.StatusBadGateway || strings.Contains(rec.Body.String(), `"sent":true`) {
		t.Fatalf("falha do provedor deve virar 502 sem sent:true, veio %d %s", rec.Code, rec.Body.String())
	}
	if strings.Contains(rec.Body.String(), "500") || strings.Contains(rec.Body.String(), "re_chave") {
		t.Fatalf("a resposta não deve vazar detalhes do provedor: %s", rec.Body.String())
	}
}

func TestContactRateLimitAndHoneypotDoNotSend(t *testing.T) {
	f := newFakeResend(200)
	defer f.Close()
	s := contactServer(f.URL)
	spam := `{"name":"Robô","email":"a@b.com","message":"mensagem longa o bastante","website":"http://spam"}`
	if rec := do(s, "POST", "/api/contact", spam, nil); rec.Code != 200 {
		t.Fatalf("honeypot: %d", rec.Code)
	}
	if f.calls != 0 {
		t.Fatal("honeypot não pode disparar e-mail")
	}
	for i := 0; i < 3; i++ {
		if rec := do(s, "POST", "/api/contact", validContact, map[string]string{"X-Real-IP": "203.0.113.7"}); rec.Code != 200 {
			t.Fatalf("envio %d: %d", i+1, rec.Code)
		}
	}
	rec := do(s, "POST", "/api/contact", validContact, map[string]string{"X-Real-IP": "203.0.113.7"})
	if rec.Code != http.StatusTooManyRequests || rec.Header().Get("Retry-After") == "" {
		t.Fatalf("4º envio: esperado 429 com Retry-After, veio %d", rec.Code)
	}
	if f.calls != 3 {
		t.Fatalf("o envio bloqueado não pode chegar ao provedor: calls=%d", f.calls)
	}
}

func TestContactValidationReturnsFieldDetails(t *testing.T) {
	s := contactServer("http://127.0.0.1:1")
	rec := do(s, "POST", "/api/contact", `{"name":"A","email":"nao-e-email","message":"curta","lang":"pt"}`, nil)
	if rec.Code != 422 {
		t.Fatalf("esperado 422, veio %d", rec.Code)
	}
	var out struct {
		Error struct {
			Code    string            `json:"code"`
			Details map[string]string `json:"details"`
		} `json:"error"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	for _, k := range []string{"name", "email", "message"} {
		if out.Error.Details[k] == "" {
			t.Fatalf("faltou detalhe para %q: %v", k, out.Error.Details)
		}
	}
	if rec := do(s, "POST", "/api/contact", validContact, map[string]string{"Content-Type": "text/plain"}); rec.Code != 400 {
		t.Fatalf("Content-Type incorreto: esperado 400, veio %d", rec.Code)
	}
}

func TestEventContractAllTypes(t *testing.T) {
	s := newTestServer()
	cases := []struct {
		name string
		body string
		code int
	}{
		{"pageview", `{"type":"pageview","path":"/en/","lang":"en","theme":"sage-ink","referrer":"www.linkedin.com"}`, 202},
		{"project_view", `{"type":"project_view","path":"/pt/projects/meu-projeto","lang":"pt","target":"meu-projeto"}`, 202},
		{"resume_download", `{"type":"resume_download","path":"/pt/resume","lang":"pt","target":"pt"}`, 202},
		{"theme_change", `{"type":"theme_change","path":"/es/","lang":"es","target":"cherry-cream"}`, 202},
		{"language_change inexistente", `{"type":"language_change","path":"/es/","lang":"es","target":"en"}`, 422},
		{"slug inválido", `{"type":"project_view","path":"/pt/","lang":"pt","target":"../x"}`, 422},
		{"tema inválido", `{"type":"theme_change","path":"/pt/","lang":"pt","target":"neon"}`, 422},
		{"path com query", `{"type":"pageview","path":"/pt/?email=a@b.com","lang":"pt"}`, 422},
	}
	for _, c := range cases {
		if rec := do(s, "POST", "/api/events", c.body, nil); rec.Code != c.code {
			t.Errorf("%s: esperado %d, veio %d (%s)", c.name, c.code, rec.Code, rec.Body.String())
		}
	}
}

func TestEventStoresOnlyCategorizedSource(t *testing.T) {
	s := newTestServer()
	body := `{"type":"pageview","path":"/en/","lang":"en","referrer":"www.linkedin.com"}`
	if rec := do(s, "POST", "/api/events", body, map[string]string{"X-Real-IP": "198.51.100.9"}); rec.Code != 202 {
		t.Fatalf("evento: %d", rec.Code)
	}
	evs, err := s.store.EventsSince(context.Background(), timeZero())
	if err != nil || len(evs) != 1 {
		t.Fatalf("esperava 1 evento, veio %d (%v)", len(evs), err)
	}
	raw, _ := json.Marshal(evs[0])
	if evs[0].Source != "linkedin" {
		t.Fatalf("origem deveria ser categoria, veio %q", evs[0].Source)
	}
	for _, leak := range []string{"198.51.100.9", "linkedin.com", "Mozilla"} {
		if strings.Contains(string(raw), leak) {
			t.Fatalf("o evento serializado contém %q: %s", leak, raw)
		}
	}
}

func TestSecretsAndInfo(t *testing.T) {
	s1 := New(config.Config{Env: "production"}, store.NewMemory(), NewLogger())
	s2 := New(config.Config{Env: "production"}, store.NewMemory(), NewLogger())
	if s1.hashSecret == "" || s1.hashSecret == "dev-only" || s1.hashSecret == s2.hashSecret {
		t.Fatal("sem SESSION_SECRET o segredo precisa ser aleatório por instância, nunca fixo")
	}
	rec := do(s1, "GET", "/api/info", "", nil)
	body := rec.Body.String()
	if rec.Code != 200 || strings.Contains(body, "goVersion") || strings.Contains(body, `"admin"`) {
		t.Fatalf("/info não deve expor versão do runtime nem estado do admin: %d %s", rec.Code, body)
	}
	if !strings.Contains(body, `"metricsPersistent":false`) {
		t.Fatalf("/info deve indicar que a memória não persiste: %s", body)
	}
}

func TestReadyAndConfigWarnings(t *testing.T) {
	s := newTestServer()
	rec := do(s, "GET", "/api/ready", "", nil)
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"kind":"memory"`) {
		t.Fatalf("/ready: %d %s", rec.Code, rec.Body.String())
	}
	w := config.Config{Env: "production", TursoURL: "libsql://x"}.Warnings()
	joined := strings.Join(w, "|")
	for _, want := range []string{"Turso incompleta", "SESSION_SECRET", "RESEND_API_KEY"} {
		if !strings.Contains(joined, want) {
			t.Errorf("aviso esperado sobre %q; veio %v", want, w)
		}
	}
	if strings.Contains(joined, "libsql://x") {
		t.Error("avisos não podem conter valores de configuração")
	}
}

func timeZero() time.Time { return time.Unix(0, 0) }
