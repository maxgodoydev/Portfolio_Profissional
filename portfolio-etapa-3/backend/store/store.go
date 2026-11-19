// Package store define a persistência de eventos de acesso e a agregação das métricas.
package store

import (
	"context"
	"sort"
	"time"
)

// Tipos de evento aceitos.
const (
	EventPageView       = "pageview"
	EventProjectView    = "project_view"
	EventResumeDownload = "resume_download"
	EventThemeChange    = "theme_change"
)

// Event é um registro anônimo de uso. Não contém IP, user agent nem identificadores persistentes.
type Event struct {
	TS      int64  `json:"ts"` // segundos Unix (UTC)
	Type    string `json:"type"`
	Path    string `json:"path"`
	Target  string `json:"target"` // slug do projeto, idioma do currículo ou id do tema
	Lang    string `json:"lang"`
	Theme   string `json:"theme"`
	Device  string `json:"device"` // mobile | tablet | desktop
	Source  string `json:"source"` // direct | search | social | github | linkedin | other
	Session string `json:"-"`      // hash anônimo, rotativo por dia
	Dedupe  string `json:"-"`
}

// Store é o contrato de persistência usado pela API.
type Store interface {
	// Kind descreve a implementação ("turso" ou "memory").
	Kind() string
	// Persistent informa se os dados sobrevivem a reinicializações.
	Persistent() bool
	Ping(ctx context.Context) error
	// InsertEvent grava o evento. Retorna false quando for duplicado.
	InsertEvent(ctx context.Context, e Event) (bool, error)
	// EventsSince lista eventos a partir de um instante (limitado).
	EventsSince(ctx context.Context, since time.Time) ([]Event, error)
	// Hit incrementa e devolve o contador da chave na janela atual (limite de requisições).
	Hit(ctx context.Context, key string, window time.Duration, now time.Time) (int, error)
	// Prune remove dados antigos.
	Prune(ctx context.Context, before time.Time) error
}

// ---- Agregação (compartilhada entre as implementações) ----

// Count é um par rótulo/valor.
type Count struct {
	Label string `json:"label"`
	Value int    `json:"value"`
}

// DayPoint é um ponto da série diária.
type DayPoint struct {
	Date      string `json:"date"` // AAAA-MM-DD (UTC)
	PageViews int    `json:"pageViews"`
	Sessions  int    `json:"sessions"`
}

// Stats é o resumo exibido no painel administrativo.
type Stats struct {
	Days            int        `json:"days"`
	From            string     `json:"from"`
	To              string     `json:"to"`
	TotalPageViews  int        `json:"totalPageViews"`
	TotalSessions   int        `json:"totalSessions"` // sessões únicas por dia, somadas
	ProjectViews    int        `json:"projectViews"`
	ResumeDownloads int        `json:"resumeDownloads"`
	Daily           []DayPoint `json:"daily"`
	TopPages        []Count    `json:"topPages"`
	TopProjects     []Count    `json:"topProjects"`
	ResumeByLang    []Count    `json:"resumeByLang"`
	Languages       []Count    `json:"languages"`
	Devices         []Count    `json:"devices"`
	Sources         []Count    `json:"sources"`
	Themes          []Count    `json:"themes"`
}

// Aggregate calcula as estatísticas de um conjunto de eventos já filtrado por período.
func Aggregate(events []Event, from, to time.Time) Stats {
	days := int(to.Sub(from).Hours()/24) + 1
	s := Stats{Days: days, From: from.Format("2006-01-02"), To: to.Format("2006-01-02")}

	type dayAgg struct {
		views    int
		sessions map[string]struct{}
	}
	perDay := map[string]*dayAgg{}
	for d := from; !d.After(to); d = d.AddDate(0, 0, 1) {
		perDay[d.Format("2006-01-02")] = &dayAgg{sessions: map[string]struct{}{}}
	}

	pages := map[string]int{}
	projects := map[string]int{}
	resume := map[string]int{}
	langs := map[string]int{}
	devices := map[string]int{}
	sources := map[string]int{}
	themes := map[string]int{}

	for _, e := range events {
		day := time.Unix(e.TS, 0).UTC().Format("2006-01-02")
		agg, ok := perDay[day]
		if !ok {
			continue
		}
		switch e.Type {
		case EventPageView:
			s.TotalPageViews++
			agg.views++
			agg.sessions[e.Session] = struct{}{}
			pages[e.Path]++
			langs[e.Lang]++
			devices[e.Device]++
			sources[e.Source]++
		case EventProjectView:
			s.ProjectViews++
			projects[e.Target]++
		case EventResumeDownload:
			s.ResumeDownloads++
			resume[e.Target]++
		case EventThemeChange:
			themes[e.Target]++
		}
	}

	for d := from; !d.After(to); d = d.AddDate(0, 0, 1) {
		key := d.Format("2006-01-02")
		agg := perDay[key]
		s.TotalSessions += len(agg.sessions)
		s.Daily = append(s.Daily, DayPoint{Date: key, PageViews: agg.views, Sessions: len(agg.sessions)})
	}
	s.TopPages = top(pages, 10)
	s.TopProjects = top(projects, 10)
	s.ResumeByLang = top(resume, 10)
	s.Languages = top(langs, 10)
	s.Devices = top(devices, 10)
	s.Sources = top(sources, 10)
	s.Themes = top(themes, 10)
	return s
}

func top(m map[string]int, n int) []Count {
	out := make([]Count, 0, len(m))
	for k, v := range m {
		out = append(out, Count{Label: k, Value: v})
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Value != out[j].Value {
			return out[i].Value > out[j].Value
		}
		return out[i].Label < out[j].Label
	})
	if len(out) > n {
		out = out[:n]
	}
	return out
}
