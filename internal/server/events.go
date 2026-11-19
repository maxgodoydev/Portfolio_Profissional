package server

import (
	"context"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/maxgodoydev/portfolio/internal/store"
)

var (
	validLangs  = map[string]bool{"pt": true, "en": true, "es": true}
	validThemes = map[string]bool{"ice-tangerine": true, "cherry-cream": true, "sage-ink": true, "lavender-graphite": true, "monochrome-stone": true}
	slugRe      = regexp.MustCompile(`^[a-z0-9-]{1,60}$`)
	pathRe      = regexp.MustCompile(`^/[A-Za-z0-9/_\-.~]{0,199}$`)
	hostRe      = regexp.MustCompile(`^[a-z0-9.\-]{1,100}$`)
)

type eventIn struct {
	Type     string `json:"type"`
	Path     string `json:"path"`
	Target   string `json:"target"`
	Lang     string `json:"lang"`
	Theme    string `json:"theme"`
	Referrer string `json:"referrer"` // somente o domínio (hostname) de origem
}

// validateEvent valida os campos e devolve o evento normalizado ou os erros por campo.
func validateEvent(in eventIn) (store.Event, map[string]string) {
	errs := map[string]string{}
	e := store.Event{Type: in.Type, Path: in.Path, Target: in.Target, Lang: in.Lang, Theme: in.Theme}

	switch in.Type {
	case store.EventPageView:
		e.Target = ""
	case store.EventProjectView:
		if !slugRe.MatchString(in.Target) {
			errs["target"] = "slug de projeto inválido"
		}
	case store.EventResumeDownload:
		if !validLangs[in.Target] {
			errs["target"] = "idioma de currículo inválido"
		}
	case store.EventThemeChange:
		if !validThemes[in.Target] {
			errs["target"] = "tema inválido"
		}
	default:
		errs["type"] = "tipo de evento inválido"
	}
	if !pathRe.MatchString(in.Path) {
		errs["path"] = "caminho inválido"
	}
	if !validLangs[in.Lang] {
		errs["lang"] = "idioma inválido"
	}
	if in.Theme != "" && !validThemes[in.Theme] {
		errs["theme"] = "tema inválido"
	}
	if len(errs) > 0 {
		return store.Event{}, errs
	}
	return e, nil
}

// dedupeWindow define em quantos segundos eventos idênticos da mesma sessão são considerados repetidos.
func dedupeWindow(eventType string) int64 {
	switch eventType {
	case store.EventResumeDownload:
		return 60
	case store.EventThemeChange:
		return 5
	default:
		return 30
	}
}

func (s *Server) handleEvent(w http.ResponseWriter, r *http.Request) {
	// Respeita Do Not Track e Global Privacy Control.
	if r.Header.Get("DNT") == "1" || r.Header.Get("Sec-GPC") == "1" {
		s.ok(w, http.StatusAccepted, map[string]any{"recorded": false, "reason": "dnt"})
		return
	}
	// Acessos automatizados não entram nas métricas.
	if isBot(r.UserAgent()) {
		s.ok(w, http.StatusAccepted, map[string]any{"recorded": false, "reason": "automated"})
		return
	}
	if s.mem.hit("ev:"+s.limitKey(r), time.Minute, time.Now()) > 120 {
		w.Header().Set("Retry-After", "60")
		s.fail(w, http.StatusTooManyRequests, "rate_limited", "Muitas requisições. Tente novamente em instantes.", nil)
		return
	}

	var in eventIn
	if err := decodeJSON(w, r, &in, 4<<10); err != nil {
		s.fail(w, http.StatusBadRequest, "invalid_body", err.Error(), nil)
		return
	}
	e, errs := validateEvent(in)
	if errs != nil {
		s.fail(w, http.StatusUnprocessableEntity, "validation_error", "Evento inválido.", errs)
		return
	}

	now := time.Now().UTC()
	ref := strings.ToLower(strings.TrimSpace(in.Referrer))
	if !hostRe.MatchString(ref) {
		ref = ""
	}
	e.TS = now.Unix()
	e.Device = deviceOf(r.UserAgent())
	e.Source = sourceOf(ref, r.Host)
	e.Session = s.sessionHash(r, now)
	e.Dedupe = shortHash(e.Session, e.Type, e.Path, e.Target, formatInt(e.TS/dedupeWindow(e.Type)))

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	inserted, err := s.store.InsertEvent(ctx, e)
	if err != nil {
		s.log.Error("falha ao gravar evento", "error", err.Error())
		s.fail(w, http.StatusServiceUnavailable, "store_unavailable", "Não foi possível registrar o evento.", nil)
		return
	}
	s.ok(w, http.StatusAccepted, map[string]any{"recorded": inserted})
}

func formatInt(n int64) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var b [20]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		b[i] = '-'
	}
	return string(b[i:])
}
