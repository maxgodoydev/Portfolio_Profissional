package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/maxgodoydev/portfolio/internal/config"
	"github.com/maxgodoydev/portfolio/internal/store"
)

// Contrato consumido pelo painel (web/src/services/api.ts). Se algo aqui mudar, o frontend muda junto.

func adminCookie(t *testing.T, s *Server) *http.Cookie {
	t.Helper()
	rec := do(s, "POST", "/api/admin/login", `{"password":"senha-de-teste"}`, nil)
	if rec.Code != 200 {
		t.Fatalf("login: %d %s", rec.Code, rec.Body.String())
	}
	for _, c := range rec.Result().Cookies() {
		if c.Name == cookieName {
			return c
		}
	}
	t.Fatal("cookie de sessão ausente")
	return nil
}

func getAuthed(s *Server, path string, c *http.Cookie) *httptest.ResponseRecorder {
	req := httptest.NewRequest("GET", path, nil)
	req.Header.Set("User-Agent", browserUA)
	if c != nil {
		req.AddCookie(c)
	}
	rec := httptest.NewRecorder()
	s.ServeHTTP(rec, req)
	return rec
}

func decode(t *testing.T, rec *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var m map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &m); err != nil {
		t.Fatalf("JSON inválido: %v (%s)", err, rec.Body.String())
	}
	return m
}

func TestAdminCookieAttributes(t *testing.T) {
	s := newTestServer()
	rec := do(s, "POST", "/api/admin/login", `{"password":"senha-de-teste"}`, map[string]string{"X-Forwarded-Proto": "https"})
	var c *http.Cookie
	for _, x := range rec.Result().Cookies() {
		if x.Name == cookieName {
			c = x
		}
	}
	if c == nil || !c.HttpOnly || !c.Secure || c.SameSite != http.SameSiteStrictMode || c.Path != "/api" {
		t.Fatalf("cookie deve ser HttpOnly, Secure (https), SameSite=Strict e Path=/api: %+v", c)
	}
	if strings.Contains(rec.Body.String(), c.Value) {
		t.Fatal("o token não pode aparecer no corpo da resposta")
	}
	out := decode(t, rec)
	if d := out["data"].(map[string]any); d["authenticated"] != true {
		t.Fatalf("login deve devolver authenticated:true: %v", out)
	}
}

func TestAdminProtectedRoutesRequireSession(t *testing.T) {
	s := newTestServer()
	for _, p := range []string{"/api/admin/session", "/api/admin/stats", "/api/admin/ops"} {
		rec := getAuthed(s, p, nil)
		if rec.Code != 401 {
			t.Fatalf("%s sem cookie: esperado 401, veio %d", p, rec.Code)
		}
		out := decode(t, rec)
		if out["ok"] != false || out["error"].(map[string]any)["code"] != "unauthorized" {
			t.Fatalf("%s: envelope de erro inesperado: %v", p, out)
		}
	}
	forged := &http.Cookie{Name: cookieName, Value: "9999999999.deadbeef"}
	if rec := getAuthed(s, "/api/admin/stats", forged); rec.Code != 401 {
		t.Fatalf("cookie forjado deve dar 401, veio %d", rec.Code)
	}
	expired := &http.Cookie{Name: cookieName, Value: s.newSessionValue(time.Now().Add(-9 * time.Hour))}
	if rec := getAuthed(s, "/api/admin/session", expired); rec.Code != 401 {
		t.Fatalf("sessão expirada deve dar 401, veio %d", rec.Code)
	}
}

func TestAdminDisabledAnswers503(t *testing.T) {
	s := New(config.Config{Env: "development"}, store.NewMemory(), NewLogger())
	for _, rec := range []*httptest.ResponseRecorder{
		do(s, "POST", "/api/admin/login", `{"password":"x"}`, nil),
		getAuthed(s, "/api/admin/session", nil),
	} {
		if rec.Code != 503 || decode(t, rec)["error"].(map[string]any)["code"] != "admin_disabled" {
			t.Fatalf("admin sem configuração: esperado 503 admin_disabled, veio %d %s", rec.Code, rec.Body.String())
		}
	}
}

