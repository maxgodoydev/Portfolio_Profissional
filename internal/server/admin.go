package server

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/maxgodoydev/portfolio/internal/store"
)

const (
	cookieName    = "admin_session"
	sessionTTL    = 8 * time.Hour
	retentionDays = 400

	// globalLoginMax: tentativas de login (de qualquer origem) permitidas a cada 15 minutos.
	globalLoginMax = 30
)

// failedLoginDelay é a pausa após senha errada (variável para os testes não esperarem).
var failedLoginDelay = 400 * time.Millisecond

type loginIn struct {
	Password string `json:"password"`
}

func (s *Server) sign(exp string) string {
	m := hmac.New(sha256.New, []byte(s.cfg.SessionSecret))
	m.Write([]byte("admin:" + exp))
	return hex.EncodeToString(m.Sum(nil))
}

func (s *Server) newSessionValue(now time.Time) string {
	exp := strconv.FormatInt(now.Add(sessionTTL).Unix(), 10)
	return exp + "." + s.sign(exp)
}

func (s *Server) validSession(value string, now time.Time) bool {
	parts := strings.SplitN(value, ".", 2)
	if len(parts) != 2 {
		return false
	}
	exp, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil || exp < now.Unix() {
		return false
	}
	return hmac.Equal([]byte(parts[1]), []byte(s.sign(parts[0])))
}

func (s *Server) passwordOK(password string) bool {
	sum := sha256.Sum256([]byte(password))
	if s.cfg.AdminPasswordHash != "" {
		return subtle.ConstantTimeCompare([]byte(hex.EncodeToString(sum[:])), []byte(s.cfg.AdminPasswordHash)) == 1
	}
	want := sha256.Sum256([]byte(s.cfg.AdminPassword))
	return subtle.ConstantTimeCompare(sum[:], want[:]) == 1
}

func isSecure(r *http.Request) bool {
	return r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https"
}

func (s *Server) requireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !s.cfg.AdminEnabled() {
			s.fail(w, http.StatusServiceUnavailable, "admin_disabled", "A área administrativa não está configurada.", nil)
			return
		}
		c, err := r.Cookie(cookieName)
		if err != nil || !s.validSession(c.Value, time.Now()) {
			s.fail(w, http.StatusUnauthorized, "unauthorized", "Sessão inválida ou expirada.", nil)
			return
		}
		next(w, r)
	}
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	if !s.cfg.AdminEnabled() {
		s.fail(w, http.StatusServiceUnavailable, "admin_disabled", "A área administrativa não está configurada.", nil)
		return
	}
	var in loginIn
	if err := decodeJSON(w, r, &in, 2<<10); err != nil {
		s.fail(w, http.StatusBadRequest, "invalid_body", err.Error(), nil)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 6*time.Second)
	defer cancel()
	if !s.allow(ctx, "login", s.limitKey(r), 5, 15*time.Minute) {
		w.Header().Set("Retry-After", "900")
		s.fail(w, http.StatusTooManyRequests, "rate_limited", "Muitas tentativas. Aguarde alguns minutos.", nil)
		return
	}
	// Limite global, independente do IP: o IP vem de cabeçalhos que, fora da Vercel (que os define
	// sozinha), o cliente pode forjar para fugir do limite acima. Custo: um atacante pode bloquear
	// o login por até 15 min (o painel é de uso pessoal; a alternativa seria aceitar força bruta).
	if !s.allow(ctx, "login-global", "all", globalLoginMax, 15*time.Minute) {
		w.Header().Set("Retry-After", "900")
		s.fail(w, http.StatusTooManyRequests, "rate_limited", "Muitas tentativas. Aguarde alguns minutos.", nil)
		return
	}
	if !s.passwordOK(in.Password) {
		time.Sleep(failedLoginDelay) // desacelera tentativas em sequência
		s.fail(w, http.StatusUnauthorized, "invalid_credentials", "Credenciais inválidas.", nil)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    s.newSessionValue(time.Now()),
		Path:     "/api",
		MaxAge:   int(sessionTTL.Seconds()),
		HttpOnly: true,
		Secure:   isSecure(r),
		SameSite: http.SameSiteStrictMode,
	})
	s.ok(w, http.StatusOK, map[string]any{"authenticated": true})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name: cookieName, Value: "", Path: "/api", MaxAge: -1,
		HttpOnly: true, Secure: isSecure(r), SameSite: http.SameSiteStrictMode,
	})
	s.ok(w, http.StatusOK, map[string]any{"authenticated": false})
}

func (s *Server) handleSession(w http.ResponseWriter, r *http.Request) {
	s.ok(w, http.StatusOK, map[string]any{"authenticated": true})
}

type statsOut struct {
	store.Stats
	Persistent bool   `json:"persistent"`
	StoreKind  string `json:"store"`
}

func (s *Server) handleStats(w http.ResponseWriter, r *http.Request) {
	days := 30
	if v := r.URL.Query().Get("days"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n < 1 || n > 365 {
			s.fail(w, http.StatusUnprocessableEntity, "validation_error", "days deve estar entre 1 e 365.", map[string]string{"days": "valor inválido"})
			return
		}
		days = n
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	from := today.AddDate(0, 0, -(days - 1))

	events, err := s.store.EventsSince(ctx, from)
	if err != nil {
		s.log.Error("falha ao ler eventos", "error", err.Error())
		s.fail(w, http.StatusServiceUnavailable, "store_unavailable", "Não foi possível ler as métricas.", nil)
		return
	}
	// Retenção: dados com mais de 400 dias são removidos quando o painel é aberto.
	if err := s.store.Prune(ctx, now.AddDate(0, 0, -retentionDays)); err != nil {
		s.log.Warn("falha ao limpar dados antigos", "error", err.Error())
	}
	s.ok(w, http.StatusOK, statsOut{
		Stats:      store.Aggregate(events, from, today),
		Persistent: s.store.Persistent(),
		StoreKind:  s.store.Kind(),
	})
}
