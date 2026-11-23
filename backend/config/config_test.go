package config

import (
	"strings"
	"testing"
)

// clearEnv zera todas as variáveis lidas por Load, para o teste não depender da máquina.
func clearEnv(t *testing.T) {
	t.Helper()
	for _, k := range []string{"APP_ENV", "VERCEL_ENV", "PORT", "ALLOWED_ORIGINS", "TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN",
		"SESSION_SECRET", "ADMIN_PASSWORD", "ADMIN_PASSWORD_SHA256", "RESEND_API_KEY", "CONTACT_TO_EMAIL",
		"CONTACT_FROM_EMAIL", "VERCEL_GIT_COMMIT_SHA"} {
		t.Setenv(k, "")
	}
}

func TestLoadDefaults(t *testing.T) {
	clearEnv(t)
	c := Load()
	if c.Env != "development" || c.Port != "8080" || c.IsProduction() {
		t.Fatalf("padrões incorretos: %+v", c)
	}
	if c.ContactFrom != "Portfólio <onboarding@resend.dev>" {
		t.Fatalf("remetente padrão incorreto: %q", c.ContactFrom)
	}
	if c.AdminEnabled() || c.ContactEnabled() {
		t.Fatal("sem variáveis, admin e contato devem estar desativados")
	}
}

func TestEnvSelection(t *testing.T) {
	clearEnv(t)
	t.Setenv("VERCEL_ENV", "preview")
	if got := Load().Env; got != "preview" {
		t.Fatalf("VERCEL_ENV deveria definir o ambiente, veio %q", got)
	}
	t.Setenv("APP_ENV", "production")
	c := Load()
	if c.Env != "production" || !c.IsProduction() {
		t.Fatalf("APP_ENV deve ter prioridade, veio %q", c.Env)
	}
}

func TestLoadTrimsAndNormalizes(t *testing.T) {
	clearEnv(t)
	t.Setenv("ALLOWED_ORIGINS", " https://a.example/ , ,https://b.example ")
	t.Setenv("TURSO_DATABASE_URL", "  libsql://x.turso.io \n")
	t.Setenv("TURSO_AUTH_TOKEN", " tok ")
	t.Setenv("ADMIN_PASSWORD_SHA256", "  ABCDEF  ")
	t.Setenv("PORT", "9000")
	c := Load()
	if len(c.AllowedOrigins) != 2 || c.AllowedOrigins[0] != "https://a.example" || c.AllowedOrigins[1] != "https://b.example" {
		t.Fatalf("origens incorretas: %#v", c.AllowedOrigins)
	}
	if c.TursoURL != "libsql://x.turso.io" || c.TursoToken != "tok" {
		t.Fatalf("Turso não foi normalizado: %q %q", c.TursoURL, c.TursoToken)
	}
	if c.AdminPasswordHash != "abcdef" {
		t.Fatalf("hash deve ficar em minúsculas e sem espaços: %q", c.AdminPasswordHash)
	}
	if c.Port != "9000" {
		t.Fatalf("PORT ignorada: %q", c.Port)
	}
}

func TestAdminEnabled(t *testing.T) {
	long := strings.Repeat("s", 32)
	cases := []struct {
		name string
		c    Config
		want bool
	}{
		{"nada", Config{}, false},
		{"segredo curto + senha", Config{SessionSecret: strings.Repeat("s", 31), AdminPassword: "x"}, false},
		{"segredo ok sem senha", Config{SessionSecret: long}, false},
		{"segredo + senha", Config{SessionSecret: long, AdminPassword: "x"}, true},
		{"segredo + hash", Config{SessionSecret: long, AdminPasswordHash: "ab"}, true},
	}
	for _, tc := range cases {
		if got := tc.c.AdminEnabled(); got != tc.want {
			t.Errorf("%s: AdminEnabled = %v, esperado %v", tc.name, got, tc.want)
		}
	}
}

func TestContactEnabled(t *testing.T) {
	if (Config{ResendAPIKey: "k"}).ContactEnabled() || (Config{ContactTo: "a@b.c"}).ContactEnabled() {
		t.Fatal("contato exige chave e destinatário")
	}
	if !(Config{ResendAPIKey: "k", ContactTo: "a@b.c"}).ContactEnabled() {
		t.Fatal("chave + destinatário devem habilitar o contato")
	}
}

func TestWarnings(t *testing.T) {
	if w := (Config{Env: "development"}).Warnings(); len(w) != 0 {
		t.Fatalf("desenvolvimento sem variáveis não deve gerar avisos: %v", w)
	}
	w := Config{Env: "production"}.Warnings()
	if len(w) != 3 {
		t.Fatalf("produção vazia deve avisar Turso, SESSION_SECRET e Resend; veio %v", w)
	}
	if w := (Config{Env: "development", TursoURL: "u"}).Warnings(); len(w) != 1 {
		t.Fatalf("Turso incompleto deve avisar: %v", w)
	}
	if w := (Config{Env: "development", AdminPassword: "p", AdminPasswordHash: "h"}).Warnings(); len(w) != 1 {
		t.Fatalf("senha + hash devem avisar prioridade: %v", w)
	}
}

func TestWarningsNeverLeakSecrets(t *testing.T) {
	c := Config{Env: "production", TursoURL: "libsql://segredo-url", SessionSecret: "curto-segredo", AdminPassword: "senha-secreta", AdminPasswordHash: "hash-secreto"}
	all := strings.Join(c.Warnings(), " ")
	for _, s := range []string{"segredo-url", "curto-segredo", "senha-secreta", "hash-secreto"} {
		if strings.Contains(all, s) {
			t.Fatalf("aviso vazou valor secreto %q: %s", s, all)
		}
	}
}
