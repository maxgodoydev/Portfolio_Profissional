// Package config carrega a configuração da aplicação a partir de variáveis de ambiente.
package config

import (
	"os"
	"strconv"
	"strings"
)

// Config reúne tudo o que o backend lê do ambiente. Nenhum valor secreto
// possui padrão: se a variável não existir, o recurso correspondente fica desativado.
type Config struct {
	Env            string   // development | preview | production
	Port           string   // usado apenas por cmd/server
	AllowedOrigins []string // origens extras permitidas por CORS (além da própria origem)

	TursoURL   string
	TursoToken string

	SessionSecret     string // assina o cookie do admin e gera hashes anônimos
	AdminPassword     string
	AdminPasswordHash string // SHA-256 em hexadecimal (alternativa à senha em texto)

	ResendAPIKey string
	ContactTo    string
	ContactFrom  string

	CommitSHA string
}

// Load lê as variáveis de ambiente.
func Load() Config {
	env := get("APP_ENV", "")
	if env == "" {
		env = get("VERCEL_ENV", "development")
	}
	return Config{
		Env:               env,
		Port:              get("PORT", "8080"),
		AllowedOrigins:    splitList(os.Getenv("ALLOWED_ORIGINS")),
		TursoURL:          strings.TrimSpace(os.Getenv("TURSO_DATABASE_URL")),
		TursoToken:        strings.TrimSpace(os.Getenv("TURSO_AUTH_TOKEN")),
		SessionSecret:     os.Getenv("SESSION_SECRET"),
		AdminPassword:     os.Getenv("ADMIN_PASSWORD"),
		AdminPasswordHash: strings.ToLower(strings.TrimSpace(os.Getenv("ADMIN_PASSWORD_SHA256"))),
		ResendAPIKey:      strings.TrimSpace(os.Getenv("RESEND_API_KEY")),
		ContactTo:         strings.TrimSpace(os.Getenv("CONTACT_TO_EMAIL")),
		ContactFrom:       get("CONTACT_FROM_EMAIL", "Portfólio <onboarding@resend.dev>"),
		CommitSHA:         get("VERCEL_GIT_COMMIT_SHA", ""),
	}
}

// IsProduction indica se o ambiente é de produção.
func (c Config) IsProduction() bool { return c.Env == "production" }

// AdminEnabled informa se há credenciais e segredo suficientes para o painel.
func (c Config) AdminEnabled() bool {
	return len(c.SessionSecret) >= 32 && (c.AdminPassword != "" || c.AdminPasswordHash != "")
}

// ContactEnabled informa se o envio de e-mail está configurado.
func (c Config) ContactEnabled() bool { return c.ResendAPIKey != "" && c.ContactTo != "" }

// Warnings lista, em linguagem clara, o que está ausente ou incompleto na configuração.
// Nunca inclui valores (segredos) — só os nomes das variáveis. Usado no log de inicialização.
func (c Config) Warnings() []string {
	var w []string
	if (c.TursoURL == "") != (c.TursoToken == "") {
		w = append(w, "configuração do Turso incompleta: defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN juntas; usando memória")
	}
	if c.IsProduction() {
		if c.TursoURL == "" && c.TursoToken == "" {
			w = append(w, "TURSO_DATABASE_URL/TURSO_AUTH_TOKEN ausentes: métricas e limites de requisição não serão persistentes")
		}
		if len(c.SessionSecret) < 32 {
			w = append(w, "SESSION_SECRET ausente ou curto (<32 caracteres): painel administrativo desativado e hashes anônimos usam segredo aleatório por instância")
		}
		if !c.ContactEnabled() {
			w = append(w, "RESEND_API_KEY/CONTACT_TO_EMAIL ausentes: o formulário de contato responderá 503")
		}
	}
	if c.AdminPassword != "" && c.AdminPasswordHash != "" {
		w = append(w, "ADMIN_PASSWORD e ADMIN_PASSWORD_SHA256 definidos: o hash tem prioridade")
	}
	return w
}

func get(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func splitList(s string) []string {
	var out []string
	for _, p := range strings.Split(s, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, strings.TrimRight(p, "/"))
		}
	}
	return out
}

// Itoa é um pequeno auxiliar para formatar inteiros em logs e mensagens.
func Itoa(n int) string { return strconv.Itoa(n) }