func TestAdminLogoutClearsCookie(t *testing.T) {
	s := newTestServer()
	rec := do(s, "POST", "/api/admin/logout", "", nil)
	if rec.Code != 200 {
		t.Fatalf("logout: %d", rec.Code)
	}
	for _, c := range rec.Result().Cookies() {
		if c.Name == cookieName && c.MaxAge < 0 {
			return
		}
	}
	t.Fatal("logout deve expirar o cookie")
}

func TestStatsContractWithoutAndWithData(t *testing.T) {
	s := newTestServer()
	c := adminCookie(t, s)

	// Sem eventos: todas as listas devem ser [] (nunca null), para o painel não quebrar.
	rec := getAuthed(s, "/api/admin/stats?days=7", c)
	if rec.Code != 200 {
		t.Fatalf("stats: %d %s", rec.Code, rec.Body.String())
	}
	data := decode(t, rec)["data"].(map[string]any)
	for _, k := range []string{"daily", "topPages", "topProjects", "resumeByLang", "languages", "devices", "sources", "themes"} {
		arr, ok := data[k].([]any)
		if !ok {
			t.Fatalf("%s deve ser lista (não null): %v", k, data[k])
		}
		if k == "daily" && len(arr) != 7 {
			t.Fatalf("daily deve ter 7 dias, veio %d", len(arr))
		}
	}
	for _, k := range []string{"days", "from", "to", "totalPageViews", "totalSessions", "projectViews", "resumeDownloads", "persistent", "store"} {
		if _, ok := data[k]; !ok {
			t.Fatalf("campo %q ausente em /admin/stats", k)
		}
	}
	if data["persistent"] != false || data["store"] != "memory" {
		t.Fatalf("store em memória deve se declarar volátil: %v %v", data["persistent"], data["store"])
	}

	// Com eventos reais enviados pela API pública.
	for _, ev := range []string{
		`{"type":"pageview","path":"/pt/","lang":"pt","theme":"ice-tangerine"}`,
		`{"type":"pageview","path":"/en/projects","lang":"en"}`,
		`{"type":"project_view","path":"/pt/projects/x","target":"barbershop-do-gui","lang":"pt"}`,
		`{"type":"resume_download","path":"/pt/resume","target":"pt","lang":"pt"}`,
		`{"type":"theme_change","path":"/pt/","target":"sage-ink","lang":"pt"}`,
	} {
		if r := do(s, "POST", "/api/events", ev, nil); r.Code != 202 {
			t.Fatalf("evento %s: %d %s", ev, r.Code, r.Body.String())
		}
	}
	data = decode(t, getAuthed(s, "/api/admin/stats?days=7", c))["data"].(map[string]any)
	if data["totalPageViews"].(float64) != 2 || data["projectViews"].(float64) != 1 || data["resumeDownloads"].(float64) != 1 {
		t.Fatalf("totais inesperados: %v", data)
	}
	if th := data["themes"].([]any); len(th) != 1 || th[0].(map[string]any)["label"] != "sage-ink" {
		t.Fatalf("themes: %v", data["themes"])
	}
}

func TestStatsDaysValidation(t *testing.T) {
	s := newTestServer()
	c := adminCookie(t, s)
	for _, q := range []string{"0", "366", "abc", "-1"} {
		rec := getAuthed(s, "/api/admin/stats?days="+q, c)
		if rec.Code != 422 || decode(t, rec)["error"].(map[string]any)["code"] != "validation_error" {
			t.Fatalf("days=%s: esperado 422 validation_error, veio %d", q, rec.Code)
		}
	}
	for _, q := range []string{"1", "365"} {
		if rec := getAuthed(s, "/api/admin/stats?days="+q, c); rec.Code != 200 {
			t.Fatalf("days=%s: esperado 200, veio %d", q, rec.Code)
		}
	}
}

