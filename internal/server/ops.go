package server

import (
	"context"
	"net/http"
	"sort"
	"sync"
	"time"
)

// opsCounters guarda contadores de requisições da instância atual.
// Em ambiente serverless cada instância tem os seus; os números são indicativos.
type opsCounters struct {
	mu     sync.Mutex
	total  int64
	errors int64
	routes map[string]*routeStat
	recent []recentError
}

type routeStat struct {
	Count   int64   `json:"count"`
	Errors  int64   `json:"errors"`
	AvgMs   float64 `json:"avgMs"`
	MaxMs   float64 `json:"maxMs"`
	totalMs float64
}

type recentError struct {
	Time      string `json:"time"`
	Route     string `json:"route"`
	Status    int    `json:"status"`
	RequestID string `json:"requestId"`
}

func newOps() *opsCounters { return &opsCounters{routes: map[string]*routeStat{}} }

func (o *opsCounters) record(route string, status int, d time.Duration, rid string) {
	ms := float64(d.Microseconds()) / 1000
	o.mu.Lock()
	defer o.mu.Unlock()
	o.total++
	st := o.routes[route]
	if st == nil {
		st = &routeStat{}
		o.routes[route] = st
	}
	st.Count++
	st.totalMs += ms
	st.AvgMs = st.totalMs / float64(st.Count)
	if ms > st.MaxMs {
		st.MaxMs = ms
	}
	if status >= 400 {
		o.errors++
		st.Errors++
	}
	if status >= 500 {
		o.recent = append(o.recent, recentError{Time: time.Now().UTC().Format(time.RFC3339), Route: route, Status: status, RequestID: rid})
		if len(o.recent) > 20 {
			o.recent = o.recent[len(o.recent)-20:]
		}
	}
}

type routeOut struct {
	Route string `json:"route"`
	routeStat
}

func (o *opsCounters) snapshot() (int64, int64, []routeOut, []recentError) {
	o.mu.Lock()
	defer o.mu.Unlock()
	out := make([]routeOut, 0, len(o.routes))
	for k, v := range o.routes {
		out = append(out, routeOut{Route: k, routeStat: *v})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Count > out[j].Count })
	// Sempre uma lista (nunca nil): o JSON precisa ser [] e não null para o painel.
	recent := make([]recentError, len(o.recent))
	copy(recent, o.recent)
	return o.total, o.errors, out, recent
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	s.ok(w, http.StatusOK, map[string]any{"status": "ok", "time": time.Now().UTC().Format(time.RFC3339)})
}

type check struct {
	Status    string `json:"status"` // ok | error
	Kind      string `json:"kind,omitempty"`
	LatencyMs int64  `json:"latencyMs"`
}

func (s *Server) databaseCheck(ctx context.Context) check {
	start := time.Now()
	c := check{Status: "ok", Kind: s.store.Kind()}
	if err := s.store.Ping(ctx); err != nil {
		s.log.Warn("verificação do banco falhou", "error", err.Error())
		c.Status = "error"
	}
	c.LatencyMs = time.Since(start).Milliseconds()
	return c
}

func (s *Server) handleReady(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()
	db := s.databaseCheck(ctx)
	status, code := "ready", http.StatusOK
	if db.Status != "ok" {
		status, code = "degraded", http.StatusServiceUnavailable
	}
	// Mesmo com falha o corpo é o envelope padrão, sem detalhes internos.
	writeJSON(w, code, envelope{OK: code == http.StatusOK, Data: map[string]any{
		"status": status,
		"checks": map[string]check{"database": db},
	}})
}

func (s *Server) handleInfo(w http.ResponseWriter, r *http.Request) {
	commit := s.cfg.CommitSHA
	if len(commit) > 7 {
		commit = commit[:7]
	}
	s.ok(w, http.StatusOK, map[string]any{
		"service":       "portfolio-api",
		"environment":   s.cfg.Env,
		"commit":        commit,
		"uptimeSeconds": int64(time.Since(s.started).Seconds()),
		"features": map[string]bool{
			"metricsPersistent": s.store.Persistent(),
			"contact":           s.cfg.ContactEnabled(),
			"assistant":         false,
		},
	})
}

func (s *Server) handleOps(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()
	total, errs, routes, recent := s.ops.snapshot()
	s.ok(w, http.StatusOK, map[string]any{
		"scope":         "instance", // contadores valem apenas para a instância que respondeu
		"uptimeSeconds": int64(time.Since(s.started).Seconds()),
		"requests":      total,
		"errors":        errs,
		"routes":        routes,
		"recentErrors":  recent,
		"database":      s.databaseCheck(ctx),
	})
}

// handleAssistant reserva a rota do futuro assistente sobre o portfólio.
// Nada é inventado: enquanto não houver integração real, responde 501.
func (s *Server) handleAssistant(w http.ResponseWriter, r *http.Request) {
	s.fail(w, http.StatusNotImplemented, "not_implemented", "O assistente do portfólio ainda não está disponível.", nil)
}
