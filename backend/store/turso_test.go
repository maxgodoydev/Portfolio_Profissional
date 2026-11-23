package store

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
)

// fakeTurso implementa o mínimo do protocolo /v2/pipeline para testar o cliente sem rede externa.
type fakeTurso struct {
	mu       sync.Mutex
	requests []struct {
		SQL  string
		Args []tArg
	}
	auth    string
	handler func(sql string, args []tArg) (resp map[string]any, errMsg string)
	status  int
	raw     string
}

func newFake(t *testing.T, h func(sql string, args []tArg) (map[string]any, string)) (*Turso, *fakeTurso) {
	t.Helper()
	f := &fakeTurso{handler: h, status: http.StatusOK}
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		f.mu.Lock()
		defer f.mu.Unlock()
		f.auth = r.Header.Get("Authorization")
		if r.URL.Path != "/v2/pipeline" || r.Method != http.MethodPost {
			t.Errorf("rota inesperada: %s %s", r.Method, r.URL.Path)
		}
		if f.status != http.StatusOK {
			w.WriteHeader(f.status)
			return
		}
		if f.raw != "" {
			_, _ = w.Write([]byte(f.raw))
			return
		}
		var body struct {
			Requests []tRequest `json:"requests"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Errorf("corpo inválido: %v", err)
		}
		results := []map[string]any{}
		for _, rq := range body.Requests {
			if rq.Type != "execute" {
				results = append(results, map[string]any{"type": "ok", "response": map[string]any{"type": "close"}})
				continue
			}
			f.requests = append(f.requests, struct {
				SQL  string
				Args []tArg
			}{rq.Stmt.SQL, rq.Stmt.Args})
			res, errMsg := f.handler(rq.Stmt.SQL, rq.Stmt.Args)
			if errMsg != "" {
				results = append(results, map[string]any{"type": "error", "error": map[string]any{"message": errMsg}})
				continue
			}
			if res == nil {
				res = map[string]any{"rows": [][]any{}, "affected_row_count": 0}
			}
			results = append(results, map[string]any{"type": "ok", "response": map[string]any{"type": "execute", "result": res}})
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"results": results})
	}))
	t.Cleanup(srv.Close)
	tu, err := NewTurso(srv.URL, "segredo-token")
	if err != nil {
		t.Fatal(err)
	}
	tu.client = srv.Client()
	return tu, f
}

func ok(sql string, args []tArg) (map[string]any, string) { return nil, "" }

func TestNewTursoValidation(t *testing.T) {
	for _, tc := range []struct{ url, token string }{{"", "t"}, {"libsql://x", ""}, {"http://x", "t"}, {"ftp://x", "t"}} {
		if _, err := NewTurso(tc.url, tc.token); err == nil {
			t.Errorf("NewTurso(%q, %q) deveria falhar", tc.url, tc.token)
		}
	}
	tu, err := NewTurso("libsql://meu-banco.example.com/", "t")
	if err != nil {
		t.Fatal(err)
	}
	if tu.endpoint != "https://meu-banco.example.com/v2/pipeline" {
		t.Fatalf("endpoint incorreto: %s", tu.endpoint)
	}
	if tu.Kind() != "turso" || !tu.Persistent() {
		t.Fatal("Kind/Persistent incorretos")
	}
}

func TestSchemaCreatedOnceAndAuthSent(t *testing.T) {
	tu, f := newFake(t, ok)
	ctx := context.Background()
	if err := tu.Ping(ctx); err != nil {
		t.Fatal(err)
	}
	if err := tu.Ping(ctx); err != nil {
		t.Fatal(err)
	}
	if f.auth != "Bearer segredo-token" {
		t.Fatalf("cabeçalho Authorization incorreto: %q", f.auth)
	}
	creates := 0
	for _, r := range f.requests {
		if strings.Contains(r.SQL, "CREATE") {
			creates++
		}
	}
	if creates != 3 {
		t.Fatalf("esquema deve ser criado uma vez (3 instruções), foram %d", creates)
	}
}

func TestInsertEventDuplicateAndArgs(t *testing.T) {
	affected := int64(1)
	tu, f := newFake(t, func(sql string, args []tArg) (map[string]any, string) {
		if strings.HasPrefix(strings.TrimSpace(sql), "INSERT OR IGNORE") {
			return map[string]any{"affected_row_count": affected}, ""
		}
		return nil, ""
	})
	e := Event{TS: 1700000000, Type: EventPageView, Path: "/pt", Lang: "pt", Session: "s", Dedupe: "d"}
	inserted, err := tu.InsertEvent(context.Background(), e)
	if err != nil || !inserted {
		t.Fatalf("primeira inserção: %v %v", inserted, err)
	}
	last := f.requests[len(f.requests)-1]
	if len(last.Args) != 10 || last.Args[0].Type != "integer" || last.Args[0].Value != "1700000000" || last.Args[1].Value != EventPageView {
		t.Fatalf("argumentos incorretos: %+v", last.Args)
	}
	affected = 0
	inserted, err = tu.InsertEvent(context.Background(), e)
	if err != nil || inserted {
		t.Fatalf("duplicado deveria retornar false sem erro: %v %v", inserted, err)
	}
}

func TestEventsSinceParsesRows(t *testing.T) {
	txt := func(s string) map[string]any { return map[string]any{"type": "text", "value": s} }
	num := func(s string) map[string]any { return map[string]any{"type": "integer", "value": s} }
	tu, _ := newFake(t, func(sql string, args []tArg) (map[string]any, string) {
		if strings.Contains(sql, "FROM events WHERE ts >=") {
			if args[0].Value != "1000" {
				t.Errorf("filtro de data incorreto: %+v", args)
			}
			return map[string]any{"rows": [][]any{
				{num("1500"), txt("pageview"), txt("/pt"), txt(""), txt("pt"), txt("dark"), txt("mobile"), txt("direct"), txt("abc")},
				{num("1400"), txt("project_view")}, // linha curta é ignorada
			}}, ""
		}
		return nil, ""
	})
	evs, err := tu.EventsSince(context.Background(), time.Unix(1000, 0))
	if err != nil {
		t.Fatal(err)
	}
	if len(evs) != 1 {
		t.Fatalf("esperado 1 evento (linha curta ignorada), veio %d", len(evs))
	}
	if g := evs[0]; g.TS != 1500 || g.Type != "pageview" || g.Lang != "pt" || g.Theme != "dark" || g.Device != "mobile" || g.Session != "abc" {
		t.Fatalf("evento mal interpretado: %+v", g)
	}
}

func TestHitReturnsCountAndErrorsWithoutRows(t *testing.T) {
	withRows := true
	tu, _ := newFake(t, func(sql string, args []tArg) (map[string]any, string) {
		if strings.Contains(sql, "rate_limits (rkey") {
			if !withRows {
				return map[string]any{"rows": [][]any{}}, ""
			}
			return map[string]any{"rows": [][]any{{map[string]any{"type": "integer", "value": "4"}}}}, ""
		}
		return nil, ""
	})
	now := time.Unix(1700000000, 0)
	n, err := tu.Hit(context.Background(), "login:1.2.3.4", 15*time.Minute, now)
	if err != nil || n != 4 {
		t.Fatalf("Hit = %d, %v", n, err)
	}
	withRows = false
	if _, err := tu.Hit(context.Background(), "k", time.Minute, now); err == nil {
		t.Fatal("sem linhas retornadas, Hit deve falhar")
	}
}

func TestPruneSendsTwoDeletes(t *testing.T) {
	tu, f := newFake(t, ok)
	if err := tu.Prune(context.Background(), time.Unix(1000, 0)); err != nil {
		t.Fatal(err)
	}
	deletes := 0
	for _, r := range f.requests {
		if strings.HasPrefix(r.SQL, "DELETE FROM") {
			deletes++
		}
	}
	if deletes != 2 {
		t.Fatalf("esperado 2 DELETE, vieram %d", deletes)
	}
}

func TestErrorsAreReportedAndSchemaRetried(t *testing.T) {
	failing := true
	tu, _ := newFake(t, func(sql string, args []tArg) (map[string]any, string) {
		if failing && strings.Contains(sql, "CREATE TABLE IF NOT EXISTS events") {
			return nil, "database is locked"
		}
		return nil, ""
	})
	err := tu.Ping(context.Background())
	if err == nil || !strings.Contains(err.Error(), "database is locked") {
		t.Fatalf("erro do Turso deveria ser propagado: %v", err)
	}
	failing = false
	if err := tu.Ping(context.Background()); err != nil {
		t.Fatalf("após falha, o esquema deve ser tentado de novo: %v", err)
	}
}

func TestHTTPFailuresAndBadJSON(t *testing.T) {
	tu, f := newFake(t, ok)
	f.status = http.StatusUnauthorized
	if err := tu.Ping(context.Background()); err == nil || !strings.Contains(err.Error(), "401") {
		t.Fatalf("status 401 deveria virar erro: %v", err)
	}
	f.status = http.StatusOK
	f.raw = "isto não é json"
	if err := tu.Ping(context.Background()); err == nil {
		t.Fatal("JSON inválido deveria virar erro")
	}
}

func TestErrorsNeverContainToken(t *testing.T) {
	tu, f := newFake(t, ok)
	f.status = http.StatusInternalServerError
	err := tu.Ping(context.Background())
	if err == nil || strings.Contains(err.Error(), "segredo-token") {
		t.Fatalf("erro não deve conter o token: %v", err)
	}
}

func TestContextCancellation(t *testing.T) {
	tu, _ := newFake(t, ok)
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if err := tu.Ping(ctx); err == nil {
		t.Fatal("contexto cancelado deve falhar")
	}
}
