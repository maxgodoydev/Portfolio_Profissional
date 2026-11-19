package server

import (
	"crypto/sha256"
	"encoding/hex"
	"net"
	"net/http"
	"strings"
	"time"
)

// clientIP devolve o IP do visitante. Atrás da Vercel, usa os cabeçalhos do proxy.
// O IP nunca é gravado: serve apenas para limitar requisições e gerar um hash anônimo.
func clientIP(r *http.Request) string {
	if v := strings.TrimSpace(r.Header.Get("X-Real-IP")); v != "" {
		return v
	}
	if v := r.Header.Get("X-Forwarded-For"); v != "" {
		return strings.TrimSpace(strings.Split(v, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func shortHash(parts ...string) string {
	sum := sha256.Sum256([]byte(strings.Join(parts, "|")))
	return hex.EncodeToString(sum[:])
}

// sessionHash gera um identificador anônimo que muda todos os dias (não permite
// acompanhar a mesma pessoa por vários dias).
func (s *Server) sessionHash(r *http.Request, now time.Time) string {
	return shortHash(s.hashSecret, now.UTC().Format("2006-01-02"), clientIP(r), r.UserAgent())[:20]
}

// limitKey é o identificador usado nos limites de requisição (hash do IP).
func (s *Server) limitKey(r *http.Request) string {
	return shortHash("rl", s.hashSecret, clientIP(r))[:20]
}

var botMarkers = []string{
	"bot", "crawl", "spider", "slurp", "headless", "curl/", "wget", "python-requests",
	"httpclient", "go-http-client", "node-fetch", "axios", "lighthouse", "pingdom",
	"uptime", "monitor", "facebookexternalhit", "preview",
}

func isBot(ua string) bool {
	l := strings.ToLower(strings.TrimSpace(ua))
	if l == "" {
		return true
	}
	for _, m := range botMarkers {
		if strings.Contains(l, m) {
			return true
		}
	}
	return false
}

func deviceOf(ua string) string {
	l := strings.ToLower(ua)
	switch {
	case strings.Contains(l, "ipad") || strings.Contains(l, "tablet"):
		return "tablet"
	case strings.Contains(l, "android") && !strings.Contains(l, "mobi"):
		return "tablet"
	case strings.Contains(l, "mobi") || strings.Contains(l, "iphone") || strings.Contains(l, "android"):
		return "mobile"
	default:
		return "desktop"
	}
}

// sourceOf classifica o domínio de origem em categorias gerais.
func sourceOf(refHost, ownHost string) string {
	h := strings.ToLower(strings.TrimPrefix(strings.TrimSpace(refHost), "www."))
	own := strings.ToLower(strings.TrimPrefix(ownHost, "www."))
	if i := strings.LastIndex(own, ":"); i > 0 {
		own = own[:i]
	}
	switch {
	case h == "" || h == own:
		return "direct"
	case strings.Contains(h, "google.") || strings.Contains(h, "bing.") ||
		strings.Contains(h, "duckduckgo.") || strings.Contains(h, "yahoo.") || strings.Contains(h, "ecosia."):
		return "search"
	case strings.Contains(h, "linkedin.") || h == "lnkd.in":
		return "linkedin"
	case strings.Contains(h, "github."):
		return "github"
	case strings.Contains(h, "facebook.") || strings.Contains(h, "instagram.") || strings.Contains(h, "twitter.") ||
		h == "t.co" || h == "x.com" || strings.Contains(h, "whatsapp.") || strings.Contains(h, "reddit."):
		return "social"
	default:
		return "other"
	}
}