func TestOpsContractEmptyListsAreArrays(t *testing.T) {
	s := newTestServer()
	c := adminCookie(t, s)
	rec := getAuthed(s, "/api/admin/ops", c)
	if rec.Code != 200 {
		t.Fatalf("ops: %d", rec.Code)
	}
	data := decode(t, rec)["data"].(map[string]any)
	if data["scope"] != "instance" {
		t.Fatalf("scope: %v", data["scope"])
	}
	// Nenhum 5xx ocorreu: recentErrors precisa ser [] e não null.
	if arr, ok := data["recentErrors"].([]any); !ok || len(arr) != 0 {
		t.Fatalf("recentErrors deve ser [] sem erros 5xx, veio %#v", data["recentErrors"])
	}
	routes, ok := data["routes"].([]any)
	if !ok || len(routes) == 0 {
		t.Fatalf("routes deve listar as rotas já chamadas: %#v", data["routes"])
	}
	r0 := routes[0].(map[string]any)
	for _, k := range []string{"route", "count", "errors", "avgMs", "maxMs"} {
		if _, ok := r0[k]; !ok {
			t.Fatalf("rota sem campo %q: %v", k, r0)
		}
	}
	db := data["database"].(map[string]any)
	if db["status"] != "ok" || db["kind"] != "memory" {
		t.Fatalf("database: %v", db)
	}
	for _, k := range []string{"uptimeSeconds", "requests", "errors"} {
		if _, ok := data[k]; !ok {
			t.Fatalf("campo %q ausente em /admin/ops", k)
		}
	}
}

func TestOpsCountersRecordServerErrors(t *testing.T) {
	o := newOps()
	o.record("contact", 500, 3*time.Millisecond, "abc")
	o.record("contact", 404, time.Millisecond, "def")
	total, errs, routes, recent := o.snapshot()
	if total != 2 || errs != 2 || len(routes) != 1 || routes[0].Errors != 2 {
		t.Fatalf("contadores: %d %d %+v", total, errs, routes)
	}
	if len(recent) != 1 || recent[0].RequestID != "abc" || recent[0].Status != 500 {
		t.Fatalf("recentErrors só guarda 5xx: %+v", recent)
	}
}

func TestReadyAndInfoEnvelopes(t *testing.T) {
	s := newTestServer()
	rec := do(s, "GET", "/api/ready", "", nil)
	d := decode(t, rec)["data"].(map[string]any)
	db := d["checks"].(map[string]any)["database"].(map[string]any)
	if rec.Code != 200 || d["status"] != "ready" || db["status"] != "ok" {
		t.Fatalf("ready: %d %v", rec.Code, d)
	}
	f := decode(t, do(s, "GET", "/api/info", "", nil))["data"].(map[string]any)["features"].(map[string]any)
	for _, k := range []string{"metricsPersistent", "contact", "assistant"} {
		if _, ok := f[k]; !ok {
			t.Fatalf("features.%s ausente", k)
		}
	}
}

// Cabeçalhos de IP forjados não podem burlar o limite de tentativas de login.
func TestLoginRateLimitCannotBeBypassedWithSpoofedIPHeaders(t *testing.T) {
	failedLoginDelay = 0
	defer func() { failedLoginDelay = 400 * time.Millisecond }()
	s := newTestServer()
	var blocked int
	for i := 0; i < globalLoginMax+5; i++ {
		rec := do(s, "POST", "/api/admin/login", `{"password":"errada"}`, map[string]string{"X-Forwarded-For": "10.1.0." + string(rune('A'+i%26)) + string(rune('a'+i/26))})
		if rec.Code == http.StatusTooManyRequests {
			blocked++
		}
	}
	if blocked == 0 {
		t.Fatal("o limite global deveria bloquear depois de globalLoginMax tentativas, mesmo com IPs diferentes")
	}
}
