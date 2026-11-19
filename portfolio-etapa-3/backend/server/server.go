// Package server implementa a API REST do portfólio com net/http.
package server

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"runtime/debug"
	"strings"
	"time"

	"github.com/maxgodoydev/portfolio/backend/config"
	"github.com/maxgodoydev/portfolio/backend/store"
)

// Server reúne dependências e rotas.
type Server struct {
	cfg     config.Config
	store   store.Store
	log     *slog.Logger
	started time.Time
	mem     *memLimiter
	ops     *opsCounters
	routes  map[string]http.HandlerFunc
	paths   map[string]bool

	// hashSecret alimenta os hashes anônimos (sessão de métricas e limite de requisições).
	// Vem de SESSION_SECRET; se faltar, um segredo aleatório por instância — nunca um valor fixo,
	// que permitiria reverter os hashes por força bruta sobre IPs conhecidos.
	hashSecret string
	// resendURL é o endpoint de envio de e-mail (substituível nos testes).
	resendURL string
}

// NewLogger cria um logger JSON (logs estruturados) em stdout.
func NewLogger() *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
}

// StoreFromConfig escolhe o armazenamento: Turso quando configurado, memória caso contrário.
func StoreFromConfig(cfg config.Config, log *slog.Logger) store.Store {
	if cfg.TursoURL != "" && cfg.TursoToken != "" {
		t, err := store.NewTurso(cfg.TursoURL, cfg.TursoToken)
		if err == nil {
			return t
		}
		log.Error("turso inválido, usando memória", "error", err.Error())
	}
	// Ausência ou configuração parcial já foi avisada por cfg.Warnings() em New.
	return store.NewMemory()
}

// New monta o servidor.
func New(cfg config.Config, st store.Store, log *slog.Logger) *Server {
	s := &Server{
		cfg:     cfg,
		store:   st,
		log:     log,
		started: time.Now(),
		mem:     newMemLimiter(),
		ops:     newOps(),
		routes:  map[string]http.HandlerFunc{},
		paths:   map[string]bool{},

		hashSecret: cfg.SessionSecret,
		resendURL:  resendEndpoint,
	}
	if s.hashSecret == "" {
		s.hashSecret = newSecret()
	}
	for _, w := range cfg.Warnings() {
		log.Warn(w)
	}
	s.handle("GET", "health", s.handleHealth)
	s.handle("GET", "ready", s.handleReady)
	s.handle("GET", "info", s.handleInfo)
	s.handle("POST", "events", s.handleEvent)
	s.handle("POST", "contact", s.handleContact)
	s.handle("POST", "assistant", s.handleAssistant)
	s.handle("POST", "admin/login", s.handleLogin)
	s.handle("POST", "admin/logout", s.handleLogout)
	s.handle("GET", "admin/session", s.requireAdmin(s.handleSession))
	s.handle("GET", "admin/stats", s.requireAdmin(s.handleStats))
	s.handle("GET", "admin/ops", s.requireAdmin(s.handleOps))
	return s
}

func (s *Server) handle(method, path string, h http.HandlerFunc) {
	s.routes[method+" "+path] = h
	s.paths[path] = true
}

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

// routeOf extrai a rota da requisição. Na Vercel, o rewrite envia o caminho em ?path=;
// no servidor local ele vem em r.URL.Path (/api/...).
func routeOf(r *http.Request) string {
	p := r.URL.Query().Get("path")
	if p == "" {
		p = strings.TrimPrefix(r.URL.Path, "/api")
	}
	return strings.Trim(p, "/")
}

// newSecret gera 32 bytes aleatórios (hex). Se o sistema não fornecer aleatoriedade,
// usa um valor derivado do horário — ainda imprevisível o bastante para este fim.
func newSecret() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return shortHash("fallback", time.Now().String())
	}
	return hex.EncodeToString(b)
}

func newID() string {
	b := make([]byte, 6)
	if _, err := rand.Read(b); err != nil {
		return "unknown"
	}
	return hex.EncodeToString(b)
}

// ServeHTTP é o ponto de entrada de toda requisição à API.
func (s *Server) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	start := time.Now()
	route := routeOf(r)
	w := &statusWriter{ResponseWriter: rw, status: http.StatusOK}
	rid := newID()

	h := w.Header()
	h.Set("X-Request-ID", rid)
	h.Set("Cache-Control", "no-store")
	h.Set("X-Content-Type-Options", "nosniff")

	defer func() {
		if rec := recover(); rec != nil {
			// O stack trace vai apenas para o log do servidor, nunca para o visitante.
			s.log.Error("panic", "id", rid, "route", route, "panic", rec, "stack", string(debug.Stack()))
			s.fail(w, http.StatusInternalServerError, "internal_error", "Erro interno do servidor.", nil)
		}
		dur := time.Since(start)
		known := route
		if !s.paths[route] {
			known = "(desconhecida)"
		}
		s.ops.record(known, w.status, dur, rid)
		s.log.Info("request", "id", rid, "method", r.Method, "route", known, "status", w.status, "ms", dur.Milliseconds())
	}()

	if !s.applyCORS(w, r) {
		s.fail(w, http.StatusForbidden, "origin_not_allowed", "Origem não permitida.", nil)
		return
	}
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if handler, found := s.routes[r.Method+" "+route]; found {
		handler(w, r)
		return
	}
	if s.paths[route] {
		s.fail(w, http.StatusMethodNotAllowed, "method_not_allowed", "Método não permitido.", nil)
		return
	}
	s.fail(w, http.StatusNotFound, "not_found", "Recurso não encontrado.", nil)
}

// applyCORS permite a própria origem e as listadas em ALLOWED_ORIGINS.
// Requisições sem cabeçalho Origin (mesma origem, curl) passam normalmente.
func (s *Server) applyCORS(w http.ResponseWriter, r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	w.Header().Add("Vary", "Origin")
	if !s.originAllowed(r, origin) {
		return false
	}
	h := w.Header()
	h.Set("Access-Control-Allow-Origin", origin)
	h.Set("Access-Control-Allow-Credentials", "true")
	h.Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	h.Set("Access-Control-Allow-Headers", "Content-Type")
	h.Set("Access-Control-Max-Age", "600")
	return true
}

func (s *Server) originAllowed(r *http.Request, origin string) bool {
	u, err := url.Parse(origin)
	if err != nil || u.Host == "" {
		return false
	}
	if strings.EqualFold(u.Host, r.Host) {
		return true
	}
	for _, o := range s.cfg.AllowedOrigins {
		if strings.EqualFold(o, origin) {
			return true
		}
	}
	return false
}

// allow aplica um limite persistente (banco) e, se o banco falhar, cai para a memória.
func (s *Server) allow(ctx context.Context, bucket, id string, max int, window time.Duration) bool {
	key := bucket + ":" + id
	n, err := s.store.Hit(ctx, key, window, time.Now())
	if err != nil {
		s.log.Warn("limite persistente indisponível, usando memória", "bucket", bucket, "error", err.Error())
		n = s.mem.hit(key, window, time.Now())
	}
	return n <= max
}
